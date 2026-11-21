import Link from "next/link";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRealtor } from "@/lib/auth/session";
import { getBalance } from "@/lib/ledger";
import { formatNaira } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { appUrl } from "@/lib/email";
import { Badge, Card, Empty, Money, PageHeader, Stat } from "@/components/ui";
import { CopyButton } from "@/components/form";
import { CommissionKind } from "@/components/labels";

export const metadata = { title: "Dashboard" };

export default async function PortalDashboard() {
  const user = await requireRealtor();
  const db = getDb();
  const [balance, [clients], [sales], [team], recent, payouts] = await Promise.all([
    getBalance(user.id),
    db.select({ n: count() }).from(schema.clients).where(eq(schema.clients.realtorId, user.id)),
    db.select({ n: count() }).from(schema.sales).where(eq(schema.sales.realtorId, user.id)),
    db.select({ n: count() }).from(schema.users).where(eq(schema.users.uplineId, user.id)),
    db
      .select({ c: schema.commissions, estate: schema.estates.name, client: schema.clients.fullName })
      .from(schema.commissions)
      .leftJoin(schema.sales, eq(schema.sales.id, schema.commissions.saleId))
      .leftJoin(schema.estates, eq(schema.estates.id, schema.sales.estateId))
      .leftJoin(schema.clients, eq(schema.clients.id, schema.sales.clientId))
      .where(eq(schema.commissions.realtorId, user.id))
      .orderBy(desc(schema.commissions.createdAt))
      .limit(6),
    db
      .select()
      .from(schema.payouts)
      .where(and(eq(schema.payouts.realtorId, user.id), isNull(schema.payouts.voidedAt)))
      .orderBy(desc(schema.payouts.paidOn), desc(schema.payouts.id))
      .limit(4),
  ]);
  const link = appUrl(`/r/${user.referralCode}`);

  return (
    <>
      <PageHeader title={`Welcome, ${user.firstName}`} description="Your clients, earnings and payouts at a glance." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat tone="brand" label="Available balance" value={formatNaira(balance.available)} hint="Approved, not yet paid out" />
        <Stat label="Pending approval" value={formatNaira(balance.pending)} hint="Earned, awaiting review" />
        <Stat label="Total earned" value={formatNaira(balance.approved)} hint="All approved commissions" />
        <Stat label="Total paid out" value={formatNaira(balance.paidOut)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Your referral link" className="lg:col-span-2">
          <p className="text-sm text-zinc-600">
            Share this link to invite other realtors to your team. You earn an upline bonus on their sales where the estate offers one.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="w-full min-w-0 truncate rounded-lg bg-zinc-100 px-3 py-2 text-sm sm:w-auto sm:flex-1">{link}</code>
            <CopyButton text={link} label="Copy link" />
            <a
              className="btn-secondary btn-sm"
              target="_blank"
              rel="noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(`Join me as a TrustPoint Realty partner: ${link}`)}`}
            >
              Share on WhatsApp
            </a>
          </div>
          <p className="mt-2 text-xs text-zinc-500">Referral code: <span className="font-mono font-semibold">{user.referralCode}</span></p>
        </Card>
        <Card title="Your numbers">
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div><dt className="text-xs text-zinc-500">Clients</dt><dd className="text-2xl font-bold">{clients.n}</dd></div>
            <div><dt className="text-xs text-zinc-500">Sales</dt><dd className="text-2xl font-bold">{sales.n}</dd></div>
            <div><dt className="text-xs text-zinc-500">Team</dt><dd className="text-2xl font-bold">{team.n}</dd></div>
          </dl>
          <Link href="/portal/clients" className="btn-primary mt-4 w-full">Register a client</Link>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Recent earnings" flush className="lg:col-span-2" actions={<Link className="link text-sm" href="/portal/earnings">View all</Link>}>
          {recent.length === 0 ? (
            <Empty>No commissions yet. They appear here when your clients make payments.</Empty>
          ) : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>For</th><th className="hidden sm:table-cell">Status</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {recent.map(({ c, estate, client }) => (
                  <tr key={c.id}>
                    <td className="whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td><CommissionKind kind={c.kind} /> {client ? `· ${client}` : ""} {estate ? <span className="text-zinc-500">({estate})</span> : null}</td>
                    <td className="hidden sm:table-cell"><Badge>{c.status}</Badge></td>
                    <td className="text-right"><Money kobo={c.amount} className={c.status === "void" ? "line-through opacity-50" : ""} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Recent payouts" flush actions={<Link className="link text-sm" href="/portal/payouts">View all</Link>}>
          {payouts.length === 0 ? (
            <Empty>No payouts yet.</Empty>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{formatDate(p.paidOn)}</span>
                  <Money kobo={p.amount} className="font-semibold" />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
