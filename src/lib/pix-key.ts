// Validação e formatação das chaves Pix (usado no navegador e no servidor).

export const PIX_KEY_TYPES = {
  cpf: { label: "CPF", placeholder: "000.000.000-00" },
  cnpj: { label: "CNPJ", placeholder: "00.000.000/0000-00" },
  email: { label: "E-mail", placeholder: "voces@email.com" },
  phone: { label: "Celular", placeholder: "(11) 98765-4321" },
  random: { label: "Chave aleatória", placeholder: "123e4567-e89b-12d3-a456-426614174000" },
} as const;

export type PixKeyType = keyof typeof PIX_KEY_TYPES;

const digits = (s: string) => s.replace(/\D/g, "");

function validCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

function validCnpj(cnpj: string) {
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

/**
 * Normaliza a chave para o formato que vai no Pix copia e cola.
 * Devolve { key } ou { error } com a mensagem para mostrar.
 */
export function normalizePixKey(type: PixKeyType, raw: string): { key: string; error?: undefined } | { key?: undefined; error: string } {
  const value = raw.trim();
  switch (type) {
    case "cpf": {
      const d = digits(value);
      return validCpf(d) ? { key: d } : { error: "CPF inválido." };
    }
    case "cnpj": {
      const d = digits(value);
      return validCnpj(d) ? { key: d } : { error: "CNPJ inválido." };
    }
    case "email": {
      const e = value.toLowerCase();
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 77 ? { key: e } : { error: "E-mail inválido." };
    }
    case "phone": {
      let d = digits(value);
      if (d.startsWith("55") && d.length >= 12) d = d.slice(2);
      // DDD (2) + número (8 ou 9 dígitos)
      return /^[1-9]{2}9?\d{8}$/.test(d) ? { key: `+55${d}` } : { error: "Celular inválido. Use DDD + número." };
    }
    case "random": {
      const r = value.toLowerCase();
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(r) ? { key: r } : { error: "Chave aleatória inválida." };
    }
  }
}

/** Mostra a chave de um jeito amigável (com máscara). */
export function formatPixKey(type: PixKeyType | null, key: string) {
  if (type === "cpf") return key.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  if (type === "cnpj") return key.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  if (type === "phone") return key.replace(/^\+55(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  return key;
}
