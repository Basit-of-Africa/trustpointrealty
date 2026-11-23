import type { Metadata } from "next";
import { contact } from "@/content/site";
import { Container, GoldButton, PageHero } from "@/components/site/sections";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact Us" />
      <section className="py-[100px]">
        <Container>
          <h2 className="text-center text-4xl font-bold text-brand-900 lg:text-[44px]">Contact Details</h2>
          <div className="mt-[75px] grid gap-10 border-b border-zinc-300 pb-16 lg:grid-cols-[1fr_2fr]">
            <div className="lg:px-5">
              <h3 className="text-[26px] font-bold text-brand-900">Main Office</h3>
              <h4 className="mt-6 text-xl font-bold text-brand-900">Address:</h4>
              <p className="mt-2 text-xl leading-9">{contact.officeAddress}</p>
              <h4 className="mt-6 text-xl font-bold text-brand-900">Phone:</h4>
              <p className="mt-2 text-xl leading-9">
                {contact.phones.map((p) => <a key={p} href={`tel:${p}`} className="block hover:text-accent-700">{p}</a>)}
              </p>
              <h4 className="mt-6 text-xl font-bold text-brand-900">Email:</h4>
              <p className="mt-2 text-xl leading-9">
                {contact.emails.map((e) => <a key={e} href={`mailto:${e}`} className="block hover:text-accent-700">{e}</a>)}
              </p>
              <div className="mt-14"><GoldButton href={contact.whatsappContact} external>Contact us</GoldButton></div>
            </div>
            <iframe
              title="Map: TrustPoint Realty office at Gastab Filling Station, Sango-Eleyele Road, Ibadan"
              src={contact.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[400px] w-full border-0 bg-zinc-100 lg:h-[545px]"
            />
          </div>
        </Container>
      </section>
    </>
  );
}
