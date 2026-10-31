import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { resetPasswordEmail, sendEmail } from "./email";

export const auth = betterAuth({
  appName: "Juntos",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  // Sem DATABASE_URL o Better Auth guarda contas só na memória (some ao reiniciar).
  database: db
    ? drizzleAdapter(db, {
        provider: "pg",
        schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
      })
    : undefined,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      const email = resetPasswordEmail(user.name, url);
      await sendEmail({ to: user.email, ...email });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24,
  },
  plugins: [nextCookies()],
});

/** Sessão atual (ou null). Memorizada por requisição. */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Para páginas que exigem login: devolve o usuário ou manda para /entrar. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/entrar");
  return session.user;
}
