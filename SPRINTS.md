# Plano de sprints

Plataforma de sites de casamento com lista de presentes (inclusive engraçados) e Pix direto para os noivos.
Stack: Next.js 15 (App Router) · Tailwind 4 · Motion · Neon (Postgres) + Drizzle (node-postgres) · Better Auth · Resend · Cloudflare R2 · Vercel.

## ✅ Sprint 1 — Base e visual romântico
- [x] Projeto Next.js + Tailwind + fontes próprias (Great Vibes, Cormorant Garamond, Jost)
- [x] Tema por casamento via variáveis CSS (rosa, rosa escuro, dourado, verde-sálvia)
- [x] Abertura com **envelope animado** (lacre de cera, aba abrindo, convite subindo)
- [x] **Pétalas caindo**, fundo de papel com textura, ramos florais em SVG, texto dourado brilhando
- [x] Hero com nomes, data e **contagem regressiva**
- [x] Nossa história (linha do tempo), cerimônia/recepção com mapa, traje
- [x] Lista de presentes com **Pix copia e cola + QR Code** (gerado no próprio site, sem taxa)
- [x] Formulário de confirmação de presença (só interface)
- [x] Página `/demo` com dados de exemplo (Thaís & Lázaro) e página inicial da plataforma
- [x] Respeita `prefers-reduced-motion`

## ✅ Sprint 2 — Banco, cadastro e login dos noivos
- [x] Trocar Supabase por Neon + Drizzle (esquema em `src/db/schema.ts`, migração em `drizzle/`)
- [x] Teste das migrações em Postgres na memória (`npm run db:test`) e casamento de teste (`npm run db:seed`)
- [x] Páginas públicas lendo do banco (o /demo continua no código)
- [x] Better Auth: cadastro, login, sair, "esqueci a senha" e redefinir senha
- [x] E-mails pelo Resend (sem chave, o link aparece no terminal)
- [x] `/painel` protegido (middleware + checagem no servidor)
- [x] Assistente "Criar nosso site": nomes → data e horário → endereço, com checagem de disponibilidade e endereços reservados
- [x] Painel: status, contagem de dias, ver site/prévia, copiar link, publicar/despublicar
- [x] Rascunho só visível para o dono (com faixa de "Prévia")
- [x] Seções vazias somem do site (história, cerimônia, presentes) até serem preenchidas
- [ ] Verificação de e-mail no cadastro (deixar para antes de abrir ao público)

## ✅ Sprint 3 — Painel dos noivos
- [x] Painel com abas (Visão geral, Informações, Visual, Presentes e Pix) e checklist "deixando o site pronto"
- [x] Informações: nomes, data e horário, frase de destaque, texto do convite, traje
- [x] Nossa história: adicionar, editar, reordenar e remover momentos (até 12)
- [x] Cerimônia e recepção (opcional), com link do mapa gerado pelo endereço
- [x] Barra de salvar com aviso de alterações não salvas
- [x] Visual: 8 paletas prontas + cores personalizadas, prévia ao vivo e aviso de contraste
- [x] Ligar/desligar o envelope de abertura
- [x] Chave Pix (CPF, CNPJ, e-mail, celular, aleatória) com validação e Pix de teste de R$ 1,00
- [x] Presentes: criar, editar, ocultar, excluir e reordenar; sugestões engraçadas prontas
- [ ] Upload de foto de capa e fotos dos presentes (Cloudflare R2 ou Vercel Blob)

## ✅ Sprint 4 — Pagamentos
- [x] "Já fiz o Pix" grava o presente (`gift_orders`), com o preço lido do banco (não do navegador)
- [x] Código curto em cada Pix (vai no identificador da transação) para achar no extrato
- [x] Contribuição com valor livre (os noivos ligam/desligam)
- [x] Painel "Recebidos": total confirmado e pendente, filtros, marcar pago / pendente / "não recebi"
- [x] Exportar planilha CSV (abre no Excel com acentos)
- [x] E-mail aos noivos a cada presente
- [x] Anti-spam: campo-armadilha para robôs, limite de envios por IP, clique duplo não duplica
- [x] Resumo de presentes na visão geral
- [ ] Confirmação automática do pagamento (exige conta num banco/PSP com API; ver Sprint 6)

## ✅ Sprint 5 — Convidados
- [x] Confirmação de presença gravando em `rsvps` (nome, vai/não vai, pessoas, WhatsApp, recado privado)
- [x] Mesma pessoa respondendo de novo atualiza a resposta (ignora acento, maiúscula e espaços)
- [x] Prazo "confirme até…" (30 dias antes, ou "o quanto antes"); encerra depois do casamento
- [x] Mural de recados no site, com moderação opcional (aprovar antes de publicar)
- [x] Painel "Convidados": pessoas confirmadas, vão / não vão, busca, link do WhatsApp, excluir, CSV
- [x] Moderação de recados no painel: aprovar, esconder, excluir
- [x] Resumo de convidados na visão geral
- [x] Anti-spam em todos os formulários públicos (campo-armadilha + limite por IP)
- [x] Imagem de compartilhamento (WhatsApp/Instagram) com nomes, data e cores do casal
- [ ] Captcha (Cloudflare Turnstile), se aparecer spam de verdade

## Sprint 6 — Versão comercial
- [ ] Modelos de visual (clássico, rústico, praia, moderno)
- [ ] Domínio próprio por casamento
- [ ] Cartão de crédito: cada casal conecta a própria conta Mercado Pago (OAuth) + webhook
- [ ] Planos/cobrança da plataforma
- [ ] Termos de uso, política de privacidade (LGPD), exclusão de dados
- [ ] Música de fundo opcional, galeria pós-casamento
