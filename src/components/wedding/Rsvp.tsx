"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { recordRsvpAction } from "@/app/[slug]/actions";
import { Heart } from "../ornaments";

const input = "w-full rounded-xl border border-gold/30 bg-white/70 px-4 py-3 outline-none focus:border-rose-deep";

export function RsvpForm({ slug, deadline, closed }: { slug: string; deadline: string; closed: boolean }) {
  const [done, setDone] = useState<null | { attending: boolean; updated: boolean; name: string }>(null);
  const [attending, setAttending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const guestName = String(form.get("name") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await recordRsvpAction({
        slug,
        guestName,
        attending,
        partySize: attending ? Number(form.get("partySize") || 1) : 1,
        phone: String(form.get("phone") ?? ""),
        message: String(form.get("message") ?? ""),
        website: String(form.get("website") ?? ""),
      });
      if (!result.ok) return setError(result.error);
      setDone({ attending, updated: result.updated, name: guestName.trim().split(" ")[0] });
    });
  }

  if (closed) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-gold/25 bg-white/60 p-8 text-center">
        <p className="font-serif text-xl italic text-ink-soft">As confirmações foram encerradas. Obrigado a todos! 💛</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-3xl border border-gold/25 bg-white/60 p-6 shadow-[0_10px_40px_-25px_rgba(61,47,42,.5)] sm:p-10">
      <AnimatePresence mode="wait">
        {done === null ? (
          <motion.form key="form" exit={{ opacity: 0, y: -10 }} onSubmit={submit} className="space-y-4">
            <p className="text-center font-serif text-lg italic text-ink-soft">Por favor, confirme {deadline}.</p>
            <input required name="name" placeholder="Nome completo" aria-label="Nome completo" maxLength={120} className={input} />
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Você vai?">
              {[
                [true, "Vou com certeza!"],
                [false, "Não poderei ir"],
              ].map(([value, label]) => (
                <button
                  key={String(value)}
                  type="button"
                  role="radio"
                  aria-checked={attending === value}
                  onClick={() => setAttending(value as boolean)}
                  className={`rounded-xl border px-3 py-3 text-sm transition ${attending === value ? "border-rose-deep bg-rose-deep text-ivory" : "border-gold/30 bg-white/70 text-ink-soft"}`}
                >
                  {label as string}
                </button>
              ))}
            </div>
            {attending && (
              <>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-white/70 px-4 py-3 text-ink-soft">
                  Quantas pessoas (com você)?
                  <input name="partySize" type="number" min={1} max={20} defaultValue={1} className="w-16 bg-transparent text-right outline-none" />
                </label>
                <input name="phone" type="tel" placeholder="WhatsApp (opcional)" aria-label="WhatsApp" maxLength={30} className={input} />
              </>
            )}
            <textarea name="message" placeholder="Recado para os noivos (opcional, só eles veem)" aria-label="Recado para os noivos" rows={3} maxLength={500} className={`${input} resize-none`} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
            {error && <p className="text-center text-sm text-rose-deep">{error}</p>}
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-rose-deep py-3 text-sm uppercase tracking-[0.2em] text-ivory shadow-md transition hover:brightness-110 disabled:opacity-50"
            >
              {pending ? "Enviando…" : "Enviar confirmação"}
            </button>
          </motion.form>
        ) : (
          <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
            <Heart className="mx-auto size-12 text-rose-deep" />
            <p className="mt-4 font-script text-4xl text-rose-deep">{done.attending ? `Te esperamos lá, ${done.name}!` : "Sentiremos sua falta"}</p>
            <p className="mt-2 font-serif text-lg text-ink-soft">{done.updated ? "Sua resposta foi atualizada." : "Sua resposta foi registrada."}</p>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setAttending(true);
              }} className="mt-6 text-sm text-ink-soft underline underline-offset-4 hover:text-rose-deep">
              Responder por outra pessoa
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
