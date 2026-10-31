"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/db";
import { weddings } from "@/db/schema";
import { requireMyWedding } from "@/lib/my-wedding";
import { contrastWithIvory, HEX } from "@/lib/palettes";

const color = z.string().regex(HEX, "Cor inválida.").transform((c) => c.toLowerCase());

const visualSchema = z.object({
  theme: z.object({ rose: color, roseDeep: color, gold: color, sage: color }),
  showEnvelope: z.boolean(),
});

export async function saveVisualAction(input: z.input<typeof visualSchema>): Promise<{ ok: true } | { ok: false; error: string }> {
  const { wedding } = await requireMyWedding();
  const parsed = visualSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  if (contrastWithIvory(parsed.data.theme.roseDeep) < 3) {
    return { ok: false, error: "A cor principal está clara demais: os nomes e botões ficariam difíceis de ler." };
  }

  await requireDb().update(weddings).set(parsed.data).where(eq(weddings.id, wedding.id));
  revalidatePath("/painel", "layout");
  revalidatePath(`/${wedding.slug}`);
  return { ok: true };
}
