import type { Metadata } from "next";
import { Container, CtaImage, Kicker, PageHero, QuoteAndFaq, ServiceCards, StatsBand, WhyChoose } from "@/components/site/sections";

export const metadata: Metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <>
      <PageHero title="Services" />
      <section className="py-[100px]">
        <Container>
          <div className="mb-14 text-center">
            <Kicker>Our Services</Kicker>
            <h2 className="mt-4 text-4xl font-bold text-brand-900 lg:text-[44px]">Quality Services</h2>
          </div>
          <ServiceCards />
        </Container>
      </section>
      <CtaImage />
      <WhyChoose />
      <StatsBand />
      <QuoteAndFaq />
    </>
  );
}
