import "server-only";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Conexão via node-postgres. Funciona com o Neon (use a URL "pooled") e com
// qualquer Postgres local, e suporta transações (o login precisa).
// Sem DATABASE_URL o site roda só com o casamento de exemplo (/demo).

export type DB = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { pool?: Pool };

function createPool(url: string) {
  return new Pool({
    connectionString: url,
    max: 5,
    // O Neon desliga o banco depois de alguns minutos parado; conexões
    // ociosas são fechadas antes disso para não dar erro de conexão morta.
    idleTimeoutMillis: 30_000,
  });
}

const url = process.env.DATABASE_URL;
const pool = url ? (globalForDb.pool ??= createPool(url)) : undefined;

export const db: DB | null = pool ? drizzle(pool, { schema }) : null;

export function requireDb(): DB {
  if (!db) throw new Error("DATABASE_URL não configurada. Veja o README (seção Banco).");
  return db;
}
