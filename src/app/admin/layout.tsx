import { count, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { AppShell } from "@/components/shell";
import { requireAdmin } from "@/lib/auth/session";
import { fullName } from "@/lib/format";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const db = getDb();
  const [[pendingRealtors], [pendingCommissions]] = await Promise.all([
    db.select({ n: count() }).from(schema.users).where(eq(schema.users.status, "pending")),
    db.select({ n: count() }).from(schema.commissions).where(eq(schema.commissions.status, "pending")),
  ]);
  const items = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/realtors", label: "Realtors", badge: pendingRealtors.n },
    { href: "/admin/clients", label: "Clients" },
    { href: "/admin/sales", label: "Sales" },
    { href: "/admin/commissions", label: "Commissions", badge: pendingCommissions.n },
    { href: "/admin/payouts", label: "Payouts" },
    { href: "/admin/estates", label: "Estates" },
    { href: "/admin/activity", label: "Activity log" },
  ];
  return (
    <AppShell title="Admin" items={items} userName={fullName(admin)}>
      {children}
    </AppShell>
  );
}
