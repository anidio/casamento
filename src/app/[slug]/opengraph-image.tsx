import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatWeddingDate } from "@/components/wedding/Sections";
import { getWeddingBySlug } from "@/lib/weddings";

// Imagem que aparece quando o link do site é compartilhado (WhatsApp, Instagram, etc.).

export const alt = "Convite de casamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fonts = () =>
  Promise.all(
    ["GreatVibes-Regular.woff", "CormorantGaramond-Medium.woff", "CormorantGaramond-Italic.woff"].map((f) =>
      readFile(join(process.cwd(), "src/assets/fonts", f)),
    ),
  );

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const [found, [script, serif, italic]] = await Promise.all([getWeddingBySlug((await params).slug), fonts()]);

  const theme = found?.wedding.theme ?? { rose: "#c48a8a", roseDeep: "#9c5d62", gold: "#b8955a", sage: "#8fa38a" };
  const names = found ? `${found.wedding.partner1} & ${found.wedding.partner2}` : "Juntos";
  const date = found ? formatWeddingDate(found.wedding.date) : null;
  const long = names.length > 22;

  const petal = (x: number, y: number, s: number, r: number, color: string, o: number) => (
    <div
      key={`${x}-${y}`}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: s,
        height: s * 1.4,
        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
        background: color,
        opacity: o,
        transform: `rotate(${r}deg)`,
      }}
    />
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fbf7f1",
          backgroundImage: `radial-gradient(circle at 10% 0%, ${theme.rose}44, transparent 50%), radial-gradient(circle at 95% 100%, ${theme.sage}44, transparent 50%)`,
          color: "#3d2f2a",
          position: "relative",
        }}
      >
        {petal(70, 60, 34, -30, theme.rose, 0.55)}
        {petal(140, 130, 22, 20, theme.gold, 0.5)}
        {petal(1080, 90, 30, 35, theme.rose, 0.5)}
        {petal(1010, 470, 26, -15, theme.sage, 0.6)}
        {petal(110, 480, 28, 40, theme.sage, 0.55)}
        {petal(1100, 520, 20, -40, theme.gold, 0.5)}

        <div style={{ position: "absolute", top: 28, left: 28, width: 1144, height: 574, border: `2px solid ${theme.gold}66`, borderRadius: 28, display: "flex" }} />

        <div style={{ fontFamily: "Cormorant", fontSize: 30, letterSpacing: 10, textTransform: "uppercase", color: "#6f5e57", display: "flex" }}>
          {found ? "Vamos nos casar" : "Sites de casamento"}
        </div>
        <div
          style={{
            fontFamily: "GreatVibes",
            fontSize: long ? 104 : 140,
            color: theme.roseDeep,
            marginTop: 18,
            lineHeight: 1.1,
            display: "flex",
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          {names}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 22 }}>
          <div style={{ width: 120, height: 2, background: theme.gold, display: "flex" }} />
          <div style={{ width: 14, height: 14, background: theme.rose, transform: "rotate(45deg)", display: "flex" }} />
          <div style={{ width: 120, height: 2, background: theme.gold, display: "flex" }} />
        </div>
        {date && (
          <div style={{ fontFamily: "Cormorant", fontSize: 44, letterSpacing: 12, marginTop: 26, display: "flex" }}>{date.short}</div>
        )}
        <div style={{ fontFamily: "CormorantItalic", fontSize: 30, color: "#6f5e57", marginTop: 14, display: "flex" }}>
          {found ? "Toque para ver o convite e confirmar presença" : "Convite, presentes e confirmação de presença"}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "GreatVibes", data: script, style: "normal", weight: 400 },
        { name: "Cormorant", data: serif, style: "normal", weight: 500 },
        { name: "CormorantItalic", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
