"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AuthShell, Button, Field } from "@/components/ui/form";
import { authClient, authErrorMessage } from "@/lib/auth-client";

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== form.get("confirm")) return setError("As senhas não são iguais.");

    setLoading(true);
    setError(null);
    const { error } = await authClient.signUp.email({
      name: String(form.get("name")).trim(),
      email: String(form.get("email")).trim().toLowerCase(),
      password,
    });
    if (error) {
      setLoading(false);
      return setError(authErrorMessage(error));
    }
    router.push("/painel/novo");
    router.refresh();
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Em poucos minutos o site do casamento de vocês fica pronto."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/entrar" className="text-rose-deep underline-offset-4 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Seu nome" name="name" autoComplete="name" required maxLength={80} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" required />
        <Field label="Senha" name="password" type="password" autoComplete="new-password" required minLength={8} hint="Mínimo de 8 caracteres." />
        <Field label="Confirme a senha" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
        {error && <Alert>{error}</Alert>}
        <Button type="submit" loading={loading} className="w-full">
          Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}
