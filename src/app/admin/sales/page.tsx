import Link from "next/link";
import { eq } from "drizzle-orm";
import { schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { pageFrom, PAGE_SIZE, salesList } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { saleStatuses } from "@/components/labels";
import { Badge, ButtonLink, Card, Empty, Money, PageHeader, Pager } from "@/components/ui";
import { Progress } from "@/components/labels";

export const metadata = { title: "Sales" };

export default async function AdminSalesPage({ searchParams }: PageProps<"/admin/sales">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = saleStatuses.find((s) => s === sp.status);
  const page = pageFrom(sp.page);
  const rows = await salesList(status ? eq(schema.sales.status, status) : undefined, PAGE_SIZE + 1, (page - 1) * PAGE_SIZE);
  return (
    <>
      <PageHeader title="Sales" actions={<ButtonLink href="/admin/sales/new">New sale</ButtonLink>} />
      <div className="mb-3 flex flex-wrap gap-2">
        {["all", ...saleStatuses].map((s) => (
          <Link key={s} href={s === "all" ? "/admin/sales" : `/admin/sales?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${(status ?? "all") === s ? "bg-brand-900 text-white" : "bg-white text-zinc-700 ring-1 ring-zinc-200"}`}>{s}</Link>
        ))}
      </div>
      <Card flush>
        {rows.length === 0 ? <Empty>No sales.</Empty> : (
          <table className="data-table">
            <thead><tr><th>#</th><th>Date</th><th>Client</th><th>Estate</th><th>Realtor</th><th className="text-right">Price</th><th className="text-right">Paid</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>
              {rows.slice(0, PAGE_SIZE).map((r) => (
                <tr key={r.sale.id}>
                  <td><Link className="link" href={`/admin/sales/${r.sale.id}`}>#{r.sale.id}</Link></td>
                  <td className="whitespace-nowrap">{formatDate(r.sale.saleDate)}</td>
                  <td>{r.client}</td>
                  <td>{r.estate} <span className="text-xs text-zinc-500">× {r.sale.plots}</span></td>
                  <td>{r.realtorFirst ? `${r.realtorFirst} ${r.realtorLast}` : <span className="text-zinc-400">Direct</span>}</td>
                  <td className="text-right"><Money kobo={r.sale.totalPrice} /></td>
                  <td className="text-right"><Money kobo={r.paid} /></td>
                  <td><Progress value={r.paid} total={r.sale.totalPrice} /></td>
                  <td><Badge>{r.sale.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager page={page} hasMore={rows.length > PAGE_SIZE} basePath="/admin/sales" params={{ status }} />
      </Card>
    </>
  );
}
