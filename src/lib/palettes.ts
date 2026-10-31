import type { WeddingTheme } from "./types";

// Paletas prontas. "roseDeep" é a cor de títulos e botões (contraste ≥ 4.5 com o fundo).
export const PALETTES: { id: string; name: string; theme: WeddingTheme }[] = [
  { id: "rose", name: "Rosé clássico", theme: { rose: "#c48a8a", roseDeep: "#9c5d62", gold: "#b8955a", sage: "#8fa38a" } },
  { id: "salvia", name: "Sálvia", theme: { rose: "#9fb59a", roseDeep: "#4f6b52", gold: "#b8955a", sage: "#c9a27e" } },
  { id: "serenity", name: "Azul serenity", theme: { rose: "#9db4cf", roseDeep: "#3f5f86", gold: "#b8a47a", sage: "#a7b9a4" } },
  { id: "terracota", name: "Terracota", theme: { rose: "#d39a7a", roseDeep: "#a5523a", gold: "#c08a3e", sage: "#8c9a6e" } },
  { id: "lavanda", name: "Lavanda", theme: { rose: "#b8a4cf", roseDeep: "#6b4f8a", gold: "#b8955a", sage: "#9fb3a0" } },
  { id: "marsala", name: "Marsala", theme: { rose: "#b77b82", roseDeep: "#6e2a35", gold: "#b8955a", sage: "#7f8f6a" } },
  { id: "champagne", name: "Champagne", theme: { rose: "#d8b9a0", roseDeep: "#8a6a4f", gold: "#c2a35f", sage: "#a9b39a" } },
  { id: "noite", name: "Noite estrelada", theme: { rose: "#a3aecb", roseDeep: "#2f3b52", gold: "#c2a35f", sage: "#8fa3a0" } },
];

export const THEME_FIELDS: { key: keyof WeddingTheme; label: string; hint: string }[] = [
  { key: "roseDeep", label: "Principal", hint: "Nomes, títulos e botões" },
  { key: "rose", label: "Flores", hint: "Pétalas, flores e detalhes" },
  { key: "gold", label: "Detalhes", hint: "Linhas e o “&”" },
  { key: "sage", label: "Folhas", hint: "Folhagens dos ramos" },
];

function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** Contraste entre a cor e o fundo marfim do site (WCAG). */
export function contrastWithIvory(hex: string) {
  const a = luminance(hex);
  const b = luminance("#fbf7f1");
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const HEX = /^#[0-9a-f]{6}$/i;
