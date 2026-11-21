import { aliasedTable, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { getBalances } from "@/lib/ledger";
import { pageFrom, PAGE_SIZE, realtorOptions } from "@/lib/queries";
import { Card, Money, PageHeader, Pager } from "@/components/ui";
import Link from "next/link";
import { LogPayoutForm, PayoutTable } from "../_components";

export const metadata = { title: "Payouts" };

export default async function AdminPayoutsPage({ searchParams }: PageProps<"/admin/payouts">) {
  await requireAdmin();
  const page = pageFrom((await searchParams).page);
  const realtor = aliasedTable(schema.users, "realtor");
  const [rows, options, balances] = await Promise.all([
    getDb().select({ p: schema.payouts, rf: realtor.firstName, rl: realtor.lastName })
      .from(schema.payouts).innerJoin(realtor, eq(realtor.id, schema.payouts.realtorId))
      .orderBy(desc(schema.payouts.paidOn), desc(schema.payouts.id))
      .limit(PAGE_SIZE + 1).offset((page - 1) * PAGE_SIZE),
    realtorOptions(),
    getBalances(),
  ]);
  const owed = options
    .map((o) => ({ ...o, available: balances.get(o.id)?.available ?? 0 }))
    .filter((o) => o.available > 0)
    .sort((a, b) => b.available - a.available);

  return (
    <>
      <PageHeader title="Payouts" description="Make the bank transfer first, then log it here with the bank reference. Nothing is sent from the portal." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Payout history" flush className="lg:col-span-2">
          <PayoutTable showRealtor rows={rows.slice(0, PAGE_SIZE).map(({ p, rf, rl }) => ({ p, realtorName: `${rf} ${rl}` }))} />
          <Pager page={page} hasMore={rows.length > PAGE_SIZE} basePath="/admin/payouts" />
        </Card>
        <div className="space-y-6">
          <Card title="Log a payout"><LogPayoutForm realtors={options} /></Card>
          <Card title="Realtors owed" flush>
            {owed.length === 0 ? <p className="p-4 text-sm text-zinc-500">No approved balances outstanding.</p> : (
              <ul className="divide-y divide-zinc-100">
                {owed.map((o) => (
                  <li key={o.id} className="flex justify-between px-4 py-2.5 text-sm">
                    <Link className="link" href={`/admin/realtors/${o.id}`}>{o.name}</Link>
                    <Money kobo={o.available} className="font-semibold" />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
