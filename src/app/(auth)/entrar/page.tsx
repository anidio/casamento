"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Alert, AuthShell, Button, Field } from "@/components/ui/form";
import { authClient, authErrorMessage } from "@/lib/auth-client";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const back = params.get("voltar");
  const next = back?.startsWith("/painel") ? back : "/painel";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")).trim().toLowerCase(),
      password: String(form.get("password")),
      rememberMe: true,
    });
    if (error) {
      setLoading(false);
      return setError(authErrorMessage(error));
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {params.get("senha") === "ok" && <Alert kind="success">Senha alterada. Entre com a nova senha.</Alert>}
      <Field label="E-mail" name="email" type="email" autoComplete="email" required />
      <Field label="Senha" name="password" type="password" autoComplete="current-password" required />
      <div className="text-right text-sm">
        <Link href="/esqueci-senha" className="text-ink-soft underline-offset-4 hover:text-rose-deep hover:underline">
          Esqueci minha senha
        </Link>
      </div>
      {error && <Alert>{error}</Alert>}
      <Button type="submit" loading={loading} className="w-full">
        Entrar
      </Button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse o painel do seu casamento."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-rose-deep underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
