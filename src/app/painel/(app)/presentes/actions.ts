"use server";

import { and, asc, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/db";
import { gifts, weddings } from "@/db/schema";
import { requireMyWedding } from "@/lib/my-wedding";
import { normalizePixKey, PIX_KEY_TYPES, type PixKeyType } from "@/lib/pix-key";

type Result = { ok: true } | { ok: false; error: string };

function refresh(slug: string) {
  revalidatePath("/painel", "layout");
  revalidatePath(`/${slug}`);
}

// ---------------------------------------------------------------------------
// Pix
// ---------------------------------------------------------------------------
const pixSchema = z.object({
  type: z.enum(Object.keys(PIX_KEY_TYPES) as [PixKeyType, ...PixKeyType[]]),
  key: z.string().trim().min(1, "Informe a chave Pix."),
  receiverName: z.string().trim().min(2, "Informe o nome de quem recebe.").max(60),
  city: z.string().trim().min(2, "Informe a cidade.").max(40),
});

export async function savePixAction(input: z.input<typeof pixSchema>): Promise<Result> {
  const { wedding } = await requireMyWedding();
  const parsed = pixSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const normalized = normalizePixKey(parsed.data.type, parsed.data.key);
  if (normalized.error !== undefined) return { ok: false, error: normalized.error };

  await requireDb()
    .update(weddings)
    .set({ pixKeyType: parsed.data.type, pixKey: normalized.key, pixReceiverName: parsed.data.receiverName, pixCity: parsed.data.city })
    .where(eq(weddings.id, wedding.id));
  refresh(wedding.slug);
  return { ok: true };
}

export async function removePixAction(): Promise<Result> {
  const { wedding } = await requireMyWedding();
  await requireDb().update(weddings).set({ pixKeyType: null, pixKey: null }).where(eq(weddings.id, wedding.id));
  refresh(wedding.slug);
  return { ok: true };
}

export async function setFreeAmountAction(allow: boolean): Promise<Result> {
  const { wedding } = await requireMyWedding();
  await requireDb().update(weddings).set({ allowFreeAmount: allow }).where(eq(weddings.id, wedding.id));
  refresh(wedding.slug);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Presentes
// ---------------------------------------------------------------------------
const giftSchema = z.object({
  emoji: z.string().trim().min(1, "Escolham um emoji.").max(16),
  name: z.string().trim().min(1, "Dê um nome ao presente.").max(80, "Nome longo demais (máx. 80)."),
  description: z.string().trim().max(240, "Descrição longa demais (máx. 240)."),
  priceCents: z.number().int().min(100, "O valor mínimo é R$ 1,00.").max(10_000_000, "O valor máximo é R$ 100.000,00."),
});

export type GiftInput = z.input<typeof giftSchema>;

/** Garante que o presente é do casamento de quem está logado. */
async function ownedGift(giftId: string) {
  const { wedding } = await requireMyWedding();
  if (!z.uuid().safeParse(giftId).success) return { wedding, gift: null };
  const [gift] = await requireDb()
    .select()
    .from(gifts)
    .where(and(eq(gifts.id, giftId), eq(gifts.weddingId, wedding.id)))
    .limit(1);
  return { wedding, gift: gift ?? null };
}

export async function createGiftAction(input: GiftInput): Promise<Result> {
  const { wedding } = await requireMyWedding();
  const parsed = giftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const db = requireDb();
  const [{ last }] = await db.select({ last: max(gifts.position) }).from(gifts).where(eq(gifts.weddingId, wedding.id));
  await db.insert(gifts).values({ ...parsed.data, weddingId: wedding.id, position: (last ?? 0) + 1 });
  refresh(wedding.slug);
  return { ok: true };
}

export async function updateGiftAction(giftId: string, input: GiftInput): Promise<Result> {
  const { wedding, gift } = await ownedGift(giftId);
  if (!gift) return { ok: false, error: "Presente não encontrado." };
  const parsed = giftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  await requireDb().update(gifts).set(parsed.data).where(eq(gifts.id, gift.id));
  refresh(wedding.slug);
  return { ok: true };
}

export async function setGiftActiveAction(giftId: string, active: boolean): Promise<Result> {
  const { wedding, gift } = await ownedGift(giftId);
  if (!gift) return { ok: false, error: "Presente não encontrado." };
  await requireDb().update(gifts).set({ active }).where(eq(gifts.id, gift.id));
  refresh(wedding.slug);
  return { ok: true };
}

export async function deleteGiftAction(giftId: string): Promise<Result> {
  const { wedding, gift } = await ownedGift(giftId);
  if (!gift) return { ok: false, error: "Presente não encontrado." };
  await requireDb().delete(gifts).where(eq(gifts.id, gift.id));
  refresh(wedding.slug);
  return { ok: true };
}

export async function moveGiftAction(giftId: string, direction: "up" | "down"): Promise<Result> {
  const { wedding, gift } = await ownedGift(giftId);
  if (!gift) return { ok: false, error: "Presente não encontrado." };

  const db = requireDb();
  await db.transaction(async (tx) => {
    const list = await tx.select({ id: gifts.id }).from(gifts).where(eq(gifts.weddingId, wedding.id)).orderBy(asc(gifts.position), asc(gifts.createdAt));
    const i = list.findIndex((g) => g.id === gift.id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    // Renumera tudo: mantém as posições sempre 1, 2, 3…
    for (const [index, g] of list.entries()) {
      await tx.update(gifts).set({ position: index + 1 }).where(eq(gifts.id, g.id));
    }
  });
  refresh(wedding.slug);
  return { ok: true };
}
