import { Inject, Injectable, Logger } from '@nestjs/common';
import { DB } from '../database/database.module';
import { adminUserSeed } from './seeds/admin-user.seed';
import type { Database } from '../database/database.module';
import type { Seed } from './seed.interface';

/** Runs the registered seeds in order. Each seed is idempotent (safe to re-run). */
@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  private readonly seeds: Seed[] = [adminUserSeed];

  constructor(@Inject(DB) private readonly db: Database) {}

  /** Execute every registered seed against the database. */
  async run() {
    for (const seed of this.seeds) {
      await seed.run(this.db);
      this.logger.log(`seeded: ${seed.name}`);
    }
  }
}
