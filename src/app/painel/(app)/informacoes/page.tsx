import { requireMyWedding } from "@/lib/my-wedding";
import { InfoForm } from "./form";

export const metadata = { title: "Informações — Juntos" };

/** Data e hora no fuso de Brasília, no formato dos campos do formulário. */
function toLocalInputs(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

export default async function InfoPage() {
  const { wedding } = await requireMyWedding();
  const { date, time } = toLocalInputs(wedding.weddingDate);

  return (
    <InfoForm
      initial={{
        partner1: wedding.partner1,
        partner2: wedding.partner2,
        date,
        time,
        headline: wedding.headline,
        invitationText: wedding.invitationText,
        story: wedding.story,
        ceremony: wedding.ceremony,
        reception: wedding.reception ?? null,
        dressCode: wedding.dressCode,
      }}
    />
  );
}
