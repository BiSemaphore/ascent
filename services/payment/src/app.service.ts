import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DB } from './database/database.module';
import type { Database } from './database/database.module';

@Injectable()
export class AppService {
  constructor(@Inject(DB) private readonly db: Database) {}

  async health() {
    await this.db.execute(sql`select 1`);
    return { status: 'ok', db: 'up' };
  }
}
