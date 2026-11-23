import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell";
import { requireUser } from "@/lib/auth/session";
import { fullName } from "@/lib/format";

export const metadata: Metadata = {
  title: { default: "TrustPoint Realty Partners Portal", template: "%s · TrustPoint Partners" },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  const items =
    user.status === "active"
      ? [
          { href: "/portal", label: "Dashboard" },
          { href: "/portal/clients", label: "My clients" },
          { href: "/portal/sales", label: "Sales" },
          { href: "/portal/earnings", label: "Earnings" },
          { href: "/portal/payouts", label: "Payouts" },
          { href: "/portal/team", label: "My team" },
          { href: "/portal/profile", label: "Profile & bank" },
        ]
      : [{ href: "/portal/status", label: "Account status" }];
  return (
    <AppShell title="Realtor portal" items={items} userName={fullName(user)}>
      {children}
    </AppShell>
  );
}
