// Ornamentos desenhados em SVG, usando as cores do tema (currentColor/var).

export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-gold ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-current sm:w-24" />
      <svg width="34" height="18" viewBox="0 0 34 18" fill="none">
        <path d="M17 15c-4-3-8-5.5-8-9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3.5-4 6-8 9Z" fill="var(--rose)" opacity=".85" />
        <path d="M1 9c4-3 6-3 8 0M33 9c-4-3-6-3-8 0" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-current sm:w-24" />
    </div>
  );
}

/** Ramo floral para os cantos. Use `flip` para espelhar. */
export function FloralBranch({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path d="M10 210C40 150 70 110 120 80S200 30 215 8" stroke="var(--sage)" strokeWidth="2" strokeLinecap="round" />
      <path d="M60 140c-2-24 8-40 26-46M96 100c4-22 18-32 36-32M140 66c6-16 20-24 36-22" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" />
      {[
        [40, 168, -30], [70, 130, 20], [86, 120, -50], [110, 92, 30], [132, 84, -40], [160, 56, 25], [182, 44, -35],
      ].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx="13" ry="5.5" fill="var(--sage)" opacity=".55" transform={`rotate(${r} ${x} ${y})`} />
      ))}
      {[
        [62, 96, 11], [132, 64, 13], [196, 22, 10],
      ].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy={-s / 1.6} rx={s / 2.4} ry={s / 1.5} fill="var(--rose)" opacity=".7" transform={`rotate(${a})`} />
          ))}
          <circle r={s / 4} fill="var(--gold)" />
        </g>
      ))}
    </svg>
  );
}

export function Heart({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.2C19.5 16.4 12 21 12 21Z" fill="currentColor" />
    </svg>
  );
}
