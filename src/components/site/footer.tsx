import Link from "next/link";
import { contact, images, nav } from "@/content/site";
import { Socials } from "./header";

export function SiteFooter() {
  return (
    <footer className="bg-brand-900 text-[15px] text-white">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-[100px] sm:grid-cols-2 lg:grid-cols-4 lg:gap-[50px]">
        <div>
          <h2 className="text-xl font-bold">TrustPoint Realty: Building Together with Trust</h2>
          <p className="mt-12 leading-7">
            We redefine real estate excellence, let us assist you at every stage of your real estate journey, ensuring a smooth and rewarding experience.
          </p>
          <p className="mt-10 leading-7">{contact.hours[0]}<br />{contact.hours[1]}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">Our Services</h2>
          <ul className="mt-12 space-y-0.5 leading-7 lg:mt-24">
            {nav.map((item) => (
              <li key={item.href}><Link href={item.href} className="hover:text-accent-500">{item.label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold">Office &amp; Contact Address</h2>
          <p className="mt-12 leading-7">{contact.officeAddress}</p>
          <ul className="mt-10 leading-7">
            {contact.phones.map((p) => <li key={p}><a href={`tel:${p}`} className="hover:text-accent-500">{p}</a></li>)}
            <li><a href={`mailto:${contact.emails[0]}`} className="hover:text-accent-500">{contact.emails[0]}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-bold">Our Reach</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images.worldMap} alt="Map of the world" loading="lazy" className="mt-12 w-full max-w-[262px] opacity-90" />
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-5 py-8">
          <p>Copyright © {new Date().getFullYear()} TrustPoint Realty</p>
          <Socials className="text-accent-500" />
        </div>
      </div>
    </footer>
  );
}
