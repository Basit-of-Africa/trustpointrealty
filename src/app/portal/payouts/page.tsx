import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRealtor } from "@/lib/auth/session";
import { getBalance } from "@/lib/ledger";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";

export const metadata = { title: "Payouts" };

export default async function PayoutsPage() {
  const user = await requireRealtor();
  const [balance, rows] = await Promise.all([
    getBalance(user.id),
    getDb().select().from(schema.payouts).where(eq(schema.payouts.realtorId, user.id)).orderBy(desc(schema.payouts.paidOn), desc(schema.payouts.id)),
  ]);
  const hasBank = user.bankName && user.accountNumber && user.accountName;

  return (
    <>
      <PageHeader title="Payouts" description="Commission payments TrustPoint has sent to your bank account." />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat tone="brand" label="Available balance" value={formatNaira(balance.available)} hint="Will be paid by bank transfer" />
        <Stat label="Total paid out" value={formatNaira(balance.paidOut)} />
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
          <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase">Paid into</div>
          {hasBank ? (
            <div className="mt-1">
              <div className="font-semibold">{user.accountName}</div>
              <div className="text-zinc-600">{user.bankName} · {user.accountNumber}</div>
            </div>
          ) : (
            <p className="mt-1 text-amber-700">No bank details yet. <Link className="link" href="/portal/profile">Add them</Link> so you can be paid.</p>
          )}
        </div>
      </div>
      <Card flush className="mt-6">
        {rows.length === 0 ? (
          <Empty>No payouts yet.</Empty>
        ) : (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Sent to</th><th>Bank reference</th><th>Note</th><th className="text-right">Amount</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={p.voidedAt ? "opacity-60" : ""}>
                  <td className="whitespace-nowrap">{formatDate(p.paidOn)}</td>
                  <td>{p.bankName ? `${p.bankName} · ${p.accountNumber}` : "—"}</td>
                  <td className="font-mono text-xs">{p.reference ?? "—"}</td>
                  <td>{p.voidedAt ? <><Badge>voided</Badge> <span className="text-xs text-zinc-500">{p.voidReason}</span></> : p.note}</td>
                  <td className="text-right"><Money kobo={p.amount} className={p.voidedAt ? "line-through" : "font-semibold"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
