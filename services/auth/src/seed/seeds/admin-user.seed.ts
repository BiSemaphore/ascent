import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema';
import type { Seed } from '../seed.interface';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@ascent.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

/**
 * Seeds a single admin account from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
 * No password is hardcoded: when `SEED_ADMIN_PASSWORD` is unset the seed is
 * skipped, so a deployment never ships with a known default admin login.
 */
export const adminUserSeed: Seed = {
  name: 'admin-user',
  async run(db) {
    if (!ADMIN_PASSWORD) {
      console.warn(
        'admin-user seed skipped: set SEED_ADMIN_PASSWORD to seed an admin',
      );
      return;
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, ADMIN_EMAIL))
      .limit(1);
    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await db
      .insert(users)
      .values({ email: ADMIN_EMAIL, passwordHash, role: 'admin' });
  },
};
