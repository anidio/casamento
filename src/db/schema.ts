import { relations, sql } from "drizzle-orm";
import { boolean, check, index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { EventPlace, StoryMoment, WeddingTheme } from "@/lib/types";

/*
 * Esquema do banco (Neon / Postgres), gerenciado pelo Drizzle.
 * Depois de mudar este arquivo: `npm run db:generate` e `npm run db:migrate`.
 *
 * Segurança: o Neon não tem as regras de acesso por linha do Supabase, então
 * toda leitura privada e toda escrita passa pelo servidor (src/lib/*), que
 * confere se o casamento pertence ao usuário logado. O navegador nunca fala
 * direto com o banco.
 */

// ---------------------------------------------------------------------------
// Login (tabelas no formato do Better Auth, que entra na Sprint 2)
// ---------------------------------------------------------------------------
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Casamentos
// ---------------------------------------------------------------------------
const defaultTheme: WeddingTheme = { rose: "#c48a8a", roseDeep: "#9c5d62", gold: "#b8955a", sage: "#8fa38a" };

export const weddings = pgTable(
  "weddings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    partner1: text("partner1").notNull(),
    partner2: text("partner2").notNull(),
    weddingDate: timestamp("wedding_date", { withTimezone: true }).notNull(),
    headline: text("headline").notNull().default("Vamos nos casar!"),
    invitationText: text("invitation_text").notNull().default(""),
    story: jsonb("story").$type<StoryMoment[]>().notNull().default([]),
    ceremony: jsonb("ceremony").$type<EventPlace>().notNull(),
    reception: jsonb("reception").$type<EventPlace | null>(),
    dressCode: text("dress_code").notNull().default(""),
    coverImageUrl: text("cover_image_url"),
    theme: jsonb("theme").$type<WeddingTheme>().notNull().default(defaultTheme),
    pixKeyType: text("pix_key_type", { enum: ["cpf", "cnpj", "email", "phone", "random"] }),
    pixKey: text("pix_key"),
    pixReceiverName: text("pix_receiver_name"),
    pixCity: text("pix_city"),
    showEnvelope: boolean("show_envelope").notNull().default(true),
    /** Mostra o cartão "contribuição livre" (o convidado escolhe o valor). */
    allowFreeAmount: boolean("allow_free_amount").notNull().default(false),
    /** Recados do mural só aparecem depois que os noivos aprovam. */
    moderateMessages: boolean("moderate_messages").notNull().default(false),
    published: boolean("published").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    check("slug_format", sql`${t.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(${t.slug}) between 3 and 60`),
    index("weddings_owner_idx").on(t.ownerId),
  ],
);

export const gifts = pgTable(
  "gifts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    priceCents: integer("price_cents").notNull(),
    emoji: text("emoji").notNull().default("🎁"),
    imageUrl: text("image_url"),
    position: integer("position").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("price_positive", sql`${t.priceCents} > 0`), index("gifts_wedding_idx").on(t.weddingId, t.position)],
);

export const giftOrders = pgTable(
  "gift_orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
    giftId: uuid("gift_id").references(() => gifts.id, { onDelete: "set null" }),
    /** Nome do presente no momento do Pix (continua certo mesmo se o presente for editado ou apagado). */
    giftName: text("gift_name").notNull().default(""),
    /** Código curto que vai no Pix, para os noivos acharem a transferência no extrato. */
    code: text("code").notNull().default(""),
    guestName: text("guest_name").notNull(),
    message: text("message"),
    amountCents: integer("amount_cents").notNull(),
    status: text("status", { enum: ["pendente", "pago", "cancelado"] }).notNull().default("pendente"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("amount_positive", sql`${t.amountCents} > 0`), index("orders_wedding_idx").on(t.weddingId, t.createdAt)],
);

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
    guestName: text("guest_name").notNull(),
    attending: boolean("attending").notNull(),
    partySize: integer("party_size").notNull().default(1),
    phone: text("phone"),
    message: text("message"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check("party_size_range", sql`${t.partySize} between 0 and 20`), index("rsvps_wedding_idx").on(t.weddingId, t.createdAt)],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weddingId: uuid("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
    author: text("author").notNull(),
    body: text("body").notNull(),
    approved: boolean("approved").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_wedding_idx").on(t.weddingId, t.createdAt)],
);

export const weddingsRelations = relations(weddings, ({ many, one }) => ({
  owner: one(user, { fields: [weddings.ownerId], references: [user.id] }),
  gifts: many(gifts),
}));

export const giftsRelations = relations(gifts, ({ one }) => ({
  wedding: one(weddings, { fields: [gifts.weddingId], references: [weddings.id] }),
}));
