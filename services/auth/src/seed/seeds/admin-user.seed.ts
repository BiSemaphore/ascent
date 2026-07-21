import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { users } from '../../database/schema';
import type { Seed } from '../seed.interface';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@ascent.local';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';

export const adminUserSeed: Seed = {
  name: 'admin-user',
  async run(db) {
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
