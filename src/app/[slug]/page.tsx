import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoFloatingCta, DemoTopBar } from "@/components/wedding/DemoBar";
import { FallingPetals } from "@/components/wedding/FallingPetals";
import { GiftGrid } from "@/components/wedding/Gifts";
import { InvitationEnvelope } from "@/components/wedding/InvitationEnvelope";
import { Guestbook } from "@/components/wedding/Guestbook";
import { RsvpForm } from "@/components/wedding/Rsvp";
import { Events, Footer, formatWeddingDate, Hero, Nav, SectionTitle, Story, visibleSections } from "@/components/wedding/Sections";
import { demoWedding } from "@/lib/demo";
import { getGifts, getMessages, getWeddingBySlug } from "@/lib/weddings";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await getWeddingBySlug((await params).slug);
  if (!found) return {};
  const { wedding } = found;
  const title = `${wedding.partner1} & ${wedding.partner2}`;
  const description = `${wedding.headline} ${formatWeddingDate(wedding.date).long}. Veja o convite e confirme sua presença.`;
  return {
    title,
    description,
    openGraph: { title: `💍 ${title}`, description, type: "website", locale: "pt_BR" },
    twitter: { card: "summary_large_image", title, description },
    // Rascunho não deve aparecer no Google.
    robots: found.preview ? { index: false, follow: false } : undefined,
  };
}

export default async function WeddingPage({ params }: Params) {
  const found = await getWeddingBySlug((await params).slug);
  if (!found) notFound();
  const { wedding, preview } = found;
  const isDemo = wedding.slug === demoWedding.slug;
  const [gifts, messages] = await Promise.all([getGifts(wedding.id), getMessages(wedding.id)]);
  const sections = visibleSections(wedding, gifts.length);
  const firstSection = sections.story ? "#historia" : sections.events ? "#cerimonia" : sections.gifts ? "#presentes" : "#rsvp";

  const themeVars = {
    "--rose": wedding.theme.rose,
    "--rose-deep": wedding.theme.roseDeep,
    "--gold": wedding.theme.gold,
    "--sage": wedding.theme.sage,
  } as React.CSSProperties;

  // Prazo sugerido: 30 dias antes. Se já passou, pede "o quanto antes"; depois do casamento, encerra.
  const weddingTime = new Date(wedding.date).getTime();
  const deadlineTime = weddingTime - 30 * 86_400_000;
  const deadline =
    deadlineTime > Date.now()
      ? `até ${new Date(deadlineTime).toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: "America/Sao_Paulo" })}`
      : "o quanto antes";
  const rsvpClosed = weddingTime < Date.now();

  return (
    <div style={themeVars} className="paper-bg min-h-svh">
      {isDemo && <DemoTopBar />}
      {preview && (
        <div className="relative z-[45] flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-ink px-4 py-2 text-center text-sm text-ivory">
          <span>👀 Prévia: só vocês estão vendo. O site ainda não foi publicado.</span>
          <Link href="/painel" className="underline underline-offset-4">
            Voltar ao painel
          </Link>
        </div>
      )}
      {wedding.showEnvelope && (
        <InvitationEnvelope
          partner1={wedding.partner1}
          partner2={wedding.partner2}
          dateLabel={formatWeddingDate(wedding.date).short}
        />
      )}
      <FallingPetals />
      <Nav wedding={wedding} sections={sections} />
      <main>
        <Hero wedding={wedding} next={firstSection} />
        {sections.story && <Story wedding={wedding} />}
        {sections.events && <Events wedding={wedding} />}
        {sections.gifts && (
          <section id="presentes" className="px-4 py-24">
            <SectionTitle kicker="Lista de presentes" title="Presenteie os noivos" />
            <p className="mx-auto -mt-4 mb-12 max-w-xl text-center font-serif text-lg italic text-ink-soft">
              Sua presença é o nosso maior presente. Mas, se quiser nos mimar, escolha uma das opções abaixo. O valor vai direto para nós via Pix.
            </p>
            <GiftGrid wedding={wedding} gifts={gifts} />
          </section>
        )}
        <section id="rsvp" className="bg-white/40 px-4 py-24">
          <SectionTitle kicker="Você vem?" title="Confirme sua presença" />
          <RsvpForm slug={wedding.slug} deadline={deadline} closed={rsvpClosed} />
        </section>
        <section id="recados" className="px-4 py-24">
          <SectionTitle kicker="Mural" title="Deixe seu recado" />
          <Guestbook slug={wedding.slug} messages={messages} />
        </section>
      </main>
      <Footer wedding={wedding} />
      {isDemo && <DemoFloatingCta />}
    </div>
  );
}
