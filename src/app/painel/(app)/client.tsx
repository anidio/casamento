"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { setPublishedAction } from "../actions";

const TABS = [
  { href: "/painel", label: "Visão geral", icon: "🏠" },
  { href: "/painel/informacoes", label: "Informações", icon: "✏️" },
  { href: "/painel/visual", label: "Visual", icon: "🎨" },
  { href: "/painel/presentes", label: "Presentes e Pix", icon: "🎁" },
  { href: "/painel/recebidos", label: "Recebidos", icon: "💌" },
  { href: "/painel/convidados", label: "Convidados", icon: "👥" },
];

export function PanelTabs() {
  const pathname = usePathname();
  return (
    <nav className="mx-auto max-w-5xl overflow-x-auto px-4" aria-label="Seções do painel">
      <ul className="flex gap-1">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-xs uppercase tracking-[0.15em] transition sm:px-4 ${
                  active ? "border-rose-deep text-rose-deep" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <span aria-hidden>{tab.icon}</span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        })
      }
      className="rounded-full border border-gold/40 px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition hover:border-rose-deep hover:text-rose-deep"
    >
      Sair
    </button>
  );
}

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch {}
      }}
    >
      {copied ? "Link copiado ✓" : "Copiar link"}
    </Button>
  );
}

export function PublishToggle({ published }: { published: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl bg-paper/60 p-5">
      <p className="text-sm text-ink-soft">
        {published
          ? "Qualquer pessoa com o link consegue ver o site."
          : "Só vocês veem o site. Publiquem quando estiver pronto para os convidados."}
      </p>
      <Button
        type="button"
        variant={published ? "outline" : "primary"}
        loading={pending}
        onClick={() => startTransition(() => setPublishedAction(!published))}
      >
        {published ? "Despublicar" : "Publicar site"}
      </Button>
    </div>
  );
}
