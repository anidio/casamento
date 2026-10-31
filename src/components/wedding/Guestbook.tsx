"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { postMessageAction } from "@/app/[slug]/actions";
import type { GuestMessage } from "@/lib/types";
import { Reveal } from "./Reveal";

const input = "w-full rounded-xl border border-gold/30 bg-white/70 px-4 py-3 outline-none focus:border-rose-deep";
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", timeZone: "America/Sao_Paulo" });

// Leve inclinação de cada cartão, como bilhetes presos num mural.
const tilt = (i: number) => [-1.5, 1, -0.5, 1.5, -1, 0.5][i % 6];

export function Guestbook({ slug, messages }: { slug: string; messages: GuestMessage[] }) {
  const [list, setList] = useState(messages);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const result = await postMessageAction({ slug, author, body, website: honeypot });
      if (!result.ok) return setError(result.error);
      if (result.pending) {
        setNotice("Recado enviado! Ele aparece aqui assim que os noivos aprovarem. 💛");
      } else {
        setList((l) => [{ id: `novo-${Date.now()}`, author: author.trim(), body: body.trim(), createdAt: new Date().toISOString() }, ...l]);
        setNotice("Recado publicado! 💛");
      }
      setBody("");
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <form onSubmit={submit} className="mx-auto max-w-lg space-y-3 rounded-3xl border border-gold/25 bg-white/60 p-6 shadow-[0_10px_40px_-25px_rgba(61,47,42,.5)] sm:p-8">
        <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Seu nome" aria-label="Seu nome" maxLength={80} required className={input} />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Deixe uma mensagem de carinho para os noivos"
          aria-label="Sua mensagem"
          rows={3}
          maxLength={500}
          required
          className={`${input} resize-none`}
        />
        <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
        {error && <p className="text-center text-sm text-rose-deep">{error}</p>}
        {notice && <p className="text-center text-sm text-ink-soft">{notice}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-rose-deep py-3 text-sm uppercase tracking-[0.2em] text-ivory shadow-md transition hover:brightness-110 disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Deixar recado"}
        </button>
      </form>

      {list.length > 0 && (
        <ul className="mt-14 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {list.map((m, i) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="pt-3"
              >
                <Reveal delay={Math.min(i, 5) * 0.06}>
                  <figure
                    style={{ rotate: `${tilt(i)}deg` }}
                    className="relative rounded-2xl border border-gold/20 bg-ivory p-6 shadow-[0_12px_30px_-20px_rgba(61,47,42,.6)] transition hover:rotate-0"
                  >
                    <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[-3deg] rounded-sm bg-[color-mix(in_srgb,var(--gold)_30%,transparent)]" />
                    <blockquote className="whitespace-pre-line font-serif text-lg leading-relaxed text-ink">“{m.body}”</blockquote>
                    <figcaption className="mt-3 text-sm text-ink-soft">
                      <span className="font-script text-2xl text-rose-deep">{m.author}</span>
                      <span className="ml-2 text-xs">{dateFmt.format(new Date(m.createdAt))}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
