"use client";

import { AnimatePresence, motion } from "motion/react";
import QRCode from "qrcode";
import { useEffect, useMemo, useState, useTransition } from "react";
import { recordGiftAction } from "@/app/[slug]/actions";
import { newOrderCode } from "@/lib/order-code";
import { buildPixPayload, formatBRL } from "@/lib/pix";
import type { Gift, Wedding } from "@/lib/types";
import { Heart } from "../ornaments";
import { Reveal } from "./Reveal";

/** null = contribuição com valor livre */
type Selection = Gift | null | undefined;

export function GiftGrid({ wedding, gifts }: { wedding: Wedding; gifts: Gift[] }) {
  const [selected, setSelected] = useState<Selection>(undefined);
  const canPay = Boolean(wedding.pix);

  return (
    <>
      <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((g, i) => (
          <Reveal key={g.id} delay={(i % 3) * 0.1}>
            <GiftCard emoji={g.emoji} imageUrl={g.imageUrl} name={g.name} description={g.description} price={formatBRL(g.priceCents)} disabled={!canPay} onClick={() => setSelected(g)} />
          </Reveal>
        ))}
        {wedding.allowFreeAmount && (
          <Reveal delay={(gifts.length % 3) * 0.1}>
            <GiftCard
              emoji="💝"
              name="Contribuição livre"
              description="Prefere escolher o valor? Fique à vontade."
              price="Você escolhe"
              disabled={!canPay}
              onClick={() => setSelected(null)}
              dashed
            />
          </Reveal>
        )}
      </div>
      {!canPay && <p className="mt-8 text-center text-sm text-ink-soft">Os presentes ainda não estão disponíveis.</p>}
      <AnimatePresence>
        {selected !== undefined && wedding.pix && <PixModal gift={selected} wedding={wedding} onClose={() => setSelected(undefined)} />}
      </AnimatePresence>
    </>
  );
}

function GiftCard(p: { emoji: string; imageUrl?: string | null; name: string; description: string; price: string; disabled: boolean; onClick: () => void; dashed?: boolean }) {
  return (
    <article
      className={`group flex h-full flex-col rounded-3xl border bg-white/60 p-6 shadow-[0_10px_40px_-28px_rgba(61,47,42,.6)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_-25px_rgba(156,93,98,.5)] ${p.dashed ? "border-dashed border-rose/50" : "border-gold/20"}`}
    >
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--rose)_12%,var(--ivory))] text-6xl transition duration-500 group-hover:scale-[1.03]">
        {p.imageUrl ? <img src={p.imageUrl} alt="" className="size-full rounded-2xl object-cover" /> : p.emoji}
      </div>
      <h3 className="mt-5 font-serif text-2xl font-medium leading-tight">{p.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{p.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="font-serif text-2xl text-rose-deep">{p.price}</span>
        <button
          type="button"
          disabled={p.disabled}
          onClick={p.onClick}
          className="rounded-full bg-rose-deep px-5 py-2 text-xs uppercase tracking-[0.2em] text-ivory transition hover:brightness-110 disabled:opacity-40"
        >
          Presentear
        </button>
      </div>
    </article>
  );
}

/** "1.234,56" → 123456 centavos. */
function parseBRL(text: string) {
  const clean = text.replace(/[^\d,]/g, "");
  if (!clean) return NaN;
  const [reais, centavos = ""] = clean.split(",");
  return Number(reais) * 100 + Number(centavos.padEnd(2, "0").slice(0, 2));
}

const input = "w-full rounded-xl border border-gold/30 bg-white/70 px-4 py-3 outline-none focus:border-rose-deep";

function PixModal({ gift, wedding, onClose }: { gift: Gift | null; wedding: Wedding; onClose: () => void }) {
  const pix = wedding.pix!;
  const isFree = gift === null;
  const code = useMemo(() => newOrderCode(), []);
  const [step, setStep] = useState<"amount" | "pay" | "thanks">(isFree ? "amount" : "pay");
  const [freeText, setFreeText] = useState("");
  const [freeCents, setFreeCents] = useState(0);
  const amountCents = isFree ? freeCents : gift.priceCents;

  const payload = useMemo(
    () => (amountCents ? buildPixPayload({ key: pix.key, receiverName: pix.receiverName, city: pix.city, amountCents, txid: code }) : ""),
    [amountCents, pix, code],
  );
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const [guest, setGuest] = useState("");
  const [note, setNote] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (payload) QRCode.toDataURL(payload, { margin: 1, width: 440, color: { dark: "#3d2f2a", light: "#ffffff" } }).then(setQr);
  }, [payload]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  function confirmAmount(e: React.FormEvent) {
    e.preventDefault();
    const cents = parseBRL(freeText);
    if (!Number.isFinite(cents) || cents < 100) return setError("Digite um valor a partir de R$ 1,00.");
    if (cents > 10_000_000) return setError("Valor alto demais.");
    setError(null);
    setFreeCents(cents);
    setStep("pay");
  }

  function confirmPaid() {
    setError(null);
    startTransition(async () => {
      const result = await recordGiftAction({
        slug: wedding.slug,
        giftId: gift?.id ?? null,
        amountCents: isFree ? amountCents : null,
        guestName: guest,
        message: note,
        code,
        website: honeypot,
      });
      if (!result.ok) return setError(result.error);
      setStep("thanks");
    });
  }

  const title = isFree ? "Contribuição livre" : gift.name;
  const emoji = isFree ? "💝" : gift.emoji;

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Presentear: ${title}`}
        className="paper-bg relative max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute right-4 top-4 text-2xl leading-none text-ink-soft" aria-label="Fechar">
          ×
        </button>

        {step !== "thanks" && (
          <>
            <p className="text-center text-xs uppercase tracking-[0.3em] text-gold">Presente</p>
            <h3 className="mt-2 text-center font-serif text-2xl font-medium">
              {emoji} {title}
            </h3>
          </>
        )}

        {step === "amount" && (
          <form onSubmit={confirmAmount} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-center text-sm text-ink-soft">Quanto você quer dar?</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-xl text-ink-soft">R$</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  placeholder="100,00"
                  aria-label="Valor em reais"
                  className={`${input} pl-12 text-center font-serif text-3xl`}
                />
              </div>
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {[50, 100, 200, 500].map((v) => (
                <button key={v} type="button" onClick={() => setFreeText(`${v},00`)} className="rounded-full border border-gold/30 bg-white/70 px-4 py-1.5 text-sm hover:border-rose-deep">
                  R$ {v}
                </button>
              ))}
            </div>
            {error && <p className="text-center text-sm text-rose-deep">{error}</p>}
            <button type="submit" className="w-full rounded-full bg-rose-deep py-3 text-sm uppercase tracking-[0.2em] text-ivory shadow-md transition hover:brightness-110">
              Continuar
            </button>
          </form>
        )}

        {step === "pay" && (
          <>
            <p className="mt-1 text-center font-serif text-3xl text-rose-deep">{formatBRL(amountCents)}</p>
            <div className="mx-auto mt-5 w-56 rounded-2xl bg-white p-3 shadow-inner">
              {qr ? <img src={qr} alt="QR Code Pix" className="w-full" /> : <div className="aspect-square animate-pulse rounded-xl bg-paper" />}
            </div>
            <p className="mt-3 text-center text-sm text-ink-soft">
              Abra o app do seu banco, escolha <b>Pix → Ler QR Code</b> ou use o código abaixo.
            </p>
            <button
              type="button"
              onClick={copy}
              className="mt-4 w-full rounded-full border border-rose-deep/40 py-3 text-sm uppercase tracking-[0.2em] text-rose-deep transition hover:bg-rose-deep hover:text-ivory"
            >
              {copied ? "Código copiado ✓" : "Copiar Pix copia e cola"}
            </button>
            <p className="mt-2 text-center text-xs text-ink-soft">
              Recebedor: {pix.receiverName} · Código do presente: <b className="tracking-widest">{code}</b>
            </p>

            <div className="mt-6 space-y-3 border-t border-gold/20 pt-5">
              <p className="text-center text-sm text-ink-soft">Depois de pagar, conte para os noivos quem mandou:</p>
              <input value={guest} onChange={(e) => setGuest(e.target.value)} placeholder="Seu nome" maxLength={80} aria-label="Seu nome" className={input} />
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Deixe um recado para os noivos (opcional)"
                rows={2}
                maxLength={500}
                aria-label="Recado para os noivos"
                className={`${input} resize-none`}
              />
              {/* Campo-armadilha para robôs: invisível para pessoas. */}
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                name="website"
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              {error && <p className="text-center text-sm text-rose-deep">{error}</p>}
              <button
                type="button"
                disabled={guest.trim().length < 2 || pending}
                onClick={confirmPaid}
                className="w-full rounded-full bg-rose-deep py-3 text-sm uppercase tracking-[0.2em] text-ivory shadow-md transition hover:brightness-110 disabled:opacity-40"
              >
                {pending ? "Enviando…" : "Já fiz o Pix"}
              </button>
              {isFree && (
                <button type="button" onClick={() => setStep("amount")} className="w-full text-center text-sm text-ink-soft underline underline-offset-4">
                  Mudar o valor
                </button>
              )}
            </div>
          </>
        )}

        {step === "thanks" && <Thanks name={guest} couple={`${wedding.partner1} & ${wedding.partner2}`} onClose={onClose} />}
      </motion.div>
    </motion.div>
  );
}

function Thanks({ name, couple, onClose }: { name: string; couple: string; onClose: () => void }) {
  return (
    <div className="relative py-8 text-center">
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/3 text-rose"
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
          animate={{ x: Math.cos((i / 14) * Math.PI * 2) * 140, y: Math.sin((i / 14) * Math.PI * 2) * 110, opacity: 0, scale: 1.1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        >
          <Heart className="size-5" />
        </motion.span>
      ))}
      <Heart className="mx-auto size-14 text-rose-deep" />
      <h3 className="mt-4 font-script text-5xl text-rose-deep">Obrigado!</h3>
      <p className="mt-3 font-serif text-xl text-ink-soft">
        {name.trim().split(" ")[0]}, seu carinho chegou até nós. <br /> Com amor, {couple}.
      </p>
      <button type="button" onClick={onClose} className="mt-8 rounded-full bg-rose-deep px-8 py-3 text-sm uppercase tracking-[0.2em] text-ivory">
        Voltar
      </button>
    </div>
  );
}
