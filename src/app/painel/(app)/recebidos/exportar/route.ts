import { getSession } from "@/lib/auth";
import { getMyWedding } from "@/lib/my-wedding";
import { listOrders } from "@/lib/orders";

// Planilha (CSV) com todos os presentes recebidos. Abre no Excel e no Google Planilhas.
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Faça login.", { status: 401 });
  const wedding = await getMyWedding(session.user.id);
  if (!wedding) return new Response("Casamento não encontrado.", { status: 404 });

  const orders = await listOrders(wedding.id);
  const cell = (v: string) => {
    // Evita que o Excel interprete o texto como fórmula.
    const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

  const rows = [
    ["Data", "Convidado", "Presente", "Valor (R$)", "Status", "Código", "Recado"],
    ...orders.map((o) => [
      date.format(o.createdAt),
      o.guestName,
      o.giftName,
      (o.amountCents / 100).toFixed(2).replace(".", ","),
      o.status,
      o.code,
      o.message ?? "",
    ]),
  ];
  // ";" e BOM: o Excel em português abre com acentos e colunas certas.
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="presentes-${wedding.slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
