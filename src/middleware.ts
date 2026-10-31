import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Barreira rápida: sem cookie de sessão, /painel manda para o login.
// A verificação de verdade (sessão válida e dono do casamento) é feita no
// servidor de cada página e ação.
export function middleware(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const url = new URL("/entrar", request.url);
    url.searchParams.set("voltar", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/painel/:path*"] };
