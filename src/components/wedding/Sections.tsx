import type { Wedding } from "@/lib/types";
import { Divider, FloralBranch, Heart } from "../ornaments";
import { Countdown } from "./Countdown";
import { Reveal } from "./Reveal";

export function formatWeddingDate(iso: string) {
  const d = new Date(iso);
  return {
    long: d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }),
    short: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" }).replaceAll("/", " · "),
    weekday: d.toLocaleDateString("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" }),
  };
}

export function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <Reveal className="mb-12 text-center">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">{kicker}</p>
      <h2 className="mt-3 font-script text-5xl text-rose-deep sm:text-6xl">{title}</h2>
      <Divider className="mt-5" />
    </Reveal>
  );
}

/** Quais seções têm conteúdo. Um site recém-criado começa só com o essencial. */
export function visibleSections(wedding: Wedding, giftCount: number) {
  return {
    story: wedding.story.length > 0,
    events: Boolean(wedding.ceremony.name || wedding.ceremony.address),
    gifts: giftCount > 0 || wedding.allowFreeAmount,
  };
}

export function Nav({ wedding, sections }: { wedding: Wedding; sections: ReturnType<typeof visibleSections> }) {
  const links = [
    ["Início", "#inicio", true],
    ["Nossa história", "#historia", sections.story],
    ["Cerimônia", "#cerimonia", sections.events],
    ["Presentes", "#presentes", sections.gifts],
    ["Confirmar presença", "#rsvp", true],
    ["Recados", "#recados", true],
  ].filter(([, , show]) => show) as [string, string, boolean][];
  return (
    <header className="sticky top-0 z-40 border-b border-gold/15 bg-ivory/75 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <a href="#inicio" className="font-script text-2xl text-rose-deep">
          {wedding.partner1[0]} & {wedding.partner2[0]}
        </a>
        <ul className="hidden gap-6 text-xs uppercase tracking-[0.2em] text-ink-soft md:flex">
          {links.map(([label, href]) => (
            <li key={href}>
              <a href={href} className="transition hover:text-rose-deep">{label}</a>
            </li>
          ))}
        </ul>
        <a href="#rsvp" className="rounded-full border border-rose-deep/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-rose-deep md:hidden">
          Confirmar
        </a>
      </nav>
    </header>
  );
}

export function Hero({ wedding, next = "#rsvp" }: { wedding: Wedding; next?: string }) {
  const date = formatWeddingDate(wedding.date);
  // Nomes compostos ("Maria Clara & João Pedro") ganham fonte menor e um nome por linha.
  const long = wedding.partner1.length + wedding.partner2.length > 14;
  return (
    <section id="inicio" className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
      <FloralBranch className="absolute -left-10 top-0 w-48 opacity-60 sm:w-80" />
      <FloralBranch flip className="absolute -right-10 top-0 w-48 opacity-60 sm:w-80" />
      <FloralBranch className="absolute -bottom-10 -left-10 w-40 -rotate-90 opacity-40 sm:w-64" />
      <FloralBranch flip className="absolute -bottom-10 -right-10 w-40 rotate-90 opacity-40 sm:w-64" />

      <Reveal>
        <p className="text-xs uppercase tracking-[0.45em] text-ink-soft">{wedding.headline}</p>
      </Reveal>
      <Reveal delay={0.15}>
        {long ? (
          <h1 className="mt-6 flex flex-col items-center font-script text-6xl leading-[1.05] text-rose-deep sm:text-7xl md:text-8xl">
            <span>{wedding.partner1}</span>
            <span className="gold-text my-1 font-serif text-4xl italic sm:text-5xl">&</span>
            <span>{wedding.partner2}</span>
          </h1>
        ) : (
          <h1 className="mt-6 font-script text-7xl leading-none text-rose-deep sm:text-8xl md:text-9xl">
            {wedding.partner1}
            <span className="gold-text mx-3 inline-block font-serif text-5xl italic sm:text-6xl">&</span>
            {wedding.partner2}
          </h1>
        )}
      </Reveal>
      <Reveal delay={0.3}>
        <Divider className="mt-8" />
        <p className="mt-6 font-serif text-2xl tracking-[0.25em] text-ink sm:text-3xl">{date.short}</p>
        <p className="mt-1 font-serif text-lg italic capitalize text-ink-soft">{date.weekday}</p>
      </Reveal>
      <Reveal delay={0.45} className="mt-10">
        <Countdown date={wedding.date} />
      </Reveal>
      <Reveal delay={0.6}>
        <p className="mx-auto mt-10 max-w-xl font-serif text-xl leading-relaxed text-ink-soft">{wedding.invitationText}</p>
      </Reveal>

      <a href={next} className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-gold" aria-label="Rolar para baixo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6" /></svg>
      </a>
    </section>
  );
}

export function Story({ wedding }: { wedding: Wedding }) {
  return (
    <section id="historia" className="mx-auto max-w-3xl px-4 py-24">
      <SectionTitle kicker="Como tudo começou" title="Nossa história" />
      <ol className="relative border-l border-gold/40 pl-8 sm:mx-auto sm:border-l-0 sm:pl-0">
        <span className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gold/40 sm:block" aria-hidden />
        {wedding.story.map((m, i) => (
          <li key={m.year} className={`relative mb-14 sm:flex ${i % 2 ? "sm:flex-row-reverse" : ""}`}>
            <span className="absolute -left-[41px] top-1 flex size-5 items-center justify-center rounded-full bg-ivory text-rose sm:left-1/2 sm:-translate-x-1/2">
              <Heart className="size-4" />
            </span>
            <Reveal className={`sm:w-1/2 ${i % 2 ? "sm:pl-12" : "sm:pr-12 sm:text-right"}`}>
              <p className="font-serif text-3xl text-gold">{m.year}</p>
              <h3 className="mt-1 font-serif text-2xl font-medium text-ink">{m.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{m.text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Events({ wedding }: { wedding: Wedding }) {
  const places = [
    { label: "Cerimônia", icon: "⛪", ...wedding.ceremony },
    ...(wedding.reception ? [{ label: "Recepção", icon: "🥂", ...wedding.reception }] : []),
  ];
  return (
    <section id="cerimonia" className="relative bg-white/40 px-4 py-24">
      <SectionTitle kicker={formatWeddingDate(wedding.date).long} title="O grande dia" />
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {places.map((p, i) => (
          <Reveal key={p.label} delay={i * 0.15}>
            <article className="h-full rounded-3xl border border-gold/25 bg-ivory/80 p-8 text-center shadow-[0_10px_40px_-25px_rgba(61,47,42,.5)]">
              <div className="text-4xl">{p.icon}</div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">{p.label}</p>
              <h3 className="mt-2 font-serif text-2xl font-medium">{p.name}</h3>
              <p className="mt-3 font-serif text-4xl text-rose-deep">{p.time}</p>
              <p className="mt-3 text-ink-soft">{p.address}</p>
              <a
                href={p.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-block rounded-full border border-rose-deep/40 px-6 py-2 text-xs uppercase tracking-[0.2em] text-rose-deep transition hover:bg-rose-deep hover:text-ivory"
              >
                Ver no mapa
              </a>
            </article>
          </Reveal>
        ))}
      </div>
      <Reveal className="mx-auto mt-10 max-w-xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Traje</p>
        <p className="mt-2 font-serif text-xl italic text-ink-soft">{wedding.dressCode}</p>
      </Reveal>
    </section>
  );
}

export function Footer({ wedding }: { wedding: Wedding }) {
  return (
    <footer className="px-4 pb-12 pt-20 text-center">
      <Divider />
      <p className="mt-6 font-script text-5xl text-rose-deep">
        {wedding.partner1} & {wedding.partner2}
      </p>
      <p className="mt-2 font-serif tracking-[0.3em] text-ink-soft">{formatWeddingDate(wedding.date).short}</p>
      <p className="mt-10 text-xs text-ink-soft/70">Feito com amor ♥</p>
    </footer>
  );
}
