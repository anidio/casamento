"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/form";
import { PanelCard, Toggle } from "@/components/ui/panel";
import { deleteMessageAction, deleteRsvpAction, setMessageApprovedAction, setModerationAction } from "./actions";

type Rsvp = { id: string; guestName: string; attending: boolean; partySize: number; phone: string | null; message: string | null; createdAt: string };
type Message = { id: string; author: string; body: string; approved: boolean; createdAt: string };

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

/** Link do WhatsApp a partir do telefone digitado pelo convidado. */
function whatsappLink(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d.length >= 12 ? `https://wa.me/${d}` : null;
}

function useRun() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  function run(id: string, action: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(id);
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Algo deu errado.");
      router.refresh();
      setBusy(null);
    });
  }
  return { busy, error, run };
}

export function RsvpList({ rsvps }: { rsvps: Rsvp[] }) {
  const { busy, error, run } = useRun();
  const [filter, setFilter] = useState<"todos" | "sim" | "nao">("todos");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const visible = rsvps
    .filter((r) => (filter === "todos" ? true : filter === "sim" ? r.attending : !r.attending))
    .filter((r) => !query || norm(r.guestName).includes(norm(query)));

  return (
    <PanelCard
      title="Confirmações de presença"
      aside={
        rsvps.length > 0 && (
          <a
            href="/painel/convidados/exportar"
            download
            className="rounded-full border border-rose-deep/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-rose-deep transition hover:bg-rose-deep hover:text-ivory"
          >
            Baixar planilha (CSV)
          </a>
        )
      }
    >
      {rsvps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 p-8 text-center">
          <p className="text-4xl">✉️</p>
          <p className="mt-2 font-serif text-xl">Ninguém respondeu ainda</p>
          <p className="mt-1 text-sm text-ink-soft">Mandem o link do site para os convidados. As respostas aparecem aqui na hora.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {(
              [
                ["todos", `Todos ${rsvps.length}`],
                ["sim", `Vão ${rsvps.filter((r) => r.attending).length}`],
                ["nao", `Não vão ${rsvps.filter((r) => !r.attending).length}`],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === id ? "border-rose-deep bg-rose-deep text-ivory" : "border-gold/30 bg-white/70 hover:border-rose-deep"}`}
              >
                {label}
              </button>
            ))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar nome…"
              aria-label="Buscar convidado"
              className="ml-auto w-full rounded-full border border-gold/30 bg-white/70 px-4 py-1.5 text-sm outline-none focus:border-rose-deep sm:w-56"
            />
          </div>
          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}
          {visible.length === 0 ? (
            <p className="py-6 text-center text-ink-soft">Nada por aqui.</p>
          ) : (
            <ul className="divide-y divide-gold/15">
              {visible.map((r) => {
                const wa = r.phone ? whatsappLink(r.phone) : null;
                return (
                  <li key={r.id} className={`py-4 ${busy === r.id ? "animate-pulse" : ""}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm ${r.attending ? "bg-sage/30" : "bg-paper"}`} aria-hidden>
                        {r.attending ? "✓" : "✕"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-xl leading-tight">{r.guestName}</p>
                        <p className="text-sm text-ink-soft">
                          {r.attending ? (r.partySize === 1 ? "Vai sozinho(a)" : `Vai com ${r.partySize - 1} ${r.partySize === 2 ? "acompanhante" : "acompanhantes"} · ${r.partySize} pessoas`) : "Não vai"}
                          {" · "}
                          {dateFmt.format(new Date(r.createdAt))}
                        </p>
                      </div>
                      {wa && (
                        <a href={wa} target="_blank" rel="noreferrer" className="rounded-full border border-sage/50 px-3 py-1 text-sm hover:bg-sage/20">
                          WhatsApp
                        </a>
                      )}
                      {confirm === r.id ? (
                        <span className="flex items-center gap-1 text-sm">
                          Excluir?
                          <button type="button" onClick={() => run(r.id, () => deleteRsvpAction(r.id))} className="rounded-full bg-rose-deep px-3 py-1 text-ivory">
                            Sim
                          </button>
                          <button type="button" onClick={() => setConfirm(null)} className="rounded-full px-3 py-1 hover:bg-paper">
                            Não
                          </button>
                        </span>
                      ) : (
                        <button type="button" onClick={() => setConfirm(r.id)} aria-label={`Excluir resposta de ${r.guestName}`} title="Excluir" className="flex size-8 items-center justify-center rounded-full text-ink-soft hover:bg-paper hover:text-rose-deep">
                          🗑
                        </button>
                      )}
                    </div>
                    {r.message && <blockquote className="ml-12 mt-2 rounded-xl border-l-2 border-gold bg-white/70 px-4 py-2 font-serif italic text-ink-soft">“{r.message}”</blockquote>}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </PanelCard>
  );
}

export function MessageModeration({ moderate, messages }: { moderate: boolean; messages: Message[] }) {
  const { busy, error, run } = useRun();
  const pending = messages.filter((m) => !m.approved);
  const approved = messages.filter((m) => m.approved);

  return (
    <PanelCard id="recados" title="Mural de recados" description="Recados que os convidados deixam no site, visíveis para todos.">
      <div className="rounded-2xl bg-ivory/70 p-4">
        <Toggle
          label="Aprovar antes de publicar"
          description="Com isso ligado, cada recado novo só aparece no site depois que vocês aprovarem."
          checked={moderate}
          onChange={(v) => run("moderate", () => setModerationAction(v))}
        />
      </div>
      {error && (
        <div className="mt-4">
          <Alert>{error}</Alert>
        </div>
      )}

      {messages.length === 0 ? (
        <p className="mt-6 text-center text-ink-soft">Nenhum recado ainda.</p>
      ) : (
        <div className="mt-6 space-y-6">
          {pending.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-rose-deep">Aguardando aprovação ({pending.length})</h3>
              <MessageItems items={pending} busy={busy} run={run} />
            </div>
          )}
          {approved.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-ink-soft">No site ({approved.length})</h3>
              <MessageItems items={approved} busy={busy} run={run} />
            </div>
          )}
        </div>
      )}
    </PanelCard>
  );
}

function MessageItems({ items, busy, run }: { items: Message[]; busy: string | null; run: ReturnType<typeof useRun>["run"] }) {
  const [confirm, setConfirm] = useState<string | null>(null);
  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id} className={`rounded-2xl border p-4 ${m.approved ? "border-gold/20 bg-ivory/60" : "border-dashed border-rose/50 bg-white/50"} ${busy === m.id ? "animate-pulse" : ""}`}>
          <p className="whitespace-pre-line font-serif text-lg">“{m.body}”</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{m.author}</span>
            <span className="text-ink-soft">· {dateFmt.format(new Date(m.createdAt))}</span>
            <span className="ml-auto flex flex-wrap gap-2">
              {m.approved ? (
                <button type="button" onClick={() => run(m.id, () => setMessageApprovedAction(m.id, false))} className="rounded-full border border-gold/40 px-3 py-1 hover:border-rose-deep">
                  Esconder do site
                </button>
              ) : (
                <button type="button" onClick={() => run(m.id, () => setMessageApprovedAction(m.id, true))} className="rounded-full bg-rose-deep px-3 py-1 text-ivory hover:brightness-110">
                  ✓ Aprovar
                </button>
              )}
              {confirm === m.id ? (
                <>
                  <button type="button" onClick={() => run(m.id, () => deleteMessageAction(m.id))} className="rounded-full bg-rose-deep px-3 py-1 text-ivory">
                    Excluir de vez
                  </button>
                  <button type="button" onClick={() => setConfirm(null)} className="rounded-full px-3 py-1 hover:bg-paper">
                    Cancelar
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setConfirm(m.id)} className="rounded-full px-3 py-1 text-ink-soft hover:bg-paper hover:text-rose-deep">
                  Excluir
                </button>
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
