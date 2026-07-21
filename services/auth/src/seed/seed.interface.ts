import type { Database } from '../database/database.module';

export interface Seed {
  name: string;
  run(db: Database): Promise<void>;
}
