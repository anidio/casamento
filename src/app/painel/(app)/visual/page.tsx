import { requireMyWedding } from "@/lib/my-wedding";
import { VisualForm } from "./form";

export const metadata = { title: "Visual — Juntos" };

export default async function VisualPage() {
  const { wedding } = await requireMyWedding();
  return (
    <VisualForm
      initial={{ theme: wedding.theme, showEnvelope: wedding.showEnvelope }}
      names={{ partner1: wedding.partner1, partner2: wedding.partner2 }}
      slug={wedding.slug}
    />
  );
}
