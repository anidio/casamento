"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/db";
import { weddings } from "@/db/schema";
import { requireMyWedding } from "@/lib/my-wedding";

const text = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);
const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "O link do mapa precisa começar com https://");

const place = z.object({
  name: text(120),
  address: text(200),
  time: text(20),
  mapsUrl: url,
});

const infoSchema = z.object({
  partner1: text(60).min(1, "Informe o primeiro nome."),
  partner2: text(60).min(1, "Informe o segundo nome."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Escolha o horário."),
  headline: text(80),
  invitationText: text(600),
  story: z
    .array(z.object({ year: text(20), title: text(80).min(1, "Todo momento da história precisa de um título."), text: text(600) }))
    .max(12, "Use no máximo 12 momentos."),
  ceremony: place,
  reception: place.nullable(),
  dressCode: text(200),
});

export type InfoInput = z.input<typeof infoSchema>;

/** Sem link do mapa, gera um a partir do endereço. */
function withMap<T extends { address: string; mapsUrl: string }>(p: T): T {
  if (p.mapsUrl || !p.address) return p;
  return { ...p, mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}` };
}

export async function saveInfoAction(input: InfoInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const { wedding } = await requireMyWedding();
  const parsed = infoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const d = parsed.data;

  const weddingDate = new Date(`${d.date}T${d.time}:00-03:00`);
  if (Number.isNaN(weddingDate.getTime())) return { ok: false, error: "Data inválida." };

  const reception = d.reception && (d.reception.name || d.reception.address) ? withMap(d.reception) : null;

  await requireDb()
    .update(weddings)
    .set({
      partner1: d.partner1,
      partner2: d.partner2,
      weddingDate,
      headline: d.headline || "Vamos nos casar!",
      invitationText: d.invitationText,
      story: d.story,
      ceremony: withMap(d.ceremony),
      reception,
      dressCode: d.dressCode,
    })
    .where(eq(weddings.id, wedding.id));

  revalidatePath("/painel", "layout");
  revalidatePath(`/${wedding.slug}`);
  return { ok: true };
}
