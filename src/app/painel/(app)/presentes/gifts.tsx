"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Alert, Button, Field } from "@/components/ui/form";
import { PanelCard, TextArea, Toggle } from "@/components/ui/panel";
import { EMOJI_CHOICES, GIFT_IDEAS } from "@/lib/gift-ideas";
import { formatBRL } from "@/lib/pix";
import {
  createGiftAction,
  deleteGiftAction,
  moveGiftAction,
  setFreeAmountAction,
  setGiftActiveAction,
  updateGiftAction,
  type GiftInput,
} from "./actions";

type GiftRow = GiftInput & { id: string; active: boolean };
type Editing = { mode: "new"; initial: GiftInput } | { mode: "edit"; id: string; initial: GiftInput } | null;

const blank: GiftInput = { emoji: "🎁", name: "", description: "", priceCents: 10000 };

export function GiftManager({ gifts, hasPix, allowFreeAmount }: { gifts: GiftRow[]; hasPix: boolean; allowFreeAmount: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function run(id: string, action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusyId(id);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Algo deu errado.");
      setConfirmDelete(null);
      router.refresh();
      setBusyId(null);
    });
  }

  const activeCount = gifts.filter((g) => g.active).length;
  const usedNames = new Set(gifts.map((g) => g.name));
  const ideas = GIFT_IDEAS.filter((i) => !usedNames.has(i.name));

  return (
    <>
      <PanelCard
        title="Lista de presentes"
        description={gifts.length ? `${activeCount} visíveis no site${gifts.length > activeCount ? `, ${gifts.length - activeCount} ocultos` : ""}.` : undefined}
        aside={
          <Button type="button" onClick={() => setEditing({ mode: "new", initial: blank })} className="px-5 py-2">
            + Presente
          </Button>
        }
      >
        {!hasPix && gifts.length > 0 && (
          <div className="mb-4">
            <Alert>Cadastrem a chave Pix acima: sem ela, o botão &quot;Presentear&quot; fica desativado no site.</Alert>
          </div>
        )}
        {error && (
          <div className="mb-4">
            <Alert>{error}</Alert>
          </div>
        )}

        {gifts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/40 p-8 text-center">
            <p className="text-4xl">🎁</p>
            <p className="mt-2 font-serif text-xl">Nenhum presente ainda</p>
            <p className="mt-1 text-sm text-ink-soft">Criem o primeiro ou escolham uma das sugestões abaixo.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {gifts.map((g, i) => (
              <li
                key={g.id}
                className={`flex flex-wrap items-center gap-4 rounded-2xl border p-4 transition sm:flex-nowrap ${g.active ? "border-gold/20 bg-ivory/60" : "border-dashed border-gold/30 bg-white/30 opacity-60"} ${busyId === g.id ? "animate-pulse" : ""}`}
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--rose)_14%,var(--ivory))] text-3xl">{g.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-xl leading-tight">
                    {g.name} {!g.active && <span className="ml-1 rounded-full bg-paper px-2 py-0.5 align-middle font-sans text-[10px] uppercase tracking-[0.2em] text-ink-soft">oculto</span>}
                  </p>
                  {g.description && <p className="mt-0.5 line-clamp-2 text-sm text-ink-soft">{g.description}</p>}
                </div>
                <span className="font-serif text-xl text-rose-deep">{formatBRL(g.priceCents)}</span>
                <div className="flex w-full items-center justify-end gap-1 text-ink-soft sm:w-auto">
                  {confirmDelete === g.id ? (
                    <>
                      <span className="mr-1 text-sm">Excluir?</span>
                      <button type="button" onClick={() => run(g.id, () => deleteGiftAction(g.id))} className="rounded-full bg-rose-deep px-3 py-1 text-sm text-ivory">
                        Sim
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-full px-3 py-1 text-sm hover:bg-paper">
                        Não
                      </button>
                    </>
                  ) : (
                    <>
                      <IconBtn label="Subir" disabled={i === 0 || pending} onClick={() => run(g.id, () => moveGiftAction(g.id, "up"))}>↑</IconBtn>
                      <IconBtn label="Descer" disabled={i === gifts.length - 1 || pending} onClick={() => run(g.id, () => moveGiftAction(g.id, "down"))}>↓</IconBtn>
                      <IconBtn label={g.active ? "Ocultar do site" : "Mostrar no site"} disabled={pending} onClick={() => run(g.id, () => setGiftActiveAction(g.id, !g.active))}>
                        {g.active ? "👁" : "🙈"}
                      </IconBtn>
                      <IconBtn label="Editar" onClick={() => setEditing({ mode: "edit", id: g.id, initial: g })}>✎</IconBtn>
                      <IconBtn label="Excluir" onClick={() => setConfirmDelete(g.id)}>🗑</IconBtn>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelCard>

      <PanelCard title="Contribuição livre">
        <Toggle
          label="Deixar o convidado escolher o valor"
          description="Aparece um cartão “Contribuição livre” no fim da lista, para quem prefere dar outro valor."
          checked={allowFreeAmount}
          onChange={(v) => run("free", () => setFreeAmountAction(v))}
        />
      </PanelCard>

      {ideas.length > 0 && (
        <PanelCard title="Sem ideias? 😄" description="Toquem numa sugestão para adicionar. Dá para mudar o texto e o valor antes de salvar.">
          <div className="flex flex-wrap gap-2">
            {ideas.map((idea) => (
              <button
                key={idea.name}
                type="button"
                onClick={() => setEditing({ mode: "new", initial: idea })}
                className="rounded-full border border-gold/30 bg-white/70 px-4 py-2 text-left text-sm transition hover:-translate-y-0.5 hover:border-rose-deep"
              >
                {idea.emoji} {idea.name}
              </button>
            ))}
          </div>
        </PanelCard>
      )}

      <AnimatePresence>
        {editing && (
          <GiftEditor
            key={editing.mode === "edit" ? editing.id : "new"}
            title={editing.mode === "new" ? "Novo presente" : "Editar presente"}
            initial={editing.initial}
            onClose={() => setEditing(null)}
            onSave={async (data) => {
              const result = editing.mode === "new" ? await createGiftAction(data) : await updateGiftAction(editing.id, data);
              if (result.ok) {
                setEditing(null);
                router.refresh();
              }
              return result;
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function IconBtn({ label, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex size-9 items-center justify-center rounded-full transition hover:bg-paper hover:text-rose-deep disabled:opacity-30 disabled:hover:bg-transparent"
      {...props}
    >
      {children}
    </button>
  );
}

/** "1.234,56" → 123456 centavos. */
function parseBRL(text: string) {
  const clean = text.replace(/[^\d,]/g, "");
  if (!clean) return NaN;
  const [reais, centavos = ""] = clean.split(",");
  return Number(reais) * 100 + Number(centavos.padEnd(2, "0").slice(0, 2));
}

const centsToText = (c: number) => (c / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function GiftEditor({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial: GiftInput;
  onClose: () => void;
  onSave: (data: GiftInput) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [emoji, setEmoji] = useState(initial.emoji);
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(centsToText(initial.priceCents));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = parseBRL(price);
    if (!Number.isFinite(priceCents)) return setError("Informe um valor, por exemplo 80,00.");
    startTransition(async () => {
      const result = await onSave({ emoji, name, description, priceCents });
      if (!result.ok) setError(result.error ?? "Algo deu errado.");
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        className="paper-bg max-h-[92svh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="text-2xl leading-none text-ink-soft">
            ×
          </button>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs uppercase tracking-[0.2em] text-ink-soft">Ícone</legend>
          <div className="flex items-center gap-3">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--rose)_14%,var(--ivory))] text-4xl">{emoji}</span>
            <div className="flex flex-wrap gap-1">
              {EMOJI_CHOICES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  aria-label={`Usar ${e}`}
                  aria-pressed={emoji === e}
                  className={`size-9 rounded-lg text-xl transition hover:bg-paper ${emoji === e ? "bg-paper ring-1 ring-rose-deep" : ""}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        <Field label="Nome do presente" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoFocus placeholder="Curso de dobrar lençol de elástico" />
        <TextArea label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={240} rows={2} placeholder="Uma frase engraçada sobre o presente" />
        <Field
          label="Valor (R$)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={() => {
            const c = parseBRL(price);
            if (Number.isFinite(c)) setPrice(centsToText(c));
          }}
          inputMode="decimal"
          required
          placeholder="80,00"
        />

        {error && <Alert>{error}</Alert>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={pending} className="flex-1">
            Salvar presente
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
