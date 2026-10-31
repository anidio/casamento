# Juntos — sites de casamento

Plataforma para casais criarem o site do casamento: convite animado, história, cerimônia,
confirmação de presença e lista de presentes com Pix direto para os noivos.

## Rodando

```bash
npm install
npm run dev
```

- http://localhost:3000 — página da plataforma
- http://localhost:3000/demo — casamento de exemplo (Thaís & Lázaro)
- http://localhost:3000/cadastro — criar conta de noivos → assistente → painel
- http://localhost:3000/painel — painel dos noivos (precisa de login)

O envelope de abertura aparece toda vez que a página é aberta (o convidado clica para abrir ou em "pular").

## Estrutura

```
src/app/page.tsx              página da plataforma
src/app/[slug]/page.tsx       site público de cada casamento (rascunho: só o dono vê)
src/app/(auth)/               entrar, cadastro, esqueci-senha, redefinir-senha
src/app/painel/novo/          assistente "criar nosso site"
src/app/painel/(app)/         painel com abas: visão geral, informacoes, visual, presentes, recebidos, convidados (cada aba com seu actions.ts)
src/app/[slug]/actions.ts     ações públicas: "Já fiz o Pix", confirmação de presença e recados
src/app/[slug]/opengraph-image.tsx  imagem de compartilhamento (WhatsApp) gerada com nomes e cores do casal
src/app/api/auth/[...all]/    rotas do Better Auth
src/middleware.ts             manda quem não está logado de /painel para /entrar
src/lib/auth.ts               configuração do login (Better Auth)
src/lib/my-wedding.ts         consultas do painel (sempre filtradas pelo dono)
src/lib/slug.ts               regras do endereço do casamento (formato e reservados)
src/lib/email.ts              envio de e-mails (Resend)
src/lib/pix-key.ts            validação das chaves Pix (CPF, CNPJ, e-mail, celular, aleatória)
src/lib/palettes.ts           paletas de cores e cálculo de contraste
src/lib/gift-ideas.ts         sugestões de presentes engraçados
src/lib/orders.ts             presentes recebidos e totais
src/lib/rate-limit.ts         limite de envios por IP (anti-spam)
src/lib/guests.ts             confirmações de presença e recados
src/assets/fonts/             fontes usadas na imagem de compartilhamento
src/components/ui/            peças visuais dos formulários e do painel
src/components/wedding/       envelope, pétalas, contagem, seções, presentes + Pix, confirmação, mural
src/components/ornaments.tsx  ornamentos SVG (divisor, ramos florais, coração)
src/lib/pix.ts                gerador de Pix copia e cola (padrão BR Code do Banco Central)
src/db/schema.ts              esquema do banco (Drizzle)
src/db/index.ts               conexão com o banco (node-postgres; funciona com Neon e Postgres local)
src/lib/weddings.ts           consultas usadas pelas páginas (/demo vem do código)
drizzle/                      migrações SQL geradas
scripts/db-test.ts            testa migrações e consultas num Postgres em memória
SPRINTS.md                    planejamento
```

## Banco (Neon)

1. Crie um projeto em https://neon.com (região São Paulo, se disponível)
2. Copie `.env.example` para `.env.local` e cole a connection string em `DATABASE_URL`
3. Preencha também `BETTER_AUTH_SECRET` (comando para gerar está no `.env.example`)
4. `npm run db:migrate` cria as tabelas

Sem `DATABASE_URL` o site funciona só com o `/demo`.

| Comando | O que faz |
|---|---|
| `npm run db:generate` | gera nova migração depois de mudar `src/db/schema.ts` |
| `npm run db:migrate` | aplica as migrações no Neon |
| `npm run db:studio` | abre um painel para ver e editar os dados |
| `npm run db:test` | testa as migrações sem precisar do Neon |
| `npm run db:seed` | cria um casamento de teste em `/joao-e-maria` |

Segurança: o navegador nunca acessa o banco. Toda leitura privada e toda escrita passa pelo servidor, que confere se o casamento pertence a quem está logado.
