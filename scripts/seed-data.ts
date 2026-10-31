import { eq } from "drizzle-orm";
import type { PgDatabase } from "drizzle-orm/pg-core";
import * as schema from "../src/db/schema";

// Casamento de teste para conferir se o site está lendo do banco.
// Pode rodar várias vezes: apaga e recria o mesmo casamento.
export const TEST_SLUG = "joao-e-maria";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function seed(db: PgDatabase<any, typeof schema>) {
  await db.delete(schema.weddings).where(eq(schema.weddings.slug, TEST_SLUG));
  await db.delete(schema.user).where(eq(schema.user.id, "usuario-teste"));

  await db.insert(schema.user).values({ id: "usuario-teste", name: "Usuário Teste", email: "teste@exemplo.com" });

  const [wedding] = await db
    .insert(schema.weddings)
    .values({
      ownerId: "usuario-teste",
      slug: TEST_SLUG,
      partner1: "Maria",
      partner2: "João",
      weddingDate: new Date("2027-06-12T17:00:00-03:00"),
      headline: "Este site veio do banco!",
      invitationText: "Se você está lendo isto, o Next.js buscou este casamento no Neon. Tudo funcionando.",
      story: [
        { year: "2020", title: "Teste 1", text: "Este texto está salvo na coluna story do banco." },
        { year: "2024", title: "Teste 2", text: "Mude no npm run db:studio e recarregue a página para ver a alteração." },
      ],
      ceremony: { name: "Igreja de Teste", address: "Rua do Banco, 42", time: "17h00", mapsUrl: "https://maps.google.com/?q=Sao+Paulo" },
      reception: null,
      dressCode: "Traje de teste",
      theme: { rose: "#9fb59a", roseDeep: "#4f6b52", gold: "#b8955a", sage: "#c48a8a" },
      pixKey: "teste@exemplo.com",
      pixReceiverName: "Usuario Teste",
      pixCity: "Sao Paulo",
      published: true,
    })
    .returning();

  await db.insert(schema.gifts).values([
    { weddingId: wedding.id, name: "Ajuda para pagar o buffet", description: "Veio do banco de dados.", priceCents: 10000, emoji: "🍰", position: 1 },
    { weddingId: wedding.id, name: "Seguro contra sogra", description: "Também veio do banco.", priceCents: 25000, emoji: "🛡️", position: 2 },
    { weddingId: wedding.id, name: "Presente escondido", description: "Inativo: não deve aparecer no site.", priceCents: 500, emoji: "🙈", active: false },
  ]);

  return wedding;
}
