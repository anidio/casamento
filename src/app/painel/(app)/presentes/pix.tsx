"use client";

import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Alert, Button, Field } from "@/components/ui/form";
import { PanelCard } from "@/components/ui/panel";
import { buildPixPayload } from "@/lib/pix";
import { formatPixKey, normalizePixKey, PIX_KEY_TYPES, type PixKeyType } from "@/lib/pix-key";
import { removePixAction, savePixAction } from "./actions";

type PixState = { type: PixKeyType; key: string; receiverName: string; city: string };

export function PixForm({ initial, hasKey }: { initial: PixState; hasKey: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(!hasKey);
  const [form, setForm] = useState({ ...initial, key: hasKey ? formatPixKey(initial.type, initial.key) : "" });
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (patch: Partial<PixState>) => {
    setForm((f) => ({ ...f, ...patch }));
    setError(null);
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    const check = normalizePixKey(form.type, form.key);
    if (check.error !== undefined) return setError(check.error);
    startTransition(async () => {
      const result = await savePixAction(form);
      if (!result.ok) return setError(result.error);
      setEditing(false);
      setSavedMsg(true);
      setShowTest(true);
      router.refresh();
    });
  }

  return (
    <PanelCard
      id="pix"
      title="Chave Pix"
      description="Para onde vai o dinheiro dos presentes. A plataforma não toca no valor: cai direto na conta de vocês."
      aside={
        hasKey && !editing ? (
          <span className="rounded-full bg-sage/25 px-3 py-1 text-xs uppercase tracking-[0.2em]">● Ativa</span>
        ) : (
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink-soft">○ Pendente</span>
        )
      }
    >
      {!editing && hasKey ? (
        <div className="space-y-4">
          <dl className="grid gap-3 rounded-2xl bg-ivory/70 p-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-ink-soft">{PIX_KEY_TYPES[initial.type].label}</dt>
              <dd className="mt-1 break-all font-medium">{formatPixKey(initial.type, initial.key)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-ink-soft">Recebedor</dt>
              <dd className="mt-1 font-medium">{initial.receiverName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.2em] text-ink-soft">Cidade</dt>
              <dd className="mt-1 font-medium">{initial.city}</dd>
            </div>
          </dl>
          {savedMsg && <Alert kind="success">Chave salva! Façam o teste abaixo para conferir se o nome certo aparece no banco.</Alert>}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setShowTest((v) => !v)}>
              {showTest ? "Esconder teste" : "Testar Pix"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(true)}>
              Alterar chave
            </Button>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(async () => { await removePixAction(); setEditing(true); setForm((f) => ({ ...f, key: "" })); router.refresh(); })}
              className="px-2 text-sm text-ink-soft underline underline-offset-4 hover:text-rose-deep"
            >
              Remover
            </button>
          </div>
          {showTest && <PixTest pix={initial} />}
        </div>
      ) : (
        <form onSubmit={save} className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-xs uppercase tracking-[0.2em] text-ink-soft">Tipo de chave</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PIX_KEY_TYPES) as PixKeyType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={form.type === t}
                  onClick={() => set({ type: t, key: "" })}
                  className={`rounded-full border px-4 py-2 text-sm transition ${form.type === t ? "border-rose-deep bg-rose-deep text-ivory" : "border-gold/30 bg-white/70 hover:border-rose-deep"}`}
                >
                  {PIX_KEY_TYPES[t].label}
                </button>
              ))}
            </div>
          </fieldset>
          <Field
            label="Chave"
            value={form.key}
            onChange={(e) => set({ key: e.target.value })}
            placeholder={PIX_KEY_TYPES[form.type].placeholder}
            inputMode={form.type === "cpf" || form.type === "cnpj" || form.type === "phone" ? "numeric" : undefined}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nome de quem recebe"
              value={form.receiverName}
              onChange={(e) => set({ receiverName: e.target.value })}
              maxLength={60}
              required
              hint="Como está no banco. Os convidados veem esse nome antes de pagar."
            />
            <Field label="Cidade" value={form.city} onChange={(e) => set({ city: e.target.value })} maxLength={40} required placeholder="São Paulo" />
          </div>
          {error && <Alert>{error}</Alert>}
          <div className="flex gap-3">
            {hasKey && (
              <Button type="button" variant="outline" onClick={() => { setEditing(false); setError(null); }}>
                Cancelar
              </Button>
            )}
            <Button type="submit" loading={pending}>
              Salvar chave
            </Button>
          </div>
        </form>
      )}
    </PanelCard>
  );
}

/** Gera um Pix de R$ 1,00 para os noivos conferirem no app do banco (sem precisar pagar). */
function PixTest({ pix }: { pix: PixState }) {
  const payload = buildPixPayload({ key: pix.key, receiverName: pix.receiverName, city: pix.city, amountCents: 100, txid: "TESTE" });
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    QRCode.toDataURL(payload, { margin: 1, width: 360 }).then(setQr);
  }, [payload]);

  return (
    <div className="grid items-center gap-5 rounded-2xl border border-dashed border-gold/40 p-5 sm:grid-cols-[180px_1fr]">
      <div className="mx-auto w-44 rounded-xl bg-white p-2">{qr ? <img src={qr} alt="QR Code do Pix de teste" className="w-full" /> : <div className="aspect-square animate-pulse rounded-lg bg-paper" />}</div>
      <div className="space-y-3 text-sm">
        <p className="font-serif text-lg">Pix de teste: R$ 1,00</p>
        <ol className="list-decimal space-y-1 pl-5 text-ink-soft">
          <li>Abram o app do banco e escolham Pix → Ler QR Code (ou copia e cola).</li>
          <li>Confiram se aparece o nome e o banco certos.</li>
          <li>Não precisam concluir o pagamento: é só para conferir.</li>
        </ol>
        <Button
          type="button"
          variant="outline"
          className="px-4 py-2"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(payload);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            } catch {}
          }}
        >
          {copied ? "Copiado ✓" : "Copiar código"}
        </Button>
      </div>
    </div>
  );
}
