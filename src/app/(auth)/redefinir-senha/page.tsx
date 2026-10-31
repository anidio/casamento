"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Alert, AuthShell, Button, Field } from "@/components/ui/form";
import { authClient, authErrorMessage } from "@/lib/auth-client";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [error, setError] = useState<string | null>(params.get("error") ? "Este link expirou ou já foi usado. Peça um novo." : null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <Alert>{error ?? "Link inválido."}</Alert>
        <Link href="/esqueci-senha" className="text-rose-deep underline-offset-4 hover:underline">
          Pedir um novo link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password"));
    if (newPassword !== form.get("confirm")) return setError("As senhas não são iguais.");
    setLoading(true);
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword, token: token! });
    if (error) {
      setLoading(false);
      return setError(authErrorMessage(error));
    }
    router.push("/entrar?senha=ok");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nova senha" name="password" type="password" autoComplete="new-password" required minLength={8} hint="Mínimo de 8 caracteres." />
      <Field label="Confirme a nova senha" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} className="w-full">
        Salvar nova senha
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Nova senha">
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
