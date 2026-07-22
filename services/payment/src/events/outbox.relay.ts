import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { asc, eq, isNull } from 'drizzle-orm';
import { DB } from '../database/database.module';
import { outbox } from '../database/schema';
import { KafkaPublisher } from './kafka.publisher';
import type { Database } from '../database/database.module';
import type { EventEnvelope } from '@ascent/contracts';

const POLL_MS = 1000;
const BATCH = 50;

/**
 * Publishes the Transactional Outbox to Kafka. Polls unpublished rows on an
 * interval, emits each to its topic, and stamps `published_at`. Uses
 * `FOR UPDATE SKIP LOCKED` so multiple replicas never publish the same row; a
 * crash mid-publish just re-publishes next tick (at-least-once).
 */
@Injectable()
export class OutboxRelay implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelay.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly publisher: KafkaPublisher,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.flush(), POLL_MS);
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /** Publish one batch of unpublished outbox rows; skips if a flush is in flight. */
  private async flush() {
    if (this.running) {
      return;
    }
    this.running = true;
    try {
      await this.db.transaction(async (tx) => {
        const rows = await tx
          .select()
          .from(outbox)
          .where(isNull(outbox.publishedAt))
          .orderBy(asc(outbox.createdAt))
          .limit(BATCH)
          .for('update', { skipLocked: true });

        for (const row of rows) {
          await this.publisher.emit(
            row.topic,
            row.payload as EventEnvelope<unknown>,
          );
          await tx
            .update(outbox)
            .set({ publishedAt: new Date() })
            .where(eq(outbox.id, row.id));
        }
        if (rows.length > 0) {
          this.logger.log(`relayed ${rows.length} outbox event(s)`);
        }
      });
    } catch (err) {
      this.logger.error(`outbox flush failed: ${(err as Error).message}`);
    } finally {
      this.running = false;
    }
  }
}
