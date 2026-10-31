"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/form";
import { PanelCard } from "@/components/ui/panel";
import { formatBRL } from "@/lib/pix";
import { setOrderStatusAction } from "./actions";

type Status = "pendente" | "pago" | "cancelado";
type Order = { id: string; code: string; giftName: string; guestName: string; message: string | null; amountCents: number; status: Status; createdAt: string };

const FILTERS: { id: "todos" | Status; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "pendente", label: "Pendentes" },
  { id: "pago", label: "Pagos" },
  { id: "cancelado", label: "Cancelados" },
];

const BADGE: Record<Status, string> = {
  pendente: "bg-gold/15 text-ink",
  pago: "bg-sage/25 text-ink",
  cancelado: "bg-paper text-ink-soft line-through",
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

export function OrderList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todos");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = filter === "todos" ? orders.filter((o) => o.status !== "cancelado") : orders.filter((o) => o.status === filter);
  const count = (s: Status) => orders.filter((o) => o.status === s).length;

  function setStatus(id: string, status: Status) {
    setBusy(id);
    setError(null);
    startTransition(async () => {
      const result = await setOrderStatusAction(id, status);
      if (!result.ok) setError(result.error ?? "Algo deu errado.");
      router.refresh();
      setBusy(null);
    });
  }

  return (
    <PanelCard
      title="Lista"
      aside={
        orders.length > 0 && (
          <a
            href="/painel/recebidos/exportar"
            download
            className="rounded-full border border-rose-deep/40 px-4 py-2 text-xs uppercase tracking-[0.2em] text-rose-deep transition hover:bg-rose-deep hover:text-ivory"
          >
            Baixar planilha (CSV)
          </a>
        )
      }
    >
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gold/40 p-8 text-center">
          <p className="text-4xl">💌</p>
          <p className="mt-2 font-serif text-xl">Nenhum presente ainda</p>
          <p className="mt-1 text-sm text-ink-soft">Quando os convidados presentearem, eles aparecem aqui e vocês recebem um e-mail.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrar presentes">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === f.id ? "border-rose-deep bg-rose-deep text-ivory" : "border-gold/30 bg-white/70 hover:border-rose-deep"}`}
              >
                {f.label}
                {f.id !== "todos" && <span className="ml-1.5 opacity-70">{count(f.id)}</span>}
              </button>
            ))}
          </div>
          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}
          {visible.length === 0 ? (
            <p className="py-6 text-center text-ink-soft">Nada por aqui.</p>
          ) : (
            <ul className="space-y-3">
              {visible.map((o) => (
                <li key={o.id} className={`rounded-2xl border border-gold/20 bg-ivory/60 p-4 transition ${busy === o.id ? "animate-pulse" : ""}`}>
                  <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xl leading-tight">{o.guestName}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {o.giftName} · {dateFmt.format(new Date(o.createdAt))}
                        {o.code && (
                          <>
                            {" "}
                            · código <b className="tracking-widest text-ink">{o.code}</b>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-2xl text-rose-deep">{formatBRL(o.amountCents)}</p>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.15em] ${BADGE[o.status]}`}>{o.status}</span>
                    </div>
                  </div>
                  {o.message && <blockquote className="mt-3 rounded-xl border-l-2 border-gold bg-white/70 px-4 py-2 font-serif italic text-ink-soft">“{o.message}”</blockquote>}
                  <div className="mt-3 flex flex-wrap justify-end gap-2 text-sm">
                    {o.status !== "pago" && (
                      <button type="button" disabled={busy === o.id} onClick={() => setStatus(o.id, "pago")} className="rounded-full bg-rose-deep px-4 py-1.5 text-ivory transition hover:brightness-110">
                        ✓ Marcar como pago
                      </button>
                    )}
                    {o.status !== "pendente" && (
                      <button type="button" disabled={busy === o.id} onClick={() => setStatus(o.id, "pendente")} className="rounded-full border border-gold/40 px-4 py-1.5 hover:border-rose-deep">
                        Voltar para pendente
                      </button>
                    )}
                    {o.status !== "cancelado" && (
                      <button
                        type="button"
                        disabled={busy === o.id}
                        onClick={() => setStatus(o.id, "cancelado")}
                        className="rounded-full px-3 py-1.5 text-ink-soft underline-offset-4 hover:text-rose-deep hover:underline"
                        title="Use quando o Pix não chegou ou foi um engano"
                      >
                        Não recebi
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </PanelCard>
  );
}
