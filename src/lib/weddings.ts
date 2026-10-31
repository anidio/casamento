import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { gifts as giftsTable, messages as messagesTable, weddings } from "@/db/schema";
import { getSession } from "./auth";
import { demoGifts, demoMessages, demoWedding } from "./demo";
import { toGift, toWedding } from "./mappers";
import type { Gift, GuestMessage, Wedding } from "./types";

/**
 * Site público: /demo vem do código (vitrine fixa); os demais do banco.
 * Rascunhos (não publicados) só aparecem para o dono, como prévia.
 */
export const getWeddingBySlug = cache(async (slug: string): Promise<{ wedding: Wedding; preview: boolean } | null> => {
  if (slug === demoWedding.slug) return { wedding: demoWedding, preview: false };
  if (!db) return null;
  const [row] = await db.select().from(weddings).where(eq(weddings.slug, slug)).limit(1);
  if (!row) return null;
  if (row.published) return { wedding: toWedding(row), preview: false };

  const session = await getSession();
  return session?.user.id === row.ownerId ? { wedding: toWedding(row), preview: true } : null;
});

export async function getGifts(weddingId: string): Promise<Gift[]> {
  if (weddingId === demoWedding.id) return demoGifts;
  if (!db) return [];
  const rows = await db
    .select()
    .from(giftsTable)
    .where(and(eq(giftsTable.weddingId, weddingId), eq(giftsTable.active, true)))
    .orderBy(asc(giftsTable.position), asc(giftsTable.createdAt));
  return rows.map(toGift);
}

/** Recados aprovados do mural (os mais recentes primeiro). */
export async function getMessages(weddingId: string): Promise<GuestMessage[]> {
  if (weddingId === demoWedding.id) return demoMessages;
  if (!db) return [];
  const rows = await db
    .select()
    .from(messagesTable)
    .where(and(eq(messagesTable.weddingId, weddingId), eq(messagesTable.approved, true)))
    .orderBy(desc(messagesTable.createdAt))
    .limit(100);
  return rows.map((m) => ({ id: m.id, author: m.author, body: m.body, createdAt: m.createdAt.toISOString() }));
}
