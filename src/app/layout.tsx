import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TrustPoint Realty Partners Portal", template: "%s · TrustPoint Partners" },
  description: "Realtor portal for TrustPoint Realty: clients, sales, commissions and payouts.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
