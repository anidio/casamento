import { PageTitle } from "@/components/ui/panel";
import { listAllMessages, listRsvps, rsvpTotals } from "@/lib/guests";
import { requireMyWedding } from "@/lib/my-wedding";
import { MessageModeration, RsvpList } from "./lists";

export const metadata = { title: "Convidados — Juntos" };

export default async function GuestsPage() {
  const { wedding } = await requireMyWedding();
  const [list, totals, msgs] = await Promise.all([listRsvps(wedding.id), rsvpTotals(wedding.id), listAllMessages(wedding.id)]);
  const pendingMsgs = msgs.filter((m) => !m.approved).length;

  const cards = [
    { label: "Pessoas confirmadas", value: totals.people, hint: "somando acompanhantes", strong: true },
    { label: "Vão", value: totals.yes, hint: totals.yes === 1 ? "resposta" : "respostas" },
    { label: "Não vão", value: totals.no, hint: totals.no === 1 ? "resposta" : "respostas" },
    { label: "Recados", value: msgs.length, hint: pendingMsgs ? `${pendingMsgs} aguardando aprovação` : "no mural" },
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Convidados" description="Quem confirmou presença pelo site e os recados deixados no mural." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-3xl border p-5 ${c.strong ? "border-rose-deep/30 bg-white/80" : "border-gold/25 bg-white/60"}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">{c.label}</p>
            <p className={`mt-2 font-serif text-4xl ${c.strong ? "text-rose-deep" : ""}`}>{c.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{c.hint}</p>
          </div>
        ))}
      </div>

      <RsvpList
        rsvps={list.map((r) => ({
          id: r.id,
          guestName: r.guestName,
          attending: r.attending,
          partySize: r.partySize,
          phone: r.phone,
          message: r.message,
          createdAt: r.createdAt.toISOString(),
        }))}
      />

      <MessageModeration
        moderate={wedding.moderateMessages}
        messages={msgs.map((m) => ({ id: m.id, author: m.author, body: m.body, approved: m.approved, createdAt: m.createdAt.toISOString() }))}
      />
    </div>
  );
}
