import type { gifts as giftsTable, weddings } from "@/db/schema";
import type { Gift, Wedding } from "./types";

// Converte linhas do banco para os tipos usados pelas páginas.

type WeddingRow = typeof weddings.$inferSelect;
type GiftRow = typeof giftsTable.$inferSelect;

export function toWedding(row: WeddingRow): Wedding {
  return {
    id: row.id,
    slug: row.slug,
    partner1: row.partner1,
    partner2: row.partner2,
    date: row.weddingDate.toISOString(),
    headline: row.headline,
    invitationText: row.invitationText,
    story: row.story,
    ceremony: row.ceremony,
    reception: row.reception ?? null,
    dressCode: row.dressCode,
    coverImageUrl: row.coverImageUrl,
    theme: row.theme,
    showEnvelope: row.showEnvelope,
    allowFreeAmount: row.allowFreeAmount,
    moderateMessages: row.moderateMessages,
    pix:
      row.pixKey && row.pixReceiverName
        ? { key: row.pixKey, receiverName: row.pixReceiverName, city: row.pixCity ?? "BRASIL" }
        : null,
  };
}

export function toGift(row: GiftRow): Gift {
  return {
    id: row.id,
    weddingId: row.weddingId,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    emoji: row.emoji,
    imageUrl: row.imageUrl,
  };
}
