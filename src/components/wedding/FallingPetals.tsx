"use client";

import { useEffect, useState } from "react";

type Petal = { left: number; delay: number; duration: number; size: number; sway: number; hue: number };

// Pétalas caindo em CSS puro (leve, sem canvas). Geradas só no cliente para
// não dar diferença de hidratação. Desliga com prefers-reduced-motion.
export function FallingPetals({ count = 18 }: { count?: number }) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const n = window.innerWidth < 640 ? Math.ceil(count / 2) : count;
    setPetals(
      Array.from({ length: n }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * -20,
        duration: 12 + Math.random() * 10,
        size: 10 + Math.random() * 12,
        sway: 30 + Math.random() * 60,
        hue: Math.random(),
      })),
    );
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal absolute -top-8"
          style={
            {
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--sway": `${p.sway}px`,
            } as React.CSSProperties
          }
        >
          <svg width={p.size} height={p.size} viewBox="0 0 20 20" className="petal-spin" style={{ animationDuration: `${p.duration / 3}s` }}>
            <path
              d="M10 1C15 5 18 10 10 19 2 10 5 5 10 1Z"
              fill={p.hue > 0.7 ? "var(--gold)" : "var(--rose)"}
              opacity={p.hue > 0.7 ? 0.45 : 0.6}
            />
          </svg>
        </span>
      ))}
      <style>{`
        .petal { animation-name: petal-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        .petal-spin { animation: petal-spin linear infinite; }
        @keyframes petal-fall {
          0% { transform: translate3d(0, -5vh, 0); }
          25% { transform: translate3d(var(--sway), 25vh, 0); }
          50% { transform: translate3d(0, 55vh, 0); }
          75% { transform: translate3d(calc(var(--sway) * -1), 80vh, 0); }
          100% { transform: translate3d(0, 110vh, 0); }
        }
        @keyframes petal-spin { to { transform: rotate(360deg) rotateY(180deg); } }
      `}</style>
    </div>
  );
}
