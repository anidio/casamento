import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { requireDb } from "@/db";
import { messages, rsvps } from "@/db/schema";

// Confirmações e recados de um casamento (o weddingId sempre vem da sessão).

export async function listRsvps(weddingId: string) {
  return requireDb().select().from(rsvps).where(eq(rsvps.weddingId, weddingId)).orderBy(desc(rsvps.createdAt));
}

export async function rsvpTotals(weddingId: string) {
  const [row] = await requireDb()
    .select({
      people: sql<number>`coalesce(sum(${rsvps.partySize}) filter (where ${rsvps.attending}), 0)`.mapWith(Number),
      yes: sql<number>`count(*) filter (where ${rsvps.attending})`.mapWith(Number),
      no: sql<number>`count(*) filter (where not ${rsvps.attending})`.mapWith(Number),
    })
    .from(rsvps)
    .where(eq(rsvps.weddingId, weddingId));
  return row;
}

export async function listAllMessages(weddingId: string) {
  return requireDb().select().from(messages).where(eq(messages.weddingId, weddingId)).orderBy(desc(messages.createdAt));
}
