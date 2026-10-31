import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { requireDb } from "@/db";
import { giftOrders } from "@/db/schema";

// Presentes recebidos de um casamento (o weddingId sempre vem da sessão).

export async function listOrders(weddingId: string) {
  return requireDb().select().from(giftOrders).where(eq(giftOrders.weddingId, weddingId)).orderBy(desc(giftOrders.createdAt));
}

export async function orderTotals(weddingId: string) {
  const [row] = await requireDb()
    .select({
      paidCents: sql<number>`coalesce(sum(${giftOrders.amountCents}) filter (where ${giftOrders.status} = 'pago'), 0)`.mapWith(Number),
      paidCount: sql<number>`count(*) filter (where ${giftOrders.status} = 'pago')`.mapWith(Number),
      pendingCents: sql<number>`coalesce(sum(${giftOrders.amountCents}) filter (where ${giftOrders.status} = 'pendente'), 0)`.mapWith(Number),
      pendingCount: sql<number>`count(*) filter (where ${giftOrders.status} = 'pendente')`.mapWith(Number),
    })
    .from(giftOrders)
    .where(eq(giftOrders.weddingId, weddingId));
  return row;
}
