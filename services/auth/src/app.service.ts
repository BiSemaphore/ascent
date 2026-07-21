import { Inject, Injectable } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DB } from './database/database.module';
import type { Database } from './database/database.module';
import { MONGO } from './mongo/mongo.module';
import type { Db } from 'mongodb';

@Injectable()
export class AppService {
  constructor(
    @Inject(DB) private readonly db: Database,
    @Inject(MONGO) private readonly mongo: Db,
  ) {}

  async health() {
    await this.db.execute(sql`select 1`);
    await this.mongo.command({ ping: 1 });
    return { status: 'ok', db: 'up', mongo: 'up' };
  }
}
