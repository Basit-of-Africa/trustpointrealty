import Link from "next/link";
import { CalendarCheck, Phone } from "lucide-react";
import { contact, hero, images } from "@/content/site";
import { HeroSlideshow } from "@/components/site/hero-slideshow";
import {
  Container,
  CtaSkyline,
  EstateFeatures,
  ProjectCards,
  QuoteAndFaq,
  ServiceCards,
  SplitHeading,
  StatsBand,
  Testimonials,
} from "@/components/site/sections";

export default function HomePage() {
  return (
    <>
      <section className="relative flex min-h-[640px] items-center bg-brand-900 py-24 lg:min-h-[940px]">
        <HeroSlideshow slides={images.heroSlides} />
        <div className="absolute inset-0 bg-brand-900/60" />
        <div className="relative mx-auto max-w-[1030px] px-5 text-center">
          <p className="font-heading text-lg font-bold text-accent-500 lg:text-[24px]">{hero.kicker}</p>
          <h1 className="mt-6 text-5xl leading-tight font-bold text-white sm:text-6xl lg:text-[80px] lg:leading-[1.4]">{hero.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-white lg:text-[24px] lg:leading-[1.95]">{hero.text}</p>
          <div className="mt-12 flex flex-wrap justify-center gap-[10px]">
            <a href={contact.whatsappBooking} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded bg-accent-500 px-8 py-4 text-[16px] text-brand-900 transition hover:bg-accent-600">
              Book Site Tour <CalendarCheck className="h-7 w-7" aria-hidden />
            </a>
            <a href={contact.callHref} className="flex items-center gap-2 rounded bg-white px-8 py-4 text-[16px] text-brand-900 transition hover:bg-zinc-100">
              Call Us Today <Phone className="h-6 w-6 fill-brand-900" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      <section className="py-[100px]">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-4xl font-bold text-brand-900 lg:text-[44px]">Our Services</h2>
            <Link href="/services" className="pr-16 text-[15px] text-brand-900 hover:text-accent-700">VIEW ALL</Link>
          </div>
          <ServiceCards />
        </Container>
      </section>

      <SplitHeading
        kicker="Projects & Services"
        title="Ongoing & Completed Projects"
        text="Our services go beyond buying and selling. TrustPoint Realty offers a comprehensive suite of real estate services, including property management, valuation, and advisory services."
      />
      <section className="bg-tp-light py-6">
        <Container><ProjectCards /></Container>
      </section>

      <StatsBand />
      <EstateFeatures />
      <CtaSkyline />
      <Testimonials />
      <QuoteAndFaq />
    </>
  );
}
