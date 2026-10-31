import type { Gift, GuestMessage, Wedding } from "./types";

// Casamento de exemplo, servido em /demo. Fica no código (não no banco) para a
// vitrine nunca mudar nem depender do banco estar acordado.
export const demoWedding: Wedding = {
  id: "demo",
  slug: "demo",
  partner1: "Thaís",
  partner2: "Lázaro",
  date: "2027-04-24T16:00:00-03:00",
  headline: "Vamos nos casar!",
  invitationText:
    "Com a bênção de Deus e de nossas famílias, temos a alegria de convidar você para celebrar o nosso casamento.",
  // Texto de exemplo: mostra o formato da linha do tempo, não é a história real de ninguém.
  story: [
    { year: "2019", title: "O primeiro olhar", text: "Aqui os noivos contam como se conheceram: onde foi, quem puxou assunto e o que aconteceu depois." },
    { year: "2021", title: "O primeiro lar", text: "Um marco importante do relacionamento, como a primeira viagem ou o primeiro apartamento juntos." },
    { year: "2025", title: "O pedido", text: "Como, quando e onde foi o pedido. Vale contar quem chorou mais." },
  ],
  ceremony: {
    name: "Capela Nossa Senhora das Graças",
    address: "Rua das Flores, 120 — Centro",
    time: "16h00",
    mapsUrl: "https://maps.google.com/?q=Rua+das+Flores+120",
  },
  reception: {
    name: "Espaço Jardim Encantado",
    address: "Estrada do Sol, km 4",
    time: "18h00",
    mapsUrl: "https://maps.google.com/?q=Estrada+do+Sol",
  },
  dressCode: "Esporte fino. Evite branco, esse é da noiva 😉",
  coverImageUrl: null,
  showEnvelope: true,
  allowFreeAmount: true,
  moderateMessages: false,
  theme: { rose: "#c48a8a", roseDeep: "#9c5d62", gold: "#b8955a", sage: "#8fa38a" },
  pix: { key: "noivos@exemplo.com", receiverName: "Noivos Exemplo", city: "Sao Paulo" },
};

export const demoGifts: Gift[] = [
  { id: "g1", weddingId: "demo", name: "Curso de dobrar lençol de elástico", description: "Para o noivo, que até hoje faz uma bola e esconde no armário.", priceCents: 8000, emoji: "🛏️", imageUrl: null },
  { id: "g2", weddingId: "demo", name: "Fundo de emergência para o delivery", description: "Porque cozinhar todo dia não estava nos votos.", priceCents: 15000, emoji: "🍕", imageUrl: null },
  { id: "g3", weddingId: "demo", name: "Terapia de casal para escolher série", description: "Uma sessão para decidir o que assistir sem brigar.", priceCents: 20000, emoji: "📺", imageUrl: null },
  { id: "g4", weddingId: "demo", name: "Controle remoto reserva", description: "Um para cada um. Paz garantida.", priceCents: 6000, emoji: "🎮", imageUrl: null },
  { id: "g5", weddingId: "demo", name: "Upgrade de assento na lua de mel", description: "Para ela não passar 10 horas ouvindo ele roncar.", priceCents: 35000, emoji: "✈️", imageUrl: null },
  { id: "g6", weddingId: "demo", name: "Kit sobrevivência para a sogra", description: "Inclui paciência, chá de camomila e um sorriso amarelo.", priceCents: 12000, emoji: "🫖", imageUrl: null },
];

export const demoMessages: GuestMessage[] = [
  { id: "m1", author: "Tia Cida", body: "Que Deus abençoe essa união! Já separei o vestido e o lenço. 💐", createdAt: "2026-10-20T14:00:00-03:00" },
  { id: "m2", author: "Turma da faculdade", body: "Finalmente! Estamos esperando esse casamento desde 2019. Vai ter open bar, né?", createdAt: "2026-10-18T21:30:00-03:00" },
  { id: "m3", author: "Vó Lurdes", body: "Meus netos lindos. Felicidades e muitos bisnetos!", createdAt: "2026-10-15T10:12:00-03:00" },
];
