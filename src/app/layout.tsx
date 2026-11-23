import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

// The same typefaces as trustpointrealty.ng
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-open-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "https://trustpointrealty.ng"),
  title: {
    default: "TrustPoint Realty – Your Topmost Trustworthy Real Estate agency…",
    template: "%s – TrustPoint Realty",
  },
  description:
    "TrustPoint Realty: estate development, consultation and real estate investment in Ibadan, Nigeria. Coconutview, Avocado Crest, Palm Oasis and Maple Nexus estates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
