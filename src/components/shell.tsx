import Link from "next/link";
import type { ReactNode } from "react";
import { NavLinks, type NavItem } from "./nav";
import { Toaster } from "./form";
import { logoutAction } from "@/app/auth-actions";

export function AppShell({
  title,
  items,
  userName,
  children,
}: {
  title: string;
  items: NavItem[];
  userName: string;
  children: ReactNode;
}) {
  return (
    <div className="lg:flex">
      <aside className="bg-brand-900 lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col">
        <div className="flex items-center justify-between px-6 py-4 lg:block lg:py-6">
          <Link href={items[0].href} className="block">
            <div className="text-lg font-bold text-white">TrustPoint</div>
            <div className="text-xs font-medium tracking-wide text-accent-400 uppercase">{title}</div>
          </Link>
          <form action={logoutAction} className="lg:hidden">
            <button className="text-sm text-brand-100 hover:text-white">Log out</button>
          </form>
        </div>
        <NavLinks items={items} />
        <div className="mt-auto hidden border-t border-white/10 px-6 py-4 lg:block">
          <div className="truncate text-sm font-medium text-white">{userName}</div>
          <form action={logoutAction}>
            <button className="mt-1 text-sm text-brand-100 hover:text-white">Log out</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:ml-60 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
