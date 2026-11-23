import type { Metadata } from "next";
import { Building2, Landmark, Lightbulb, Recycle, Road, Volleyball, Waves } from "lucide-react";
import { about, images } from "@/content/site";
import { Container, GoldButton, Kicker, PageHero, StatsBand, WhyChoose } from "@/components/site/sections";

export const metadata: Metadata = { title: "About" };

const featureIcons = [Road, Recycle, Lightbulb, Waves, Volleyball];

export default function AboutPage() {
  return (
    <>
      <PageHero title="About Us" />
      <section className="py-[100px]">
        <Container className="grid gap-14 lg:grid-cols-2 lg:gap-[100px]">
          <div>
            <Kicker>About Us</Kicker>
            <h2 className="mt-6 text-4xl leading-tight font-bold text-brand-900 lg:text-[44px]">{about.title}</h2>
            <p className="mt-8 leading-7">{about.text}</p>
            <div className="mt-16 sm:pl-4"><GoldButton href="/services">Our Service</GoldButton></div>
          </div>
          <div className="space-y-10 lg:pt-8">
            <div className="flex gap-8">
              <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-accent-500 text-white"><Building2 className="h-6 w-6" aria-hidden /></span>
              <div>
                <h3 className="text-[26px] font-bold text-brand-900">Vision</h3>
                <p className="mt-2 leading-7">{about.vision}</p>
              </div>
            </div>
            <div className="flex gap-8">
              <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-accent-500 text-white"><Landmark className="h-6 w-6" aria-hidden /></span>
              <div>
                <h3 className="text-[26px] font-bold text-brand-900">Mission Statement</h3>
                <div className="mt-2 leading-7">{about.mission.map((m) => <p key={m}>{m}</p>)}</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <StatsBand />

      <section className="grid lg:grid-cols-2">
        <div className="relative bg-brand-900 bg-cover bg-center px-6 py-[100px] sm:px-[90px]" style={{ backgroundImage: `url("${images.buildings}")` }}>
          <div className="absolute inset-0 bg-brand-900/80" />
          <div className="relative">
            <Kicker>Sustainability</Kicker>
            <h2 className="mt-4 text-4xl leading-tight font-bold text-white">Let us assist you at every stage of your real estate journey</h2>
            <p className="mt-8 leading-7 text-white">Ready to embark on your real estate journey? Reach out to us for personalized assistance.</p>
            <div className="mt-16 sm:pl-4"><GoldButton href="/contact-us">Get in touch</GoldButton></div>
          </div>
        </div>
        <div className="relative bg-accent-500 bg-cover bg-center px-6 py-[100px] sm:px-[90px]" style={{ backgroundImage: `url("${images.worker}")` }}>
          <div className="absolute inset-0 bg-accent-500/85" />
          <div className="relative text-brand-900">
            <h2 className="text-[26px] font-bold">Our Estate Features</h2>
            <p className="mt-6 leading-7">Our estates offers premium world-class features typical of new modern settlements. We give real estate beyond the REGULAR…</p>
            <ul className="mt-10 space-y-3">
              {about.featureList.map((f, i) => {
                const I = featureIcons[i];
                return (
                  <li key={f} className="flex items-center gap-4 font-heading text-[20px] font-bold">
                    <I className="h-5 w-5" aria-hidden /> {f}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <WhyChoose />
      <div className="h-5 bg-tp-light" />
    </>
  );
}
