import Link from "next/link";
import { aliasedTable, and, desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { formatNaira, formatRate } from "@/lib/money";
import { formatDate } from "@/lib/format";
import { pageFrom, PAGE_SIZE } from "@/lib/queries";
import { Card, Empty, Money, PageHeader, Pager } from "@/components/ui";
import { ActionForm, SelectAll, SubmitButton } from "@/components/form";
import { CommissionKind } from "@/components/labels";
import { CommissionTable } from "../_components";
import { approveCommissionsAction } from "../actions";

export const metadata = { title: "Commissions" };

const tabs = ["pending", "approved", "void"] as const;

export default async function CommissionsPage({ searchParams }: PageProps<"/admin/commissions">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = tabs.find((t) => t === sp.status) ?? "pending";
  const realtorFilter = typeof sp.realtor === "string" && /^[0-9a-f-]{36}$/i.test(sp.realtor) ? sp.realtor : undefined;
  const page = pageFrom(sp.page);
  const { commissions, sales, clients, estates, users } = schema;
  const realtor = aliasedTable(users, "realtor");
  const db = getDb();
  const where = and(eq(commissions.status, status), realtorFilter ? eq(commissions.realtorId, realtorFilter) : undefined);
  const [rows, [totals]] = await Promise.all([
    db.select({ c: commissions, rf: realtor.firstName, rl: realtor.lastName, client: clients.fullName, estate: estates.name })
      .from(commissions)
      .innerJoin(realtor, eq(realtor.id, commissions.realtorId))
      .leftJoin(sales, eq(sales.id, commissions.saleId))
      .leftJoin(clients, eq(clients.id, sales.clientId))
      .leftJoin(estates, eq(estates.id, sales.estateId))
      .where(where)
      .orderBy(status === "pending" ? commissions.createdAt : desc(commissions.createdAt), commissions.id)
      .limit(PAGE_SIZE + 1)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ n: sql<number>`count(*)`.mapWith(Number), total: sql<string>`coalesce(sum(${commissions.amount}), 0)` }).from(commissions).where(where),
  ]);
  const list = rows.slice(0, PAGE_SIZE);

  return (
    <>
      <PageHeader title="Commissions" description="Commission is created as pending when a client payment is logged. Approve it once the payment has cleared." />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <Link key={t} href={`/admin/commissions?status=${t}${realtorFilter ? `&realtor=${realtorFilter}` : ""}`}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${status === t ? "bg-brand-900 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200"}`}>{t}</Link>
        ))}
        {realtorFilter && <Link className="link text-sm" href={`/admin/commissions?status=${status}`}>Clear realtor filter</Link>}
        <span className="ml-auto text-sm text-zinc-600">{totals.n} entries · {formatNaira(Number(totals.total))}</span>
      </div>
      <Card flush>
        {list.length === 0 ? <Empty>No {status} commissions.</Empty> : status === "pending" ? (
          <ActionForm action={approveCommissionsAction} className="">
            <table className="data-table">
              <thead><tr><th className="w-8"><SelectAll name="ids" /></th><th>Created</th><th>Realtor</th><th>Type</th><th>Sale</th><th className="text-right">Amount</th></tr></thead>
              <tbody>
                {list.map(({ c, rf, rl, client, estate }) => (
                  <tr key={c.id}>
                    <td><input type="checkbox" name="ids" value={c.id} aria-label={`Select commission ${c.id}`} /></td>
                    <td className="whitespace-nowrap">{formatDate(c.createdAt)}</td>
                    <td><Link className="link" href={`/admin/realtors/${c.realtorId}`}>{rf} {rl}</Link></td>
                    <td><CommissionKind kind={c.kind} />{c.rateBps != null && <span className="text-xs text-zinc-500"> · {formatRate(c.rateBps)}</span>}</td>
                    <td>{c.saleId ? <Link className="link" href={`/admin/sales/${c.saleId}`}>#{c.saleId}</Link> : "—"} {client} <span className="text-zinc-500">{estate}</span></td>
                    <td className="text-right"><Money kobo={c.amount} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-3 border-t border-zinc-100 px-4 py-3">
              <SubmitButton>Approve selected</SubmitButton>
              <span className="text-xs text-zinc-500">To void one, open its sale page.</span>
            </div>
          </ActionForm>
        ) : (
          <CommissionTable showRealtor rows={list.map(({ c, rf, rl, client, estate }) => ({ c, realtorId: c.realtorId, realtorName: `${rf} ${rl}`, client, estate }))} />
        )}
        <Pager page={page} hasMore={rows.length > PAGE_SIZE} basePath="/admin/commissions" params={{ status, realtor: realtorFilter }} />
      </Card>
    </>
  );
}
