"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, AuthShell, Button, Field } from "@/components/ui/form";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const { error } = await authClient.requestPasswordReset({
      email: String(form.get("email")).trim().toLowerCase(),
      redirectTo: "/redefinir-senha",
    });
    setLoading(false);
    if (error) return setError(authErrorMessage(error));
    setSent(true);
  }

  return (
    <AuthShell
      title="Esqueci a senha"
      subtitle="Mandamos um link para você criar uma nova."
      footer={
        <Link href="/entrar" className="text-rose-deep underline-offset-4 hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {sent ? (
        <Alert kind="success">Se existir uma conta com esse e-mail, o link chega em instantes. Confira também o spam.</Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="E-mail" name="email" type="email" autoComplete="email" required />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" loading={loading} className="w-full">
            Enviar link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
