import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { requireDb } from "@/db";
import { weddings } from "@/db/schema";
import { requireUser } from "./auth";
import { slugFormatError } from "./slug";

// Consultas do painel: sempre filtradas pelo dono (userId vem da sessão,
// nunca do navegador).

export async function getMyWedding(userId: string) {
  const [row] = await requireDb().select().from(weddings).where(eq(weddings.ownerId, userId)).limit(1);
  return row ?? null;
}

export type SlugCheck = { ok: true } | { ok: false; message: string };

export async function checkSlug(slug: string): Promise<SlugCheck> {
  const formatError = slugFormatError(slug);
  if (formatError) return { ok: false, message: formatError };
  const [taken] = await requireDb().select({ id: weddings.id }).from(weddings).where(eq(weddings.slug, slug)).limit(1);
  return taken ? { ok: false, message: "Este endereço já está em uso. Tente outro." } : { ok: true };
}

/** Usuário logado + o casamento dele. Sem casamento, manda para o assistente. */
export const requireMyWedding = cache(async () => {
  const user = await requireUser();
  const wedding = await getMyWedding(user.id);
  if (!wedding) redirect("/painel/novo");
  return { user, wedding };
});
