// Gera o "Pix copia e cola" (BR Code estático) seguindo o padrão EMV do
// Banco Central. Não depende de nenhuma empresa de pagamento: o dinheiro vai
// direto para a chave do casal.

function field(id: string, value: string) {
  return id + value.length.toString().padStart(2, "0") + value;
}

function crc16(payload: string) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Remove acentos e caracteres fora do padrão exigido pelos bancos. */
function sanitize(text: string, max: number) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .slice(0, max);
}

export type PixParams = {
  key: string;
  receiverName: string;
  city: string;
  amountCents?: number;
  /** Identificador da transação (até 25 caracteres alfanuméricos). */
  txid?: string;
  message?: string;
};

export function buildPixPayload({ key, receiverName, city, amountCents, txid, message }: PixParams) {
  const account =
    field("00", "br.gov.bcb.pix") +
    field("01", key.trim()) +
    (message ? field("02", sanitize(message, 50)) : "");

  let payload =
    field("00", "01") +
    field("26", account) +
    field("52", "0000") +
    field("53", "986") +
    (amountCents ? field("54", (amountCents / 100).toFixed(2)) : "") +
    field("58", "BR") +
    field("59", sanitize(receiverName, 25) || "RECEBEDOR") +
    field("60", sanitize(city, 15) || "BRASIL") +
    field("62", field("05", (txid ?? "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***"));

  payload += "6304";
  return payload + crc16(payload);
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
