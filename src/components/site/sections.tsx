import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { estateFeatures, estates, faqs, images, services, stats, testimonials, whyChoose } from "@/content/site";
import { Icon } from "./icons";
import { IllustrativeTag, Skyline } from "./brand";
import { QuoteForm } from "./quote-form";

/* eslint-disable @next/next/no-img-element -- images are served from the WordPress uploads (see content/site.ts) */

export const Container = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`mx-auto max-w-[1240px] px-5 ${className}`}>{children}</div>
);

export function GoldButton({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  const cls = "inline-block bg-accent-500 px-10 py-3 text-[16px] text-brand-900 uppercase transition hover:bg-accent-600";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}

/** The banner at the top of every inner page (the header overlays it). */
export function PageHero({ title, image = images.pageHero }: { title: string; image?: string }) {
  return (
    <section className="relative flex h-[420px] items-center justify-center bg-brand-900 bg-cover bg-center pt-[71px] sm:h-[476px] sm:pt-[165px]" style={{ backgroundImage: `url("${image}")` }}>
      <div className="absolute inset-0 bg-brand-900/80" />
      <h1 className="relative px-5 text-center text-5xl font-bold text-white sm:text-6xl lg:text-[80px] lg:leading-[1.2]">{title}</h1>
    </section>
  );
}

export function Kicker({ children, className = "text-accent-500" }: { children: ReactNode; className?: string }) {
  return <p className={`font-heading text-[22px] font-bold ${className}`}>{children}</p>;
}

/** Heading on the left, supporting text on the right (used across the site). */
export function SplitHeading({ kicker, title, text, kickerClass }: { kicker: string; title: string; text: string; kickerClass?: string }) {
  return (
    <Container className="grid gap-6 py-[60px] md:grid-cols-2 md:gap-[40px]">
      <div>
        <Kicker className={kickerClass ?? "text-brand-900"}>{kicker}</Kicker>
        <h2 className="mt-4 text-4xl font-bold leading-tight text-[#222] lg:text-[44px]">{title}</h2>
      </div>
      <p className="self-center leading-7 md:pt-4">{text}</p>
    </Container>
  );
}

export function ServiceCards() {
  return (
    <div className="grid gap-[30px] md:grid-cols-3">
      {services.map((s) => (
        <article key={s.title}>
          <img src={s.image} alt={s.title} loading="lazy" className="aspect-[370/244] w-full bg-zinc-100 object-cover" />
          <h3 className="mt-8 text-[26px] font-bold text-brand-900">{s.title}</h3>
          <p className="mt-3 leading-7">{s.text}</p>
        </article>
      ))}
    </div>
  );
}

export function ProjectCards() {
  return (
    <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {estates.map((e) => (
        <article key={e.slug}>
          <Link href={`/${e.slug}`} className="relative block overflow-hidden">
            <img src={e.image} alt="" loading="lazy" className="aspect-square w-full bg-zinc-200 object-cover transition duration-500 hover:scale-105" />
            <IllustrativeTag />
          </Link>
          <div className="px-[15px]">
            <h3 className="mt-6 text-lg font-bold text-black">{e.name}</h3>
            <p className="text-[15px]">{e.location}</p>
            <Link href={`/${e.slug}`} className="mt-6 inline-block rounded bg-brand-900 px-[30px] py-[11px] text-[15px] text-white transition hover:bg-brand-700">
              Learn more
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function StatsBand() {
  return (
    <section className="relative bg-brand-900 bg-cover bg-center py-[100px]" style={{ backgroundImage: `url("${images.pageHero}")` }}>
      <div className="absolute inset-0 bg-brand-900/80" />
      <Container className="relative grid grid-cols-2 gap-y-10 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-4 sm:flex-row sm:gap-[30px]">
            <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-accent-500 text-white">
              <Icon name={s.icon} className="h-6 w-6" />
            </span>
            <div>
              <div className="font-heading text-4xl font-bold text-white lg:text-[42px]">{s.value}</div>
              <div className="mt-2 text-[15px] text-white">{s.label}</div>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

function IconCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 border border-zinc-200 bg-tp-light px-[50px] py-[50px]">
      <Icon name={icon} className="h-12 w-12 shrink-0 text-tp-orange" />
      <div>
        <h3 className="text-[26px] leading-tight font-bold text-brand-900">{title}</h3>
        <p className="mt-3 leading-7">{text}</p>
      </div>
    </div>
  );
}

export function EstateFeatures() {
  return (
    <section className="bg-tp-light pb-[140px]">
      <Container className="pt-[50px] text-center">
        <h2 className="text-4xl font-bold text-[#222] lg:text-[44px]">Our Estate Features</h2>
        <p className="mt-6 leading-7 text-brand-900">
          Our estates offers premium world-class features typical of new modern settlements.<br />We give real estate beyond the REGULAR…
        </p>
      </Container>
      <Container className="mt-[110px] grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {estateFeatures.map((f) => <IconCard key={f.title} {...f} />)}
      </Container>
    </section>
  );
}

export function WhyChoose() {
  return (
    <>
      <SplitHeading
        kicker="#What we stand for"
        title="Why Choose TrustPoint Realty"
        text="Choose TrustPoint Realty for a trusted partner who will guide you through the real estate process with professionalism, personalized attention, and a commitment to your success."
      />
      <section className="bg-tp-light py-5">
        <Container className="grid gap-5 md:grid-cols-3">
          {whyChoose.map((w) => <IconCard key={w.title} {...w} />)}
        </Container>
      </section>
    </>
  );
}

/** Navy rounded call-to-action with the city skyline (homepage). */
export function CtaSkyline() {
  return (
    <section className="bg-tp-light px-5 pb-5">
      <div className="relative mx-auto max-w-[1326px] overflow-hidden rounded-[30px] bg-brand-900 px-6 py-[100px] sm:px-[100px]">
        <Skyline className="absolute inset-x-0 bottom-0 h-[32%] w-full text-[#2b3550]" />
        <div className="relative">
        <Kicker>#Your Real Estate TrustPoint</Kicker>
        <h2 className="mt-6 max-w-[1000px] text-4xl leading-tight font-bold text-white lg:text-[60px]">
          Let us assist you at every stage of your real estate journey.
        </h2>
        <p className="mt-8 text-[15px] text-white">Ready to embark on your real estate journey? Reach out to us for personalized assistance.</p>
        </div>
      </div>
    </section>
  );
}

/** Full-width call-to-action over the city photo (services page). */
export function CtaImage() {
  return (
    <section className="relative bg-brand-900 bg-cover bg-center py-[80px]" style={{ backgroundImage: `url("${images.buildings}")` }}>
      <div className="absolute inset-0 bg-brand-900/80" />
      <div className="relative mx-auto max-w-[1366px] px-5 sm:px-[7px]">
        <Kicker>#Your Real Estate TrustPoint</Kicker>
        <h2 className="mt-4 max-w-[1000px] text-4xl leading-tight font-bold text-white lg:text-[60px]">
          Let us assist you at every stage of your real estate journey.
        </h2>
        <p className="mt-8 text-[15px] text-white">Ready to embark on your real estate journey? Reach out to us for personalized assistance.</p>
        <div className="mt-14 sm:pl-4"><GoldButton href="/contact-us">Get in touch</GoldButton></div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="bg-white pb-14">
      <SplitHeading
        kicker="#Testimonials on Trust and Experience"
        title="What People are Saying..."
        text="Real stories, real results. Hear from our satisfied clients who have experienced exceptional service and support from our agency."
      />
      <Container className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="border border-zinc-200 px-[50px] py-[50px]">
            <Quote className="h-12 w-12 text-zinc-400" aria-hidden />
            <blockquote className="mt-8 text-xl leading-9">{t.quote}</blockquote>
            <figcaption className="mt-6">
              <div className="font-heading text-[15px] font-bold">{t.name}</div>
              <div className="text-[13px]">{t.role}</div>
            </figcaption>
          </figure>
        ))}
      </Container>
    </section>
  );
}

export function Faq() {
  return (
    <div>
      <Kicker>Learn More From</Kicker>
      <h2 className="mt-6 text-4xl leading-tight font-bold text-brand-900 lg:text-[44px]">Frequently Asked Questions</h2>
      <div className="mt-10 border border-zinc-300 bg-white">
        {faqs.map((f, i) => (
          <details key={f.q} open={i === 0} className="group border-b border-zinc-300 last:border-b-0">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-6 font-heading text-[15px] font-bold text-brand-900">
              {f.q}
              <ChevronDown className="h-5 w-5 shrink-0 transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="border-t border-zinc-300 px-5 py-6 leading-7">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

/** Navy quote form overlapping the section above, FAQ on the right. */
export function QuoteAndFaq() {
  return (
    <section className="bg-gradient-to-b from-white from-[55px] to-tp-light to-[55px] pb-12">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-[100px]">
        <div className="bg-brand-900 px-6 py-16 sm:px-16">
          <QuoteForm />
        </div>
        <Faq />
      </Container>
    </section>
  );
}
