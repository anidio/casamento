// Coloca um casamento de teste no banco configurado em .env.local.
// Rode com: npm run db:seed  →  depois abra http://localhost:3000/joao-e-maria
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { seed, TEST_SLUG } from "./seed-data";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não encontrada no .env.local");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const wedding = await seed(db);
  await pool.end();
  console.log(`✓ Casamento de teste criado: ${wedding.partner1} & ${wedding.partner2}`);
  console.log(`  Abra http://localhost:3000/${TEST_SLUG}`);
}

main().catch((e) => {
  console.error("✗ Falhou:", e.message);
  process.exit(1);
});
