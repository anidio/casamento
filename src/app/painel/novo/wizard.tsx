"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useTransition } from "react";
import { Divider, FloralBranch, Heart } from "@/components/ornaments";
import { Alert, Button, Field } from "@/components/ui/form";
import { slugFormatError, slugify, suggestSlug } from "@/lib/slug";
import { checkSlugAction, createWeddingAction } from "../actions";

const STEPS = ["Os noivos", "O grande dia", "O endereço"] as const;

type SlugStatus = { state: "idle" | "checking" | "ok" | "error"; message?: string };

export function CreateWeddingWizard({ firstName }: { firstName: string }) {
  const [step, setStep] = useState(0);
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("16:00");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>({ state: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const origin = typeof window === "undefined" ? "" : window.location.host;
  const today = new Date().toISOString().slice(0, 10);

  // Sugere o endereço a partir dos nomes, até a pessoa editar à mão.
  useEffect(() => {
    if (!slugTouched) setSlug(suggestSlug(partner1, partner2));
  }, [partner1, partner2, slugTouched]);

  // Confere se o endereço está livre (com uma pequena espera enquanto digita).
  useEffect(() => {
    if (step !== 2) return;
    const formatError = slugFormatError(slug);
    if (formatError) return setSlugStatus({ state: "error", message: formatError });
    setSlugStatus({ state: "checking" });
    const id = setTimeout(async () => {
      const result = await checkSlugAction(slug);
      setSlugStatus(result.ok ? { state: "ok" } : { state: "error", message: result.message });
    }, 400);
    return () => clearTimeout(id);
  }, [slug, step]);

  const canNext = [partner1.trim() && partner2.trim(), date && time, slugStatus.state === "ok"][step];

  function next(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canNext) return;
    if (step < 2) return setStep(step + 1);
    startTransition(async () => {
      const result = await createWeddingAction({ partner1, partner2, date, time, slug });
      if (result?.error) setError(result.error);
    });
  }

  return (
    <main className="paper-bg relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <FloralBranch className="absolute -left-8 -top-8 w-44 opacity-60 sm:w-72" />
      <FloralBranch flip className="absolute -bottom-8 -right-8 w-44 rotate-180 opacity-60 sm:w-72" />

      <p className="text-xs uppercase tracking-[0.35em] text-gold">Olá, {firstName}</p>
      <h1 className="mt-3 text-center font-script text-5xl text-rose-deep sm:text-6xl">Vamos criar o site de vocês</h1>

      <ol className="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ink-soft sm:gap-4" aria-label="Etapas">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2 sm:gap-4">
            <span className={`flex items-center gap-2 ${i === step ? "text-rose-deep" : ""}`} aria-current={i === step ? "step" : undefined}>
              <span className={`flex size-6 items-center justify-center rounded-full border text-[11px] ${i <= step ? "border-rose-deep bg-rose-deep text-ivory" : "border-gold/40"}`}>
                {i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-gold/40 sm:w-10" />}
          </li>
        ))}
      </ol>

      <form
        onSubmit={next}
        className="relative mt-8 w-full max-w-md rounded-3xl border border-gold/25 bg-white/70 p-6 shadow-[0_20px_60px_-30px_rgba(61,47,42,.5)] backdrop-blur sm:p-10"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <p className="text-center font-serif text-xl italic text-ink-soft">Quem são os noivos?</p>
                <Field label="Primeiro nome" name="partner1" value={partner1} onChange={(e) => setPartner1(e.target.value)} required maxLength={60} autoFocus placeholder="Maria" />
                <div className="flex justify-center text-rose">
                  <Heart className="size-5" />
                </div>
                <Field label="Segundo nome" name="partner2" value={partner2} onChange={(e) => setPartner2(e.target.value)} required maxLength={60} placeholder="João" />
                <p className="text-center text-sm text-ink-soft">É assim que os nomes aparecem no convite. Dá para mudar depois.</p>
              </>
            )}

            {step === 1 && (
              <>
                <p className="text-center font-serif text-xl italic text-ink-soft">Quando vai ser?</p>
                <Field label="Data" name="date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required autoFocus />
                <Field label="Horário da cerimônia" name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required hint="Horário de Brasília." />
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-center font-serif text-xl italic text-ink-soft">Qual vai ser o endereço do site?</p>
                <Field
                  label="Endereço"
                  name="slug"
                  value={slug}
                  autoFocus
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(slugify(e.target.value.replace(/\s/g, "-")) + (e.target.value.endsWith("-") ? "-" : ""));
                  }}
                  error={slugStatus.state === "error" ? slugStatus.message : null}
                  hint={
                    slugStatus.state === "checking" ? "Conferindo…" : slugStatus.state === "ok" ? <span className="text-sage">✓ Disponível</span> : null
                  }
                />
                <p className="break-all rounded-xl bg-paper/70 px-4 py-3 text-center font-serif text-lg">
                  {origin}/<b className="text-rose-deep">{slug || "…"}</b>
                </p>
                <p className="text-center text-sm text-ink-soft">É o link que vocês vão mandar para os convidados.</p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}

        <Divider className="my-6" />
        <div className="flex gap-3">
          {step > 0 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)} disabled={pending}>
              Voltar
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={!canNext} loading={pending}>
            {step < 2 ? "Continuar" : "Criar nosso site"}
          </Button>
        </div>
      </form>
    </main>
  );
}
