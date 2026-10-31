// Testa as migrações e as consultas num Postgres em memória (PGlite),
// sem precisar do Neon. Rode com: npm run db:test
import { PGlite } from "@electric-sql/pglite";
import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "../src/db/schema";
import { toGift, toWedding } from "../src/lib/mappers";
import { seed } from "./seed-data";

const db = drizzle(new PGlite(), { schema });

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });

  await db.insert(schema.user).values({ id: "u1", name: "Noiva", email: "noiva@exemplo.com" });
  const [w] = await db
    .insert(schema.weddings)
    .values({
      ownerId: "u1",
      slug: "joao-e-maria",
      partner1: "João",
      partner2: "Maria",
      weddingDate: new Date("2027-05-01T16:00:00-03:00"),
      ceremony: { name: "Igreja", address: "Rua A, 1", time: "16h", mapsUrl: "" },
      pixKey: "joao@exemplo.com",
      pixReceiverName: "Joao Silva",
      published: true,
    })
    .returning();
  await db.insert(schema.gifts).values([
    { weddingId: w.id, name: "Presente B", priceCents: 5000, position: 2 },
    { weddingId: w.id, name: "Presente A", priceCents: 9000, position: 1 },
    { weddingId: w.id, name: "Inativo", priceCents: 100, active: false },
  ]);

  const [row] = await db.select().from(schema.weddings).where(and(eq(schema.weddings.slug, "joao-e-maria"), eq(schema.weddings.published, true)));
  const wedding = toWedding(row);
  const gifts = (
    await db.select().from(schema.gifts).where(and(eq(schema.gifts.weddingId, w.id), eq(schema.gifts.active, true))).orderBy(asc(schema.gifts.position))
  ).map(toGift);

  console.assert(wedding.partner1 === "João" && wedding.showEnvelope && wedding.pix?.city === "BRASIL", "casamento");
  console.assert(gifts.map((g) => g.name).join() === "Presente A,Presente B", "presentes");

  let rejected = false;
  try {
    await db.insert(schema.weddings).values({ ...row, id: undefined, slug: "Slug Inválido" });
  } catch {
    rejected = true;
  }
  console.assert(rejected, "slug inválido deveria ser recusado");

  await seed(db);
  const seeded = await seed(db); // rodar duas vezes não pode dar erro
  const seededGifts = await db.select().from(schema.gifts).where(eq(schema.gifts.weddingId, seeded.id));
  console.assert(seededGifts.length === 3, "seed");

  console.log("OK:", wedding.partner1, "&", wedding.partner2, "|", gifts.length, "presentes ativos | tema:", wedding.theme.rose);
}

main();
