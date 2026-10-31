"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Field } from "@/components/ui/form";
import { PageTitle, PanelCard, SaveBar, TextArea, Toggle, type SaveStatus } from "@/components/ui/panel";
import type { EventPlace, StoryMoment } from "@/lib/types";
import { saveInfoAction, type InfoInput } from "./actions";

type FormState = Omit<InfoInput, "story" | "ceremony" | "reception"> & {
  story: StoryMoment[];
  ceremony: EventPlace;
  reception: EventPlace | null;
};

const emptyPlace: EventPlace = { name: "", address: "", time: "", mapsUrl: "" };

export function InfoForm({ initial }: { initial: FormState }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" });
  const [saving, startTransition] = useTransition();
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setStatus({ state: "idle" });
  }

  function save() {
    startTransition(async () => {
      const result = await saveInfoAction(form);
      if (!result.ok) return setStatus({ state: "error", message: result.error });
      setSaved(form);
      setStatus({ state: "saved" });
      router.refresh();
      setTimeout(() => setStatus((s) => (s.state === "saved" ? { state: "idle" } : s)), 3000);
    });
  }

  const story = form.story;
  const setStory = (next: StoryMoment[]) => update("story", next);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (dirty) save();
      }}
      className="space-y-6"
    >
      <PageTitle title="Informações" description="Tudo o que os convidados leem no site. Seções vazias não aparecem para eles." />

      <PanelCard title="Os noivos e a data">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primeiro nome" value={form.partner1} onChange={(e) => update("partner1", e.target.value)} maxLength={60} required />
          <Field label="Segundo nome" value={form.partner2} onChange={(e) => update("partner2", e.target.value)} maxLength={60} required />
          <Field label="Data" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
          <Field label="Horário" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} required hint="Horário de Brasília. É o que aparece na contagem regressiva." />
        </div>
      </PanelCard>

      <PanelCard title="Abertura" description="O texto que aparece logo abaixo dos nomes.">
        <div className="space-y-4">
          <Field label="Frase de destaque" value={form.headline} onChange={(e) => update("headline", e.target.value)} maxLength={80} placeholder="Vamos nos casar!" />
          <TextArea label="Texto do convite" value={form.invitationText} onChange={(e) => update("invitationText", e.target.value)} maxLength={600} rows={4} />
        </div>
      </PanelCard>

      <PanelCard
        id="historia"
        title="Nossa história"
        description="Momentos marcantes do casal, em ordem. Até 12."
        aside={
          story.length < 12 && (
            <button
              type="button"
              onClick={() => setStory([...story, { year: "", title: "", text: "" }])}
              className="rounded-full border border-rose-deep/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-rose-deep transition hover:bg-rose-deep hover:text-ivory"
            >
              + Momento
            </button>
          )
        }
      >
        {story.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/40 p-6 text-center text-ink-soft">
            <p>Ainda sem história. Que tal começar por como vocês se conheceram?</p>
            <button
              type="button"
              onClick={() => setStory([{ year: "", title: "Como nos conhecemos", text: "" }])}
              className="mt-3 text-rose-deep underline underline-offset-4"
            >
              Adicionar o primeiro momento
            </button>
          </div>
        ) : (
          <ol className="space-y-4">
            {story.map((m, i) => {
              const set = (patch: Partial<StoryMoment>) => setStory(story.map((s, j) => (j === i ? { ...s, ...patch } : s)));
              const move = (to: number) => {
                const next = [...story];
                [next[i], next[to]] = [next[to], next[i]];
                setStory(next);
              };
              return (
                <li key={i} className="rounded-2xl border border-gold/20 bg-ivory/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-[0.2em] text-gold">Momento {i + 1}</span>
                    <div className="flex gap-1 text-ink-soft">
                      <IconButton label="Subir" disabled={i === 0} onClick={() => move(i - 1)}>
                        ↑
                      </IconButton>
                      <IconButton label="Descer" disabled={i === story.length - 1} onClick={() => move(i + 1)}>
                        ↓
                      </IconButton>
                      <IconButton label="Remover momento" onClick={() => setStory(story.filter((_, j) => j !== i))}>
                        ✕
                      </IconButton>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                    <Field label="Ano" value={m.year} onChange={(e) => set({ year: e.target.value })} maxLength={20} placeholder="2019" />
                    <Field label="Título" value={m.title} onChange={(e) => set({ title: e.target.value })} maxLength={80} placeholder="O primeiro encontro" />
                  </div>
                  <div className="mt-3">
                    <TextArea label="O que aconteceu" value={m.text} onChange={(e) => set({ text: e.target.value })} maxLength={600} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </PanelCard>

      <PanelCard title="Cerimônia">
        <PlaceFields place={form.ceremony} onChange={(p) => update("ceremony", p)} namePlaceholder="Igreja, capela, sítio…" />
      </PanelCard>

      <PanelCard title="Recepção" description="Se a festa for em outro lugar.">
        <Toggle
          label="A festa é em outro lugar"
          checked={form.reception !== null}
          onChange={(on) => update("reception", on ? { ...emptyPlace } : null)}
        />
        {form.reception && (
          <div className="mt-5">
            <PlaceFields place={form.reception} onChange={(p) => update("reception", p)} namePlaceholder="Salão, espaço de eventos…" />
          </div>
        )}
      </PanelCard>

      <PanelCard title="Traje">
        <Field label="Orientação de traje" value={form.dressCode} onChange={(e) => update("dressCode", e.target.value)} maxLength={200} placeholder="Esporte fino. Evite branco 😉" />
      </PanelCard>

      <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} onDiscard={() => setForm(saved)} />
    </form>
  );
}

function PlaceFields({ place, onChange, namePlaceholder }: { place: EventPlace; onChange: (p: EventPlace) => void; namePlaceholder: string }) {
  const set = (patch: Partial<EventPlace>) => onChange({ ...place, ...patch });
  const mapPreview = place.mapsUrl || (place.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address)}` : "");
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
      <Field label="Nome do local" value={place.name} onChange={(e) => set({ name: e.target.value })} maxLength={120} placeholder={namePlaceholder} />
      <Field label="Horário" value={place.time} onChange={(e) => set({ time: e.target.value })} maxLength={20} placeholder="16h00" />
      <div className="sm:col-span-2">
        <Field label="Endereço" value={place.address} onChange={(e) => set({ address: e.target.value })} maxLength={200} placeholder="Rua, número, bairro, cidade" />
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Link do mapa (opcional)"
          value={place.mapsUrl}
          onChange={(e) => set({ mapsUrl: e.target.value })}
          maxLength={500}
          placeholder="https://maps.app.goo.gl/…"
          hint={
            <>
              Sem link, o botão &quot;Ver no mapa&quot; busca pelo endereço.{" "}
              {mapPreview && (
                <a href={mapPreview} target="_blank" rel="noreferrer" className="text-rose-deep underline underline-offset-4">
                  Testar
                </a>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}

function IconButton({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-full transition hover:bg-paper hover:text-rose-deep disabled:opacity-30 disabled:hover:bg-transparent"
      {...props}
    >
      {children}
    </button>
  );
}
