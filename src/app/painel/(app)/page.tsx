import { count, eq } from "drizzle-orm";
import Link from "next/link";
import { requireDb } from "@/db";
import { gifts } from "@/db/schema";
import { Divider } from "@/components/ornaments";
import { formatWeddingDate } from "@/components/wedding/Sections";
import { requireMyWedding } from "@/lib/my-wedding";
import { orderTotals } from "@/lib/orders";
import { rsvpTotals } from "@/lib/guests";
import { formatBRL } from "@/lib/pix";
import { CopyLinkButton, PublishToggle } from "./client";

export const metadata = { title: "Painel — Juntos" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
  const { wedding } = await requireMyWedding();
  const [[{ total: giftCount }], totals, guests] = await Promise.all([
    requireDb().select({ total: count() }).from(gifts).where(eq(gifts.weddingId, wedding.id)),
    orderTotals(wedding.id),
    rsvpTotals(wedding.id),
  ]);

  const justCreated = (await searchParams).novo === "1";
  const date = formatWeddingDate(wedding.weddingDate.toISOString());
  const daysLeft = Math.max(0, Math.floor((wedding.weddingDate.getTime() - Date.now()) / 86_400_000));

  const checklist = [
    { done: Boolean(wedding.ceremony.name || wedding.ceremony.address), label: "Local e horário da cerimônia", href: "/painel/informacoes" },
    { done: wedding.story.length > 0, label: "Contar a história de vocês", href: "/painel/informacoes#historia" },
    { done: giftCount > 0, label: "Montar a lista de presentes", href: "/painel/presentes" },
    { done: Boolean(wedding.pixKey), label: "Cadastrar a chave Pix", href: "/painel/presentes#pix" },
    { done: wedding.published, label: "Publicar o site", href: "#publicar" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;

  return (
    <div className="space-y-10">
      {justCreated && !wedding.published && (
        <p className="rounded-2xl bg-sage/20 px-5 py-4 text-center font-serif text-lg">
          🎉 O site de vocês foi criado! Ele começa como <b>rascunho</b>: só vocês conseguem ver até publicar.
        </p>
      )}

      <section className="rounded-3xl border border-gold/25 bg-white/70 p-6 text-center shadow-[0_20px_60px_-30px_rgba(61,47,42,.5)] sm:p-10">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${wedding.published ? "bg-sage/25 text-ink" : "bg-gold/15 text-ink-soft"}`}
        >
          {wedding.published ? "● Publicado" : "○ Rascunho"}
        </span>
        <h1 className="mt-4 font-script text-6xl text-rose-deep sm:text-7xl">
          {wedding.partner1} & {wedding.partner2}
        </h1>
        <p className="mt-2 font-serif text-xl tracking-[0.2em]">{date.short}</p>
        <p className="mt-1 font-serif italic text-ink-soft">
          {daysLeft === 0 ? "Falta menos de um dia! 💍" : daysLeft === 1 ? "falta 1 dia" : `faltam ${daysLeft} dias`}
        </p>
        <Divider className="my-6" />
        <p className="break-all font-serif text-lg">
          <span className="text-ink-soft">Endereço:</span> <b className="text-rose-deep">/{wedding.slug}</b>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/${wedding.slug}`}
            target="_blank"
            className="rounded-full bg-rose-deep px-6 py-3 text-sm uppercase tracking-[0.2em] text-ivory shadow-md transition hover:brightness-110"
          >
            {wedding.published ? "Ver o site" : "Ver prévia"}
          </Link>
          <CopyLinkButton slug={wedding.slug} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href="/painel/recebidos"
          className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold/25 bg-white/70 p-6 transition hover:border-rose-deep/40 sm:p-8"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">💌 Presentes recebidos</p>
            <p className="mt-2 font-serif text-4xl text-rose-deep">{formatBRL(totals.paidCents)}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {totals.paidCount} {totals.paidCount === 1 ? "confirmado" : "confirmados"}
              {totals.pendingCount > 0 && (
                <>
                  {" "}
                  · <b className="text-ink">{totals.pendingCount} aguardando conferência</b> ({formatBRL(totals.pendingCents)})
                </>
              )}
            </p>
          </div>
          <span className="text-sm uppercase tracking-[0.2em] text-rose-deep transition group-hover:translate-x-1">Ver lista →</span>
        </Link>
        <Link
          href="/painel/convidados"
          className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-gold/25 bg-white/70 p-6 transition hover:border-rose-deep/40 sm:p-8"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">👥 Convidados</p>
            <p className="mt-2 font-serif text-4xl text-rose-deep">
              {guests.people} {guests.people === 1 ? "pessoa" : "pessoas"}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              confirmadas · {guests.yes + guests.no} {guests.yes + guests.no === 1 ? "resposta" : "respostas"}
            </p>
          </div>
          <span className="text-sm uppercase tracking-[0.2em] text-rose-deep transition group-hover:translate-x-1">Ver lista →</span>
        </Link>
      </div>

      <section className="rounded-3xl border border-gold/25 bg-white/60 p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl">Deixando o site pronto</h2>
          <span className="text-sm text-ink-soft">
            {doneCount} de {checklist.length}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper">
          <div className="h-full rounded-full bg-rose-deep transition-all" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
        </div>
        <ul className="mt-6 divide-y divide-gold/15">
          {checklist.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className="flex items-center gap-4 py-3 transition hover:text-rose-deep">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-sm ${item.done ? "border-sage bg-sage text-ivory" : "border-gold/40 text-transparent"}`}
                  aria-hidden
                >
                  ✓
                </span>
                <span className={item.done ? "text-ink-soft line-through decoration-gold/50" : ""}>{item.label}</span>
                <span className="ml-auto text-ink-soft" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="publicar">
        <PublishToggle published={wedding.published} />
      </section>
    </div>
  );
}
