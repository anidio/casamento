import Link from "next/link";
import { Divider, FloralBranch } from "@/components/ornaments";

// Página inicial da plataforma (para os noivos).
export default function Home() {
  const features = [
    ["💌", "Convite animado", "Um envelope que se abre na tela do convidado."],
    ["🎁", "Presentes criativos", "Monte a lista que quiser, até as mais engraçadas."],
    ["⚡", "Pix direto para vocês", "Sem intermediário e sem taxa da plataforma."],
    ["✅", "Confirmação de presença", "Saibam quem vem, sem planilha."],
  ];
  return (
    <main className="paper-bg relative min-h-svh overflow-hidden px-4">
      <FloralBranch className="absolute -left-8 -top-8 w-52 opacity-60 sm:w-80" />
      <FloralBranch flip className="absolute -right-8 -top-8 w-52 opacity-60 sm:w-80" />

      <nav className="relative z-10 mx-auto flex max-w-5xl justify-end pt-5">
        <Link href="/entrar" className="rounded-full border border-gold/40 bg-ivory/60 px-5 py-2 text-xs uppercase tracking-[0.2em] text-ink-soft backdrop-blur transition hover:border-rose-deep hover:text-rose-deep">
          Entrar
        </Link>
      </nav>
      <section className="mx-auto flex max-w-3xl flex-col items-center pb-16 pt-20 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gold">O site do seu casamento</p>
        <h1 className="mt-6 font-script text-7xl text-rose-deep sm:text-8xl">Juntos</h1>
        <Divider className="mt-6" />
        <p className="mt-8 max-w-xl font-serif text-2xl leading-relaxed text-ink-soft">
          Convite, história, confirmação de presença e lista de presentes, com o dinheiro caindo direto na conta de vocês.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/demo" className="rounded-full bg-rose-deep px-8 py-3 text-sm uppercase tracking-[0.25em] text-ivory shadow-md transition hover:brightness-110">
            Ver exemplo
          </Link>
          <Link href="/cadastro" className="rounded-full border border-rose-deep/40 px-8 py-3 text-sm uppercase tracking-[0.25em] text-rose-deep transition hover:bg-rose-deep hover:text-ivory">
            Criar o nosso
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-4 pb-24 sm:grid-cols-2">
        {features.map(([icon, title, text]) => (
          <div key={title} className="rounded-3xl border border-gold/20 bg-white/50 p-6">
            <div className="text-3xl">{icon}</div>
            <h2 className="mt-3 font-serif text-2xl font-medium">{title}</h2>
            <p className="mt-1 text-ink-soft">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
