import Link from "next/link";
import { Divider, FloralBranch } from "../ornaments";

// Peças visuais compartilhadas pelas telas de login e do painel.

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <main className="paper-bg relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-16">
      <FloralBranch className="absolute -left-8 -top-8 w-44 opacity-60 sm:w-72" />
      <FloralBranch flip className="absolute -bottom-8 -right-8 w-44 rotate-180 opacity-60 sm:w-72" />
      <Link href="/" className="font-script text-5xl text-rose-deep">
        Juntos
      </Link>
      <div className="relative mt-6 w-full max-w-md rounded-3xl border border-gold/25 bg-white/70 p-6 shadow-[0_20px_60px_-30px_rgba(61,47,42,.5)] backdrop-blur sm:p-10">
        <h1 className="text-center font-serif text-3xl font-medium">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-ink-soft">{subtitle}</p>}
        <Divider className="my-6" />
        {children}
      </div>
      {footer && <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div>}
    </main>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: React.ReactNode; error?: string | null };

export function Field({ label, hint, error, id, className = "", ...props }: FieldProps) {
  const fieldId = id ?? props.name;
  return (
    <label htmlFor={fieldId} className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-ink-soft">{label}</span>
      <input
        id={fieldId}
        className={`w-full rounded-xl border bg-white/80 px-4 py-3 outline-none transition focus:border-rose-deep ${error ? "border-rose-deep" : "border-gold/30"} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error ? <span className="mt-1 block text-sm text-rose-deep">{error}</span> : hint ? <span className="mt-1 block text-sm text-ink-soft">{hint}</span> : null}
    </label>
  );
}

export function Button({ loading, children, variant = "primary", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; variant?: "primary" | "outline" }) {
  const styles =
    variant === "primary"
      ? "bg-rose-deep text-ivory shadow-md hover:brightness-110"
      : "border border-rose-deep/40 text-rose-deep hover:bg-rose-deep hover:text-ivory";
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm uppercase tracking-[0.2em] transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {loading && <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />}
      {children}
    </button>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "success"; children: React.ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl px-4 py-3 text-sm ${kind === "error" ? "bg-rose/15 text-rose-deep" : "bg-sage/20 text-ink"}`}
    >
      {children}
    </p>
  );
}
