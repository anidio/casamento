"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Divider, FloralBranch, Heart } from "@/components/ornaments";
import { PageTitle, PanelCard, SaveBar, Toggle, type SaveStatus } from "@/components/ui/panel";
import { contrastWithIvory, HEX, PALETTES, THEME_FIELDS } from "@/lib/palettes";
import type { WeddingTheme } from "@/lib/types";
import { saveVisualAction } from "./actions";

type FormState = { theme: WeddingTheme; showEnvelope: boolean };

const themeVars = (t: WeddingTheme) =>
  ({ "--rose": t.rose, "--rose-deep": t.roseDeep, "--gold": t.gold, "--sage": t.sage }) as React.CSSProperties;

export function VisualForm({ initial, names, slug }: { initial: FormState; names: { partner1: string; partner2: string }; slug: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" });
  const [saving, startTransition] = useTransition();
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const activePalette = PALETTES.find((p) => JSON.stringify(p.theme) === JSON.stringify(form.theme))?.id;
  const contrast = contrastWithIvory(form.theme.roseDeep);

  function setTheme(theme: WeddingTheme) {
    setForm((f) => ({ ...f, theme }));
    setStatus({ state: "idle" });
  }

  function save() {
    startTransition(async () => {
      const result = await saveVisualAction(form);
      if (!result.ok) return setStatus({ state: "error", message: result.error });
      setSaved(form);
      setStatus({ state: "saved" });
      router.refresh();
      setTimeout(() => setStatus((s) => (s.state === "saved" ? { state: "idle" } : s)), 3000);
    });
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Visual" description="Escolham as cores do site. A prévia ao lado muda na hora; salvem para aplicar no site." />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <PanelCard title="Paletas prontas">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTheme(p.theme)}
                  aria-pressed={activePalette === p.id}
                  className={`rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 ${
                    activePalette === p.id ? "border-ink ring-2 ring-ink/20" : "border-gold/25 bg-white/60"
                  }`}
                >
                  <span className="flex h-10 overflow-hidden rounded-lg">
                    {[p.theme.roseDeep, p.theme.rose, p.theme.gold, p.theme.sage].map((c) => (
                      <span key={c} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="mt-2 block text-sm">{p.name}</span>
                </button>
              ))}
            </div>
          </PanelCard>

          <PanelCard title="Personalizar" description="Ajustem cada cor se quiserem algo só de vocês.">
            <div className="grid gap-4 sm:grid-cols-2">
              {THEME_FIELDS.map(({ key, label, hint }) => (
                <ColorField key={key} label={label} hint={hint} value={form.theme[key]} onChange={(v) => setTheme({ ...form.theme, [key]: v })} />
              ))}
            </div>
            {contrast < 4.5 && (
              <p className={`mt-4 rounded-xl px-4 py-3 text-sm ${contrast < 3 ? "bg-rose/15 text-rose-deep" : "bg-gold/15 text-ink"}`}>
                {contrast < 3
                  ? "A cor principal está clara demais: os nomes e botões ficam difíceis de ler. Escolham um tom mais escuro."
                  : "A cor principal está um pouco clara. Funciona, mas um tom mais escuro fica mais fácil de ler no celular."}
              </p>
            )}
          </PanelCard>

          <PanelCard title="Abertura do site">
            <Toggle
              label="Envelope animado"
              description="O convidado vê um envelope lacrado e clica para abrir o convite."
              checked={form.showEnvelope}
              onChange={(v) => {
                setForm((f) => ({ ...f, showEnvelope: v }));
                setStatus({ state: "idle" });
              }}
            />
          </PanelCard>
        </div>

        <aside className="lg:sticky lg:top-36 lg:self-start">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-ink-soft">Prévia</p>
          <Preview theme={form.theme} names={names} />
          <Link href={`/${slug}`} target="_blank" className="mt-3 block text-center text-sm text-ink-soft underline underline-offset-4 hover:text-rose-deep">
            Abrir o site completo ↗
          </Link>
        </aside>
      </div>

      <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} onDiscard={() => setForm(saved)} />
    </div>
  );
}

function ColorField({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-ivory/60 p-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Cor: ${label}`}
        className="size-12 shrink-0 cursor-pointer rounded-xl border-0 bg-transparent p-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-ink-soft">{hint}</p>
      </div>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (HEX.test(e.target.value)) onChange(e.target.value.toLowerCase());
        }}
        aria-label={`Código da cor: ${label}`}
        className="w-24 rounded-lg border border-gold/30 bg-white/80 px-2 py-1.5 font-mono text-sm uppercase outline-none focus:border-rose-deep"
        maxLength={7}
      />
    </div>
  );
}

function Preview({ theme, names }: { theme: WeddingTheme; names: { partner1: string; partner2: string } }) {
  return (
    <div style={themeVars(theme)} className="paper-bg relative overflow-hidden rounded-3xl border border-gold/25 px-6 pb-8 pt-10 text-center shadow-lg">
      <FloralBranch className="absolute -left-6 -top-6 w-32 opacity-70" />
      <FloralBranch flip className="absolute -right-6 -top-6 w-32 opacity-70" />
      <p className="relative text-[10px] uppercase tracking-[0.35em] text-ink-soft">Vamos nos casar!</p>
      <p className="relative mt-3 font-script text-5xl leading-tight text-rose-deep">
        {names.partner1}
        <span className="mx-2 font-serif text-3xl italic text-gold">&</span>
        {names.partner2}
      </p>
      <Divider className="mt-4" />
      <div className="mt-5 rounded-2xl border border-gold/20 bg-white/70 p-4 text-left">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl text-2xl" style={{ background: `color-mix(in srgb, ${theme.rose} 18%, #fbf7f1)` }}>
            🎁
          </span>
          <div className="flex-1">
            <p className="font-serif text-lg leading-tight">Presente de exemplo</p>
            <p className="font-serif text-rose-deep">R$ 100,00</p>
          </div>
        </div>
        <span className="mt-3 block rounded-full bg-rose-deep py-2 text-center text-[11px] uppercase tracking-[0.2em] text-ivory">Presentear</span>
      </div>
      <Heart className="mx-auto mt-5 size-5 text-rose" />
    </div>
  );
}
