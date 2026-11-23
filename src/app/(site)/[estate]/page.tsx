import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { estates, images } from "@/content/site";
import { Container, GoldButton, Kicker, PageHero } from "@/components/site/sections";
import { QuoteForm } from "@/components/site/quote-form";

/* eslint-disable @next/next/no-img-element */

// Only the four estate pages exist at the site root; anything else is a 404.
export const dynamicParams = false;
export function generateStaticParams() {
  return estates.map((e) => ({ estate: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[estate]">): Promise<Metadata> {
  const { estate: slug } = await params;
  const estate = estates.find((e) => e.slug === slug);
  return { title: estate?.name };
}

export default async function EstatePage({ params }: PageProps<"/[estate]">) {
  const { estate: slug } = await params;
  const estate = estates.find((e) => e.slug === slug);
  if (!estate) notFound();
  return (
    <>
      <PageHero title={estate.name} />
      <section className="pt-[100px]">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-[30px]">
          <div>
            <Kicker className="text-brand-900">Estate Package</Kicker>
            <h2 className="mt-4 text-4xl font-bold text-[#222] lg:text-[44px]">{estate.name}</h2>
            <div className="mt-8 space-y-4 leading-7">{estate.paragraphs.map((p) => <p key={p}>{p}</p>)}</div>
            <div className="mt-12 bg-[#f2f5f7] p-5">
              <img src={images.featuresStrip} alt="Estate features" loading="lazy" className="w-full" />
            </div>
            <div className="mt-9 sm:pl-4">
              {estate.faqPdf ? <GoldButton href={estate.faqPdf} external>Check FAQ</GoldButton> : <GoldButton href="/contact-us">Check FAQ</GoldButton>}
            </div>
          </div>
          <img src={estate.flyer} alt={`${estate.name} flyer`} className="w-full bg-zinc-100 object-contain" />
        </Container>
      </section>
      <section className="bg-gradient-to-b from-white from-[55px] to-tp-light to-[55px] pb-24">
        <Container>
          <div className="bg-brand-900 px-6 py-16 sm:px-16">
            <QuoteForm wide />
          </div>
        </Container>
      </section>
    </>
  );
}
