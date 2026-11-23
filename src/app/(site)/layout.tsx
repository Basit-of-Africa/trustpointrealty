import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-[15px] text-tp-body">
      <SiteHeader />
      <main className="relative">{children}</main>
      <SiteFooter />
    </div>
  );
}
