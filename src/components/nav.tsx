"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; badge?: number };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
      {items.map((item) => {
        const root = items[0].href;
        const active =
          item.href === root ? pathname === root : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-accent-500 text-brand-900" : "text-brand-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
            {item.badge ? (
              <span className={`rounded-full px-1.5 text-xs font-bold ${active ? "bg-brand-900 text-accent-500" : "bg-accent-500 text-brand-900"}`}>
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
