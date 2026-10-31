"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { Button } from "./form";

// Peças das telas de edição do painel.

export function PanelCard({ id, title, description, children, aside }: { id?: string; title: string; description?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32 rounded-3xl border border-gold/25 bg-white/70 p-5 shadow-[0_10px_40px_-30px_rgba(61,47,42,.5)] sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-medium">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-script text-5xl text-rose-deep">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-ink-soft">{description}</p>}
    </div>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: React.ReactNode };

export function TextArea({ label, hint, id, className = "", ...props }: TextAreaProps) {
  const fieldId = id ?? props.name;
  const length = typeof props.value === "string" ? props.value.length : 0;
  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 flex justify-between text-xs uppercase tracking-[0.2em] text-ink-soft">
        {label}
        {props.maxLength && (
          <span className="normal-case tracking-normal">
            {length}/{props.maxLength}
          </span>
        )}
      </span>
      <textarea
        id={fieldId}
        rows={3}
        className={`w-full resize-y rounded-xl border border-gold/30 bg-white/80 px-4 py-3 outline-none transition focus:border-rose-deep ${className}`}
        {...props}
      />
      {hint && <span className="mt-1 block text-sm text-ink-soft">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block font-medium">{label}</span>
        {description && <span className="block text-sm text-ink-soft">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-rose-deep" : "bg-gold/30"}`}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

export type SaveStatus = { state: "idle" } | { state: "saved" } | { state: "error"; message: string };

/**
 * Barra fixa no rodapé com o botão de salvar. Aparece quando há alterações e
 * avisa antes de sair da página sem salvar.
 */
export function SaveBar({ dirty, saving, status, onSave, onDiscard }: { dirty: boolean; saving: boolean; status: SaveStatus; onSave: () => void; onDiscard: () => void }) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const visible = dirty || status.state !== "idle";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-ivory/95 px-4 py-3 shadow-[0_-10px_30px_-20px_rgba(61,47,42,.5)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p role="status" className={`text-sm ${status.state === "error" ? "text-rose-deep" : "text-ink-soft"}`}>
              {status.state === "error"
                ? status.message
                : dirty
                  ? "Vocês têm alterações não salvas."
                  : "Tudo salvo ✓ As mudanças já aparecem no site."}
            </p>
            {dirty && (
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onDiscard} disabled={saving} className="px-4 py-2">
                  Descartar
                </Button>
                <Button type="button" onClick={onSave} loading={saving} className="px-5 py-2">
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
