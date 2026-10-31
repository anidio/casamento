import "server-only";
import { Resend } from "resend";

// Envio de e-mails. Com RESEND_API_KEY usa o Resend; sem a chave (ambiente de
// desenvolvimento) só mostra o e-mail no terminal, para você copiar o link.

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "Juntos <onboarding@resend.dev>";

export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  if (!resend) {
    console.log(`\n✉️  [e-mail não enviado: RESEND_API_KEY ausente]\nPara: ${to}\nAssunto: ${subject}\n${text}\n`);
    return;
  }
  const { error } = await resend.emails.send({ from, to, subject, html, text });
  if (error) console.error("Falha ao enviar e-mail:", error);
}

export function resetPasswordEmail(name: string, url: string) {
  const text = `Olá, ${name}!\n\nRecebemos um pedido para redefinir sua senha. Abra o link abaixo (vale por 1 hora):\n${url}\n\nSe não foi você, ignore este e-mail.`;
  const html = `
  <div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:32px;background:#fbf7f1;color:#3d2f2a;border-radius:16px">
    <p style="font-size:28px;color:#9c5d62;margin:0 0 16px">Juntos</p>
    <p>Olá, ${escapeHtml(name)}!</p>
    <p>Recebemos um pedido para redefinir sua senha. O link vale por 1 hora.</p>
    <p style="margin:28px 0"><a href="${url}" style="background:#9c5d62;color:#fbf7f1;padding:12px 28px;border-radius:999px;text-decoration:none">Criar nova senha</a></p>
    <p style="font-size:13px;color:#6f5e57">Se não foi você, ignore este e-mail.</p>
  </div>`;
  return { subject: "Redefinir sua senha", html, text };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function giftReceivedEmail(p: { couple: string; guestName: string; giftName: string; amount: string; code: string; message: string | null; panelUrl: string }) {
  const text = `${p.guestName} avisou que mandou um presente de ${p.amount}: "${p.giftName}".
Código do Pix: ${p.code} (procurem no extrato do banco para confirmar).
${p.message ? `\nRecado: "${p.message}"\n` : ""}
Vejam todos os presentes no painel: ${p.panelUrl}`;
  const html = `
  <div style="font-family:Georgia,serif;max-width:480px;margin:auto;padding:32px;background:#fbf7f1;color:#3d2f2a;border-radius:16px">
    <p style="font-size:28px;color:#9c5d62;margin:0 0 16px">🎁 Novo presente!</p>
    <p><b>${escapeHtml(p.guestName)}</b> avisou que mandou um presente para ${escapeHtml(p.couple)}:</p>
    <p style="font-size:20px;margin:16px 0">${escapeHtml(p.giftName)} · <b style="color:#9c5d62">${escapeHtml(p.amount)}</b></p>
    ${p.message ? `<blockquote style="margin:16px 0;padding:12px 16px;border-left:3px solid #b8955a;background:#fff;font-style:italic">${escapeHtml(p.message)}</blockquote>` : ""}
    <p style="font-size:14px;color:#6f5e57">Código do Pix: <b>${escapeHtml(p.code)}</b>. Confiram no extrato do banco e marquem como pago no painel.</p>
    <p style="margin:28px 0"><a href="${p.panelUrl}" style="background:#9c5d62;color:#fbf7f1;padding:12px 28px;border-radius:999px;text-decoration:none">Abrir o painel</a></p>
  </div>`;
  return { subject: `🎁 ${p.guestName} mandou um presente`, html, text };
}
