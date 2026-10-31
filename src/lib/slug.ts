// Endereço do casamento (ex.: /joao-e-maria). Usado no navegador e no servidor.

/** Caminhos que já são páginas da plataforma e não podem virar endereço de casamento. */
export const RESERVED_SLUGS = new Set([
  "demo", "painel", "entrar", "sair", "cadastro", "esqueci-senha", "redefinir-senha",
  "api", "admin", "app", "login", "conta", "ajuda", "suporte", "termos", "privacidade",
  "precos", "planos", "blog", "sobre", "contato", "static", "public", "assets", "favicon",
]);

export const SLUG_MIN = 3;
export const SLUG_MAX = 60;

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " e ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
}

export function suggestSlug(partner1: string, partner2: string) {
  const first = (s: string) => s.trim().split(/\s+/)[0] ?? "";
  return slugify(`${first(partner1)} e ${first(partner2)}`);
}

/** Devolve a mensagem de erro, ou null se o formato estiver ok. */
export function slugFormatError(slug: string): string | null {
  if (slug.length < SLUG_MIN) return `Use pelo menos ${SLUG_MIN} caracteres.`;
  if (slug.length > SLUG_MAX) return `Use no máximo ${SLUG_MAX} caracteres.`;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Use só letras minúsculas, números e hífen.";
  if (RESERVED_SLUGS.has(slug)) return "Este endereço é reservado. Escolha outro.";
  return null;
}
