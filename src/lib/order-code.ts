// Código curto que identifica o presente no Pix (vai no campo "identificador").
// Sem letras que confundem (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newOrderCode(length = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const ORDER_CODE = /^[A-HJ-NP-Z2-9]{6}$/;
