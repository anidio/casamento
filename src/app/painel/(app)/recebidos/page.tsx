import { PageTitle } from "@/components/ui/panel";
import { requireMyWedding } from "@/lib/my-wedding";
import { listOrders, orderTotals } from "@/lib/orders";
import { formatBRL } from "@/lib/pix";
import { OrderList } from "./list";

export const metadata = { title: "Recebidos — Juntos" };

export default async function ReceivedPage() {
  const { wedding } = await requireMyWedding();
  const [orders, totals] = await Promise.all([listOrders(wedding.id), orderTotals(wedding.id)]);

  return (
    <div className="space-y-6">
      <PageTitle
        title="Presentes recebidos"
        description="Quando um convidado clica em “Já fiz o Pix”, o presente aparece aqui como pendente. Confiram no extrato do banco (pelo código ou pelo valor) e marquem como pago."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-gold/25 bg-white/70 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Confirmado</p>
          <p className="mt-2 font-serif text-4xl text-rose-deep">{formatBRL(totals.paidCents)}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {totals.paidCount} {totals.paidCount === 1 ? "presente pago" : "presentes pagos"}
          </p>
        </div>
        <div className="rounded-3xl border border-dashed border-gold/40 bg-white/40 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Aguardando conferência</p>
          <p className="mt-2 font-serif text-4xl">{formatBRL(totals.pendingCents)}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {totals.pendingCount} {totals.pendingCount === 1 ? "presente pendente" : "presentes pendentes"}
          </p>
        </div>
      </div>

      <OrderList
        orders={orders.map((o) => ({
          id: o.id,
          code: o.code,
          giftName: o.giftName || "Presente",
          guestName: o.guestName,
          message: o.message,
          amountCents: o.amountCents,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
