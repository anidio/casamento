import { asc, eq } from "drizzle-orm";
import { requireDb } from "@/db";
import { gifts } from "@/db/schema";
import { PageTitle } from "@/components/ui/panel";
import { requireMyWedding } from "@/lib/my-wedding";
import { GiftManager } from "./gifts";
import { PixForm } from "./pix";

export const metadata = { title: "Presentes e Pix — Juntos" };

export default async function GiftsPage() {
  const { user, wedding } = await requireMyWedding();
  const list = await requireDb().select().from(gifts).where(eq(gifts.weddingId, wedding.id)).orderBy(asc(gifts.position), asc(gifts.createdAt));

  return (
    <div className="space-y-6">
      <PageTitle
        title="Presentes e Pix"
        description="Cada presente é um valor que o convidado paga por Pix, direto na conta de vocês. Pode ser sério ou bem engraçado."
      />
      <PixForm
        initial={{
          type: wedding.pixKeyType ?? "cpf",
          key: wedding.pixKey ?? "",
          receiverName: wedding.pixReceiverName ?? user.name,
          city: wedding.pixCity ?? "",
        }}
        hasKey={Boolean(wedding.pixKey)}
      />
      <GiftManager
        gifts={list.map((g) => ({ id: g.id, emoji: g.emoji, name: g.name, description: g.description, priceCents: g.priceCents, active: g.active }))}
        hasPix={Boolean(wedding.pixKey)}
        allowFreeAmount={wedding.allowFreeAmount}
      />
    </div>
  );
}
