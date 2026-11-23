"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { contact, images, nav, socials } from "@/content/site";
import { SocialIcon } from "./icons";

export function Socials({ className = "", iconClass = "h-5 w-5" }: { className?: string; iconClass?: string }) {
  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {(["facebook", "twitter", "instagram", "linkedin"] as const).map((name) => (
        <a key={name} href={socials[name] || "#"} aria-label={name} target={socials[name] ? "_blank" : undefined} rel="noreferrer" className="transition hover:opacity-70">
          <SocialIcon name={name} className={iconClass} />
        </a>
      ))}
    </div>
  );
}

/**
 * Top bar + main header. On the homepage the header is white; on inner
 * pages it sits transparently over the page banner, as on the live site.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const transparent = pathname !== "/";
  // The menu is open only on the page where it was opened, so it closes on navigation.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <div className={`border-b border-zinc-300/70 text-[13px] text-tp-body ${transparent ? "bg-tp-light" : "bg-white"}`}>
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-[22px]">
          <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 lg:flex">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{contact.topBarAddress}</span>
            <span aria-hidden>|</span>
            <a href={contact.callHref} className="flex items-center gap-1.5 hover:text-accent-700"><Phone className="h-3.5 w-3.5" />{contact.phones.join(" or ")}</a>
            <span aria-hidden>|</span>
            <a href={`mailto:${contact.emails[0]}`} className="flex items-center gap-1.5 hover:text-accent-700"><Mail className="h-3.5 w-3.5" />{contact.emails[0]}</a>
          </div>
          <a href={contact.callHref} className="flex items-center gap-1.5 lg:hidden"><Phone className="h-3.5 w-3.5" />{contact.phones[0]}</a>
          <Socials className="text-brand-900" />
        </div>
      </div>

      <header className={`${transparent ? "absolute inset-x-0 z-30" : "relative z-30 bg-white shadow-sm"}`}>
        <div className="mx-auto flex h-[71px] max-w-[1240px] items-center justify-between px-5">
          <Link href="/" className="shrink-0 pl-5" aria-label="TrustPoint Realty home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images.logo} alt="TrustPoint Realty" width={152} height={48} className="h-12 w-auto" />
          </Link>
          <nav className="hidden items-center gap-[30px] lg:flex" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[15px] transition ${
                  isActive(item.href) ? "text-accent-500" : transparent ? "text-white hover:text-accent-500" : "text-brand-900 hover:text-accent-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <a href={contact.whatsappBooking} target="_blank" rel="noreferrer" className="hidden bg-accent-500 px-[45px] py-[12px] text-[15px] text-brand-900 transition hover:bg-accent-600 lg:inline-block">
            BOOK CALL
          </a>
          <button
            type="button"
            onClick={() => setOpenOn(open ? null : pathname)}
            className={`lg:hidden ${transparent ? "text-white" : "text-brand-900"}`}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-zinc-200 bg-white px-5 pb-5 shadow-lg lg:hidden" aria-label="Mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className={`block border-b border-zinc-100 py-3 text-[15px] ${isActive(item.href) ? "text-accent-500" : "text-brand-900"}`}>
                {item.label}
              </Link>
            ))}
            <a href={contact.whatsappBooking} target="_blank" rel="noreferrer" className="mt-4 block bg-accent-500 py-3 text-center text-[15px] text-brand-900">
              BOOK CALL
            </a>
          </nav>
        )}
      </header>
    </>
  );
}
