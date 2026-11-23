import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { AppShell } from "@/components/shell";
import { requireAdmin } from "@/lib/auth/session";
import { fullName } from "@/lib/format";

export const metadata: Metadata = {
  title: { default: "TrustPoint Realty Partners Portal", template: "%s · TrustPoint Partners" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const db = getDb();
  const [[pendingRealtors], [pendingCommissions], [newEnquiries]] = await Promise.all([
    db.select({ n: count() }).from(schema.users).where(eq(schema.users.status, "pending")),
    db.select({ n: count() }).from(schema.commissions).where(eq(schema.commissions.status, "pending")),
    db.select({ n: count() }).from(schema.enquiries).where(eq(schema.enquiries.status, "new")),
  ]);
  const items = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/realtors", label: "Realtors", badge: pendingRealtors.n },
    { href: "/admin/clients", label: "Clients" },
    { href: "/admin/sales", label: "Sales" },
    { href: "/admin/commissions", label: "Commissions", badge: pendingCommissions.n },
    { href: "/admin/payouts", label: "Payouts" },
    { href: "/admin/enquiries", label: "Enquiries", badge: newEnquiries.n },
    { href: "/admin/estates", label: "Estates" },
    { href: "/admin/activity", label: "Activity log" },
  ];
  return (
    <AppShell title="Admin" items={items} userName={fullName(admin)}>
      {children}
    </AppShell>
  );
}
