import Link from "next/link";
import { and, count, eq, gte, isNull, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { getBalances } from "@/lib/ledger";
import { formatNaira } from "@/lib/money";
import { todayLagos } from "@/lib/format";
import { Card, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Admin overview" };

export default async function AdminHome() {
  await requireAdmin();
  const db = getDb();
  const monthStart = `${todayLagos().slice(0, 7)}-01`;
  const [balances, [realtors], [pending], [pendingComm], [salesMonth], [paymentsMonth], [payoutsMonth]] = await Promise.all([
    getBalances(),
    db.select({ n: count() }).from(schema.users).where(and(eq(schema.users.role, "realtor"), eq(schema.users.status, "active"))),
    db.select({ n: count() }).from(schema.users).where(eq(schema.users.status, "pending")),
    db.select({ n: count(), total: sql<string>`coalesce(sum(${schema.commissions.amount}), 0)` }).from(schema.commissions).where(eq(schema.commissions.status, "pending")),
    db.select({ n: count(), total: sql<string>`coalesce(sum(${schema.sales.totalPrice}), 0)` }).from(schema.sales).where(and(gte(schema.sales.saleDate, monthStart), sql`${schema.sales.status} <> 'cancelled'`)),
    db.select({ total: sql<string>`coalesce(sum(${schema.salePayments.amount}), 0)` }).from(schema.salePayments).where(and(gte(schema.salePayments.paidOn, monthStart), isNull(schema.salePayments.reversedAt))),
    db.select({ total: sql<string>`coalesce(sum(${schema.payouts.amount}), 0)` }).from(schema.payouts).where(and(gte(schema.payouts.paidOn, monthStart), isNull(schema.payouts.voidedAt))),
  ]);
  const owed = [...balances.values()].reduce((s, b) => s + Math.max(0, b.available), 0);

  return (
    <>
      <PageHeader title="Overview" description="What needs attention, and this month's numbers." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat tone="brand" label="Owed to realtors" value={formatNaira(owed)} hint="Approved, not yet paid out" />
        <Stat tone="accent" label="Pending commissions" value={formatNaira(Number(pendingComm.total))} hint={`${pendingComm.n} entries to review`} />
        <Stat label="Active realtors" value={realtors.n} hint={pending.n ? `${pending.n} awaiting approval` : undefined} />
        <Stat label="Sales this month" value={salesMonth.n} hint={formatNaira(Number(salesMonth.total))} />
        <Stat label="Client payments this month" value={formatNaira(Number(paymentsMonth.total))} />
        <Stat label="Payouts this month" value={formatNaira(Number(payoutsMonth.total))} />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card title="To do">
          <ul className="space-y-2 text-sm">
            <li><Link className="link" href="/admin/realtors?status=pending">Review {pending.n} new realtor application(s)</Link></li>
            <li><Link className="link" href="/admin/commissions">Approve {pendingComm.n} pending commission(s)</Link></li>
            <li><Link className="link" href="/admin/payouts">Log a payout</Link></li>
          </ul>
        </Card>
        <Card title="Record a sale">
          <p className="text-sm text-zinc-600">Find the client (or add them), then record the sale and any deposit paid.</p>
          <Link href="/admin/sales/new" className="btn-primary mt-3">New sale</Link>
        </Card>
        <Card title="How commission works">
          <p className="text-sm text-zinc-600">
            Each client payment you log creates <b>pending</b> commission for the realtor (and their upline). Approve it to add it to their balance, then log the bank transfer as a payout.
          </p>
        </Card>
      </div>
    </>
  );
}
