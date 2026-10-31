import { createAuthClient } from "better-auth/react";

// Cliente de login usado nos formulários (roda no navegador).
export const authClient = createAuthClient();

/** Traduz os códigos de erro do Better Auth para mensagens em português. */
export function authErrorMessage(error: { code?: string; message?: string; status?: number } | null | undefined) {
  const map: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: "E-mail ou senha incorretos.",
    USER_ALREADY_EXISTS: "Já existe uma conta com este e-mail. Tente entrar.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Já existe uma conta com este e-mail. Tente entrar.",
    PASSWORD_TOO_SHORT: "A senha precisa ter pelo menos 8 caracteres.",
    PASSWORD_TOO_LONG: "Senha longa demais.",
    INVALID_EMAIL: "E-mail inválido.",
    INVALID_TOKEN: "Este link expirou ou já foi usado. Peça um novo.",
  };
  if (error?.status === 429) return "Muitas tentativas. Espere um minuto e tente de novo.";
  return (error?.code && map[error.code]) || "Algo deu errado. Tente novamente.";
}
