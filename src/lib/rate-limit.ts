import "server-only";

// Limite simples de tentativas por chave (ex.: IP), guardado na memória do
// servidor. Não é à prova de tudo (cada instância serverless tem a sua
// memória), mas segura robôs e cliques repetidos sem precisar de outro serviço.

const hits = new Map<string, number[]>();

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  return true;
}
