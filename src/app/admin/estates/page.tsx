import Link from "next/link";
import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { formatRate } from "@/lib/money";
import { Badge, ButtonLink, Card, Empty, Money, PageHeader } from "@/components/ui";

export const metadata = { title: "Estates" };

export default async function EstatesPage() {
  await requireAdmin();
  const { estates } = schema;
  const rows = await getDb()
    .select({
      e: estates,
      sold: sql<number>`(select coalesce(sum(s.plots), 0) from sales s where s.estate_id = "estates"."id" and s.status <> 'cancelled')`.mapWith(Number),
    })
    .from(estates)
    .orderBy(estates.name);
  return (
    <>
      <PageHeader title="Estates" description="Commission rates are set per estate and copied onto each sale when it's recorded." actions={<ButtonLink href="/admin/estates/new">Add estate</ButtonLink>} />
      <Card flush>
        {rows.length === 0 ? <Empty>No estates yet.</Empty> : (
          <table className="data-table">
            <thead><tr><th>Estate</th><th>Status</th><th className="text-right">Price / plot</th><th className="text-right">Commission</th><th className="text-right">Upline</th><th className="text-right">Plots sold</th></tr></thead>
            <tbody>
              {rows.map(({ e, sold }) => (
                <tr key={e.id}>
                  <td><Link className="link" href={`/admin/estates/${e.id}`}>{e.name}</Link><div className="text-xs text-zinc-500">{e.location}</div></td>
                  <td><Badge>{e.status}</Badge></td>
                  <td className="text-right">{e.pricePerPlot ? <Money kobo={e.pricePerPlot} /> : "—"}</td>
                  <td className="text-right">{formatRate(e.commissionRateBps)}</td>
                  <td className="text-right">{formatRate(e.uplineRateBps)}</td>
                  <td className="text-right tabular-nums">{sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
