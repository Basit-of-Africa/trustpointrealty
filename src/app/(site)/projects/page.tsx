import type { Metadata } from "next";
import { images } from "@/content/site";
import { Container, PageHero, ProjectCards, SplitHeading, StatsBand } from "@/components/site/sections";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHero title="Projects" />
      <SplitHeading
        kicker="Projects & Services"
        title="Ongoing & Completed Projects"
        text="Our services go beyond buying and selling. TrustPoint Realty offers a comprehensive suite of real estate services, including property management, valuation, and advisory services."
      />
      <section className="bg-tp-light pt-10 pb-20">
        <Container><ProjectCards /></Container>
        <Container className="mt-20 text-center">
          <h2 className="text-4xl font-bold text-[#222] lg:text-[44px]">Our Estate Features</h2>
          <p className="mt-6 leading-7 text-brand-900">
            Our estates offers premium world-class features typical of new modern settlements.<br />We give real estate beyond the REGULAR…
          </p>
        </Container>
        <div className="mx-auto mt-14 max-w-[1346px] bg-[#f2f5f7] px-5 py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images.featuresStrip}
            alt="Estate features: prime location, premium security, road network, street lights, drainage system, recreational area, tech hub, central water supply, gym facility, commercial area, coconut trees, sport complex, green area"
            loading="lazy"
            className="mx-auto w-full max-w-[1260px]"
          />
        </div>
      </section>
      <StatsBand />
    </>
  );
}
