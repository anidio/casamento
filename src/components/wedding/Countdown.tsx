"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    dias: Math.floor(ms / 86_400_000),
    horas: Math.floor(ms / 3_600_000) % 24,
    min: Math.floor(ms / 60_000) % 60,
    seg: Math.floor(ms / 1000) % 60,
  };
}

export function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    setLeft(diff(target));
    const id = setInterval(() => setLeft(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = Object.entries(left ?? { dias: 0, horas: 0, min: 0, seg: 0 });

  return (
    <div className="flex justify-center gap-3 sm:gap-5" aria-live="off">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="flex w-16 flex-col items-center rounded-2xl border border-gold/30 bg-white/50 py-3 shadow-sm backdrop-blur sm:w-20"
        >
          <span className="font-serif text-3xl font-medium tabular-nums text-ink sm:text-4xl">
            {left ? String(value).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink-soft">{label}</span>
        </div>
      ))}
    </div>
  );
}
