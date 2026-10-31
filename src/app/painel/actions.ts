"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireDb } from "@/db";
import { weddings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { checkSlug, getMyWedding, type SlugCheck } from "@/lib/my-wedding";

// Ações do painel. Cada uma confere a sessão no servidor antes de tocar no banco.

export async function checkSlugAction(slug: string): Promise<SlugCheck> {
  await requireUser();
  return checkSlug(slug.trim().toLowerCase());
}

const createSchema = z.object({
  partner1: z.string().trim().min(1, "Informe o primeiro nome.").max(60),
  partner2: z.string().trim().min(1, "Informe o segundo nome.").max(60),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Escolha o horário."),
  slug: z.string().trim().toLowerCase(),
});

export type CreateWeddingState = { error?: string } | undefined;

export async function createWeddingAction(input: z.input<typeof createSchema>): Promise<CreateWeddingState> {
  const user = await requireUser();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  const { partner1, partner2, date, time, slug } = parsed.data;

  if (await getMyWedding(user.id)) redirect("/painel");

  // Horário de Brasília (o Brasil não tem mais horário de verão).
  const weddingDate = new Date(`${date}T${time}:00-03:00`);
  if (Number.isNaN(weddingDate.getTime())) return { error: "Data inválida." };
  if (weddingDate.getTime() < Date.now() - 86_400_000) return { error: "A data do casamento já passou." };

  const slugCheck = await checkSlug(slug);
  if (!slugCheck.ok) return { error: slugCheck.message };

  try {
    await requireDb().insert(weddings).values({
      ownerId: user.id,
      slug,
      partner1,
      partner2,
      weddingDate,
      invitationText: "Com muita alegria, convidamos você para celebrar o nosso casamento.",
      ceremony: { name: "", address: "", time: time.replace(":", "h"), mapsUrl: "" },
    });
  } catch (e) {
    // Dois casais escolhendo o mesmo endereço ao mesmo tempo.
    if ((e as { cause?: { code?: string } }).cause?.code === "23505") return { error: "Este endereço acabou de ser usado. Tente outro." };
    throw e;
  }

  redirect("/painel?novo=1");
}

export async function setPublishedAction(published: boolean) {
  const user = await requireUser();
  const wedding = await getMyWedding(user.id);
  if (!wedding) redirect("/painel/novo");
  await requireDb().update(weddings).set({ published }).where(eq(weddings.id, wedding.id));
  revalidatePath("/painel");
  revalidatePath(`/${wedding.slug}`);
}
