import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getMyWedding } from "@/lib/my-wedding";
import { CreateWeddingWizard } from "./wizard";

export const metadata = { title: "Criar nosso site — Juntos" };

export default async function NewWeddingPage() {
  const user = await requireUser();
  if (await getMyWedding(user.id)) redirect("/painel");
  return <CreateWeddingWizard firstName={user.name.split(" ")[0]} />;
}
