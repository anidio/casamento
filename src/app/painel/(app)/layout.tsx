import Link from "next/link";
import { FloralBranch } from "@/components/ornaments";
import { requireMyWedding } from "@/lib/my-wedding";
import { PanelTabs, SignOutButton } from "./client";

// Moldura de todas as telas do painel: cabeçalho, abas e link para o site.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, wedding } = await requireMyWedding();

  return (
    <div className="paper-bg relative min-h-svh overflow-x-hidden">
      <FloralBranch className="pointer-events-none absolute -left-10 -top-10 w-48 opacity-40 sm:w-72" />

      <header className="sticky top-0 z-30 border-b border-gold/15 bg-ivory/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/painel" className="font-script text-3xl text-rose-deep">
            Juntos
          </Link>
          <div className="flex items-center gap-3 text-sm text-ink-soft">
            <Link
              href={`/${wedding.slug}`}
              target="_blank"
              className="hidden rounded-full border border-rose-deep/30 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-rose-deep transition hover:bg-rose-deep hover:text-ivory sm:inline-block"
            >
              {wedding.published ? "Ver site ↗" : "Ver prévia ↗"}
            </Link>
            <span className="hidden md:inline">{user.email}</span>
            <SignOutButton />
          </div>
        </div>
        <PanelTabs />
      </header>

      <main className="relative mx-auto max-w-5xl px-4 pb-24 pt-8">{children}</main>
    </div>
  );
}
