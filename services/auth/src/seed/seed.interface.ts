import type { Database } from '../database/database.module';

/** A single, idempotent database seed. */
export interface Seed {
  /** Identifier logged when the seed runs. */
  name: string;
  /** Apply the seed; must be safe to run more than once. */
  run(db: Database): Promise<void>;
}
