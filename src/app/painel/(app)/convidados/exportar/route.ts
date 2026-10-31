import { getSession } from "@/lib/auth";
import { listRsvps } from "@/lib/guests";
import { getMyWedding } from "@/lib/my-wedding";

// Planilha (CSV) com as confirmações de presença. Abre no Excel e no Google Planilhas.
export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Faça login.", { status: 401 });
  const wedding = await getMyWedding(session.user.id);
  if (!wedding) return new Response("Casamento não encontrado.", { status: 404 });

  const list = await listRsvps(wedding.id);
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

  const rows = [
    ["Nome", "Vai?", "Pessoas", "WhatsApp", "Recado", "Respondeu em"],
    ...list.map((r) => [r.guestName, r.attending ? "Sim" : "Não", String(r.partySize), r.phone ?? "", r.message ?? "", date.format(r.createdAt)]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="convidados-${wedding.slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
