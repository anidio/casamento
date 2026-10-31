"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { requireDb } from "@/db";
import { giftOrders, gifts, messages, rsvps, user, weddings } from "@/db/schema";
import { demoWedding } from "@/lib/demo";
import { giftReceivedEmail, sendEmail } from "@/lib/email";
import { ORDER_CODE } from "@/lib/order-code";
import { formatBRL } from "@/lib/pix";
import { rateLimit } from "@/lib/rate-limit";
import { getWeddingBySlug } from "@/lib/weddings";

// Ações públicas do site do casamento (presente, confirmação de presença e recados).
// Todas validam no servidor, têm limite de envios e um campo-armadilha para robôs.

// ---------------------------------------------------------------------------
// Presente: o convidado avisa que fez o Pix. Nada aqui confia no valor
// vindo do navegador para presentes da lista: o preço é lido do banco.

const FREE_GIFT_NAME = "Contribuição livre";

const schema = z.object({
  slug: z.string().max(60),
  giftId: z.string().nullable(),
  amountCents: z.number().int().min(100, "O valor mínimo é R$ 1,00.").max(10_000_000, "Valor alto demais.").nullable(),
  guestName: z.string().trim().min(2, "Digite seu nome.").max(80, "Nome longo demais."),
  message: z.string().trim().max(500, "Recado longo demais (máx. 500).").optional().default(""),
  code: z.string().regex(ORDER_CODE),
  /** Campo invisível: pessoas não preenchem, robôs sim. */
  website: z.string().optional(),
});

export type RecordGiftInput = z.input<typeof schema>;

export async function recordGiftAction(input: RecordGiftInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;

  if (d.website) return { ok: true }; // robô: finge que deu certo

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`gift:${ip}`, 8, 10 * 60_000)) return { ok: false, error: "Muitos envios seguidos. Espere alguns minutos." };

  if (d.slug === demoWedding.slug) return { ok: true }; // site de exemplo: não grava nada

  const found = await getWeddingBySlug(d.slug);
  if (!found?.wedding.pix) return { ok: false, error: "Este site não está recebendo presentes agora." };
  const wedding = found.wedding;
  const db = requireDb();

  let giftId: string | null = null;
  let giftName = FREE_GIFT_NAME;
  let amountCents: number;

  if (d.giftId) {
    if (!z.uuid().safeParse(d.giftId).success) return { ok: false, error: "Presente não encontrado." };
    const [gift] = await db
      .select()
      .from(gifts)
      .where(and(eq(gifts.id, d.giftId), eq(gifts.weddingId, wedding.id), eq(gifts.active, true)))
      .limit(1);
    if (!gift) return { ok: false, error: "Este presente não está mais disponível." };
    giftId = gift.id;
    giftName = gift.name;
    amountCents = gift.priceCents;
  } else {
    if (!wedding.allowFreeAmount || !d.amountCents) return { ok: false, error: "Escolha um presente da lista." };
    amountCents = d.amountCents;
  }

  // Clicou duas vezes / recarregou: o mesmo código não vira dois presentes.
  const [existing] = await db
    .select({ id: giftOrders.id })
    .from(giftOrders)
    .where(and(eq(giftOrders.weddingId, wedding.id), eq(giftOrders.code, d.code)))
    .limit(1);
  if (existing) return { ok: true };

  await db.insert(giftOrders).values({
    weddingId: wedding.id,
    giftId,
    giftName,
    code: d.code,
    guestName: d.guestName,
    message: d.message || null,
    amountCents,
  });

  // Avisa os noivos por e-mail (falha no e-mail não atrapalha o convidado).
  try {
    const [owner] = await db
      .select({ email: user.email })
      .from(weddings)
      .innerJoin(user, eq(user.id, weddings.ownerId))
      .where(eq(weddings.id, wedding.id))
      .limit(1);
    if (owner) {
      const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
      const email = giftReceivedEmail({
        couple: `${wedding.partner1} & ${wedding.partner2}`,
        guestName: d.guestName,
        giftName,
        amount: formatBRL(amountCents),
        code: d.code,
        message: d.message || null,
        panelUrl: `${base}/painel/recebidos`,
      });
      await sendEmail({ to: owner.email, ...email });
    }
  } catch (e) {
    console.error("Falha ao avisar os noivos:", e);
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Confirmação de presença
// ---------------------------------------------------------------------------
const rsvpSchema = z.object({
  slug: z.string().max(60),
  guestName: z
    .string()
    .trim()
    .min(3, "Digite seu nome completo.")
    .max(120, "Nome longo demais.")
    .transform((n) => n.replace(/\s+/g, " ")),
  attending: z.boolean(),
  partySize: z.number().int().min(1, "Pelo menos 1 pessoa.").max(20, "Máximo de 20 pessoas por resposta."),
  phone: z.string().trim().max(30).optional().default(""),
  message: z.string().trim().max(500, "Recado longo demais (máx. 500).").optional().default(""),
  website: z.string().optional(),
});

export type RsvpInput = z.input<typeof rsvpSchema>;

/** Nome sem acento, minúsculo e com espaços simples, para comparar. */
const normalizedName = (v: unknown) =>
  sql`translate(regexp_replace(lower(trim(${v})), '[[:space:]]+', ' ', 'g'), 'áàâãäéèêëíìîïóòôõöúùûüçñ', 'aaaaaeeeeiiiiooooouuuucn')`;

/** Mesmo nome (ignorando acento/maiúscula) = mesma pessoa: a resposta nova substitui a antiga. */
const sameName = (name: string) => sql`${normalizedName(rsvps.guestName)} = ${normalizedName(name)}`;

export async function recordRsvpAction(input: RsvpInput): Promise<{ ok: true; updated: boolean } | { ok: false; error: string }> {
  const parsed = rsvpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;
  if (d.website) return { ok: true, updated: false };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`rsvp:${ip}`, 10, 10 * 60_000)) return { ok: false, error: "Muitos envios seguidos. Espere alguns minutos." };
  if (d.slug === demoWedding.slug) return { ok: true, updated: false };

  const found = await getWeddingBySlug(d.slug);
  if (!found) return { ok: false, error: "Casamento não encontrado." };
  const wedding = found.wedding;
  if (new Date(wedding.date).getTime() < Date.now()) return { ok: false, error: "As confirmações já foram encerradas." };

  const db = requireDb();
  const values = {
    guestName: d.guestName,
    attending: d.attending,
    partySize: d.attending ? d.partySize : 0,
    phone: d.phone || null,
    message: d.message || null,
  };
  const [existing] = await db
    .select({ id: rsvps.id })
    .from(rsvps)
    .where(and(eq(rsvps.weddingId, wedding.id), sameName(d.guestName)))
    .limit(1);

  if (existing) {
    await db.update(rsvps).set({ ...values, createdAt: new Date() }).where(eq(rsvps.id, existing.id));
  } else {
    await db.insert(rsvps).values({ ...values, weddingId: wedding.id });
  }
  return { ok: true, updated: Boolean(existing) };
}

// ---------------------------------------------------------------------------
// Mural de recados
// ---------------------------------------------------------------------------
const messageSchema = z.object({
  slug: z.string().max(60),
  author: z.string().trim().min(2, "Digite seu nome.").max(80, "Nome longo demais."),
  body: z.string().trim().min(2, "Escreva um recado.").max(500, "Recado longo demais (máx. 500)."),
  website: z.string().optional(),
});

export async function postMessageAction(input: z.input<typeof messageSchema>): Promise<{ ok: true; pending: boolean } | { ok: false; error: string }> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;
  if (d.website) return { ok: true, pending: true };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`msg:${ip}`, 5, 10 * 60_000)) return { ok: false, error: "Muitos recados seguidos. Espere alguns minutos." };
  if (d.slug === demoWedding.slug) return { ok: true, pending: false };

  const found = await getWeddingBySlug(d.slug);
  if (!found) return { ok: false, error: "Casamento não encontrado." };
  const approved = !found.wedding.moderateMessages;

  await requireDb().insert(messages).values({ weddingId: found.wedding.id, author: d.author, body: d.body, approved });
  revalidatePath(`/${d.slug}`);
  return { ok: true, pending: !approved };
}
