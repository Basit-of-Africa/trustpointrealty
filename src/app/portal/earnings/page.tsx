import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRealtor } from "@/lib/auth/session";
import { getBalance } from "@/lib/ledger";
import { formatNaira, formatRate } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";
import { CommissionKind } from "@/components/labels";

export const metadata = { title: "Earnings" };

const filters = ["all", "pending", "approved", "void"] as const;

export default async function EarningsPage({ searchParams }: PageProps<"/portal/earnings">) {
  const user = await requireRealtor();
  const { status } = await searchParams;
  const filter = filters.find((f) => f === status) ?? "all";
  const db = getDb();
  const [balance, rows] = await Promise.all([
    getBalance(user.id),
    db
      .select({ c: schema.commissions, estate: schema.estates.name, client: schema.clients.fullName, payment: schema.salePayments })
      .from(schema.commissions)
      .leftJoin(schema.sales, eq(schema.sales.id, schema.commissions.saleId))
      .leftJoin(schema.estates, eq(schema.estates.id, schema.sales.estateId))
      .leftJoin(schema.clients, eq(schema.clients.id, schema.sales.clientId))
      .leftJoin(schema.salePayments, eq(schema.salePayments.id, schema.commissions.paymentId))
      .where(
        and(
          eq(schema.commissions.realtorId, user.id),
          filter === "all" ? undefined : eq(schema.commissions.status, filter),
        ),
      )
      .orderBy(desc(schema.commissions.createdAt), desc(schema.commissions.id))
      .limit(500),
  ]);

  return (
    <>
      <PageHeader title="Earnings" description="Every commission, bonus and adjustment on your account." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat tone="brand" label="Available balance" value={formatNaira(balance.available)} />
        <Stat label="Pending approval" value={formatNaira(balance.pending)} />
        <Stat label="Total earned" value={formatNaira(balance.approved)} />
      </div>
      <div className="mt-6 mb-3 flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link key={f} href={f === "all" ? "/portal/earnings" : `/portal/earnings?status=${f}`}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${f === filter ? "bg-brand-900 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200"}`}>
            {f}
          </Link>
        ))}
      </div>
      <Card flush>
        {rows.length === 0 ? (
          <Empty>Nothing here yet.</Empty>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Type</th><th>Details</th><th>Status</th><th className="text-right">Amount</th></tr></thead>
            <tbody>
              {rows.map(({ c, estate, client, payment }) => (
                <tr key={c.id}>
                  <td className="whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td><CommissionKind kind={c.kind} /></td>
                  <td>
                    {client && <div>{client} · {estate}</div>}
                    {payment && c.rateBps != null && (
                      <div className="text-xs text-zinc-500">{formatRate(c.rateBps)} of {formatNaira(payment.amount)} paid on {formatDate(payment.paidOn)}</div>
                    )}
                    {c.note && <div className="text-xs text-zinc-500">{c.note}</div>}
                  </td>
                  <td><Badge>{c.status}</Badge></td>
                  <td className="text-right"><Money kobo={c.amount} className={c.status === "void" ? "line-through opacity-50" : ""} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
