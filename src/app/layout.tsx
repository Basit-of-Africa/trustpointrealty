import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

// The same typefaces as trustpointrealty.ng
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "TrustPoint Realty Partners Portal", template: "%s · TrustPoint Partners" },
  description: "Realtor portal for TrustPoint Realty: clients, sales, commissions and payouts.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
