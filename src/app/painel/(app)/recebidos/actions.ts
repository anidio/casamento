"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/db";
import { giftOrders } from "@/db/schema";
import { requireMyWedding } from "@/lib/my-wedding";

const statusSchema = z.enum(["pendente", "pago", "cancelado"]);

export async function setOrderStatusAction(orderId: string, status: z.infer<typeof statusSchema>): Promise<{ ok: boolean; error?: string }> {
  const { wedding } = await requireMyWedding();
  if (!z.uuid().safeParse(orderId).success || !statusSchema.safeParse(status).success) return { ok: false, error: "Dados inválidos." };
  const updated = await requireDb()
    .update(giftOrders)
    .set({ status })
    .where(and(eq(giftOrders.id, orderId), eq(giftOrders.weddingId, wedding.id)))
    .returning({ id: giftOrders.id });
  if (!updated.length) return { ok: false, error: "Presente não encontrado." };
  revalidatePath("/painel", "layout");
  return { ok: true };
}
