import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type { EventEnvelope } from '@ascent/contracts';

/** DI token for the Kafka client used by {@link KafkaPublisher}. */
export const KAFKA_CLIENT = 'KAFKA_CLIENT';

/** Thin wrapper over the NestJS Kafka client that publishes event envelopes. */
@Injectable()
export class KafkaPublisher implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject(KAFKA_CLIENT) private readonly client: ClientKafka) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  /**
   * Publish an event envelope to a topic and wait for the broker ack.
   * @param topic - the Kafka topic to emit to
   * @param event - the envelope to publish
   */
  async emit<T>(topic: string, event: EventEnvelope<T>) {
    await lastValueFrom(this.client.emit(topic, event));
  }
}
