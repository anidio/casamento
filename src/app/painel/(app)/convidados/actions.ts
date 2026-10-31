"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/db";
import { messages, rsvps, weddings } from "@/db/schema";
import { requireMyWedding } from "@/lib/my-wedding";

type Result = { ok: boolean; error?: string };

function refresh(slug: string) {
  revalidatePath("/painel", "layout");
  revalidatePath(`/${slug}`);
}

const isId = (id: string) => z.uuid().safeParse(id).success;

export async function deleteRsvpAction(id: string): Promise<Result> {
  const { wedding } = await requireMyWedding();
  if (!isId(id)) return { ok: false, error: "Resposta não encontrada." };
  await requireDb().delete(rsvps).where(and(eq(rsvps.id, id), eq(rsvps.weddingId, wedding.id)));
  refresh(wedding.slug);
  return { ok: true };
}

export async function setMessageApprovedAction(id: string, approved: boolean): Promise<Result> {
  const { wedding } = await requireMyWedding();
  if (!isId(id)) return { ok: false, error: "Recado não encontrado." };
  await requireDb().update(messages).set({ approved }).where(and(eq(messages.id, id), eq(messages.weddingId, wedding.id)));
  refresh(wedding.slug);
  return { ok: true };
}

export async function deleteMessageAction(id: string): Promise<Result> {
  const { wedding } = await requireMyWedding();
  if (!isId(id)) return { ok: false, error: "Recado não encontrado." };
  await requireDb().delete(messages).where(and(eq(messages.id, id), eq(messages.weddingId, wedding.id)));
  refresh(wedding.slug);
  return { ok: true };
}

export async function setModerationAction(moderate: boolean): Promise<Result> {
  const { wedding } = await requireMyWedding();
  await requireDb().update(weddings).set({ moderateMessages: moderate }).where(eq(weddings.id, wedding.id));
  refresh(wedding.slug);
  return { ok: true };
}
