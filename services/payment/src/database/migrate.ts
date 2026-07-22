import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' });
  await pool.end();
}

run()
  .then(() => {
    console.log('migrations applied');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
