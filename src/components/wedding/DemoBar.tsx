import Link from "next/link";

// Só aparece no site de exemplo (/demo): deixa claro que é uma vitrine e leva
// o visitante de volta para a plataforma ou direto para o cadastro.

export function DemoTopBar() {
  return (
    <div className="relative z-[45] flex flex-wrap items-center justify-center gap-x-5 gap-y-2 bg-ink px-4 py-2.5 text-center text-sm text-ivory">
      <Link href="/" className="flex items-center gap-1 underline-offset-4 hover:underline">
        <span aria-hidden>←</span> Voltar ao início
      </Link>
      <span className="hidden opacity-80 sm:inline">✨ Este é um site de exemplo</span>
      <Link href="/cadastro" className="rounded-full bg-ivory px-4 py-1 text-xs font-medium uppercase tracking-[0.15em] text-ink transition hover:bg-white">
        Criar o nosso
      </Link>
    </div>
  );
}

export function DemoFloatingCta() {
  return (
    <Link
      href="/cadastro"
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-sm text-ivory shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)] transition hover:-translate-y-0.5 sm:left-auto sm:right-6 sm:translate-x-0"
    >
      <span aria-hidden>💍</span> Quero um site assim
    </Link>
  );
}
