"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FloralBranch } from "../ornaments";

type Stage = "closed" | "open" | "card" | "done";

type Props = {
  partner1: string;
  partner2: string;
  dateLabel: string;
};

/**
 * Abertura do site: um envelope lacrado com as iniciais do casal. Ao tocar,
 * a aba abre, o convite sobe e a página aparece por trás.
 * Aparece sempre que a página é aberta (de propósito: faz parte da experiência).
 */
export function InvitationEnvelope({ partner1, partner2, dateLabel }: Props) {
  const [stage, setStage] = useState<Stage>("closed");

  useEffect(() => {
    document.body.style.overflow = stage === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [stage]);

  function finish() {
    setStage("done");
  }

  function open() {
    if (stage !== "closed") return;
    setStage("open");
    setTimeout(() => setStage("card"), 750);
    setTimeout(finish, 3400);
  }

  const opened = stage !== "closed";

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          key="envelope"
          className="paper-bg fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-4"
          exit={{ opacity: 0, scale: 1.08, filter: "blur(6px)" }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <FloralBranch className="absolute -left-6 -top-6 w-44 opacity-70 sm:w-64" />
          <FloralBranch flip className="absolute -right-6 -bottom-6 w-44 rotate-180 opacity-70 sm:w-64" />

          <motion.p
            className="mb-10 text-center font-serif text-lg italic text-ink-soft sm:text-xl"
            animate={{ opacity: opened ? 0 : 1, y: opened ? -10 : 0 }}
          >
            Você recebeu um convite especial
          </motion.p>

          <button
            type="button"
            onClick={open}
            aria-label="Abrir o convite"
            className="relative aspect-[1.45] w-[min(88vw,420px)] cursor-pointer outline-none [perspective:1200px] focus-visible:ring-2 focus-visible:ring-gold"
          >
            {/* fundo do envelope */}
            <div className="absolute inset-0 rounded-md bg-[color-mix(in_srgb,var(--paper)_85%,var(--rose))] shadow-[0_20px_50px_-20px_rgba(61,47,42,.45)]" />

            {/* cartão do convite */}
            <motion.div
              className="absolute inset-x-[6%] top-[6%] z-10 flex h-[88%] flex-col items-center justify-center rounded-sm border border-gold/40 bg-ivory px-4 text-center shadow-md"
              initial={false}
              animate={{ y: stage === "card" ? "-62%" : "0%" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="text-[10px] uppercase tracking-[0.35em] text-ink-soft">Save the date</span>
              <span className="mt-1 font-script text-4xl text-rose-deep sm:text-5xl">
                {partner1} & {partner2}
              </span>
              <span className="mt-1 font-serif text-base tracking-widest text-ink">{dateLabel}</span>
            </motion.div>

            {/* bolso da frente (V invertido) */}
            <div
              className="absolute inset-0 z-20 rounded-md bg-[color-mix(in_srgb,var(--paper)_92%,var(--rose))]"
              style={{ clipPath: "polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)" }}
            />
            <div
              className="absolute inset-0 z-20 rounded-md"
              style={{
                clipPath: "polygon(0 100%, 50% 48%, 100% 100%)",
                background: "color-mix(in srgb, var(--paper) 80%, var(--rose))",
              }}
            />

            {/* aba */}
            <motion.div
              className="absolute inset-x-0 top-0 h-[58%] origin-top"
              style={{
                zIndex: stage === "card" ? 5 : 30,
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                background: "color-mix(in srgb, var(--paper) 70%, var(--rose))",
                transformStyle: "preserve-3d",
              }}
              initial={false}
              animate={{ rotateX: opened ? 180 : 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* lacre de cera */}
            <motion.div
              className="absolute left-1/2 top-[58%] z-40 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-script text-2xl text-ivory shadow-lg sm:size-20 sm:text-3xl"
              style={{ background: "radial-gradient(circle at 35% 30%, var(--rose), var(--rose-deep) 70%)" }}
              initial={false}
              animate={opened ? { scale: 0, opacity: 0 } : { scale: [1, 1.06, 1], opacity: 1 }}
              transition={opened ? { duration: 0.35 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {partner1[0]}
              <span className="mx-0.5 text-lg">&</span>
              {partner2[0]}
            </motion.div>
          </button>

          <motion.div className="mt-12 flex flex-col items-center gap-3" animate={{ opacity: opened ? 0 : 1 }}>
            <button
              type="button"
              onClick={open}
              className="rounded-full bg-rose-deep px-8 py-3 text-sm uppercase tracking-[0.25em] text-ivory shadow-md transition hover:brightness-110"
            >
              Abrir convite
            </button>
            <button type="button" onClick={finish} className="text-xs text-ink-soft underline-offset-4 hover:underline">
              pular
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
