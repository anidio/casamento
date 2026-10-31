// Tipos usados pelas páginas. As linhas do banco (src/db/schema.ts) são
// convertidas para estes formatos em src/lib/weddings.ts.

export type WeddingTheme = {
  rose: string;
  roseDeep: string;
  gold: string;
  sage: string;
};

export type StoryMoment = {
  year: string;
  title: string;
  text: string;
};

export type Wedding = {
  id: string;
  slug: string;
  partner1: string;
  partner2: string;
  /** ISO com fuso, ex.: 2027-04-24T16:00:00-03:00 */
  date: string;
  headline: string;
  invitationText: string;
  story: StoryMoment[];
  ceremony: EventPlace;
  reception: EventPlace | null;
  dressCode: string;
  coverImageUrl: string | null;
  theme: WeddingTheme;
  /** Mostrar o envelope animado na abertura do site. */
  showEnvelope: boolean;
  /** Mostra o cartão de contribuição com valor livre. */
  allowFreeAmount: boolean;
  moderateMessages: boolean;
  pix: {
    key: string;
    receiverName: string;
    city: string;
  } | null;
};

export type EventPlace = {
  name: string;
  address: string;
  time: string;
  mapsUrl: string;
};

export type Gift = {
  id: string;
  weddingId: string;
  name: string;
  description: string;
  priceCents: number;
  emoji: string;
  imageUrl: string | null;
};

export type GuestMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};
