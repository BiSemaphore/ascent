import { Inject, Injectable, Logger } from '@nestjs/common';
import { DB } from '../database/database.module';
import { adminUserSeed } from './seeds/admin-user.seed';
import type { Database } from '../database/database.module';
import type { Seed } from './seed.interface';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  private readonly seeds: Seed[] = [adminUserSeed];

  constructor(@Inject(DB) private readonly db: Database) {}

  async run() {
    for (const seed of this.seeds) {
      await seed.run(this.db);
      this.logger.log(`seeded: ${seed.name}`);
    }
  }
}
