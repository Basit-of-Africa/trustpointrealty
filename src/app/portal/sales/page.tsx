import { eq, or } from "drizzle-orm";
import { schema } from "@/db";
import { requireRealtor } from "@/lib/auth/session";
import { salesList } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { Badge, Card, Empty, Money, PageHeader } from "@/components/ui";
import { Progress } from "@/components/labels";

export const metadata = { title: "Sales" };

export default async function SalesPage() {
  const user = await requireRealtor();
  const rows = await salesList(
    or(eq(schema.sales.realtorId, user.id), eq(schema.sales.uplineId, user.id)),
    500,
  );

  return (
    <>
      <PageHeader title="Sales" description="Plots bought by your clients, and by your team's clients. Commission is earned as each client payment is confirmed." />
      <Card flush>
        {rows.length === 0 ? (
          <Empty>No sales yet. When a client you registered buys, the office records the sale here.</Empty>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Client</th><th>Estate</th><th>Plots</th><th className="text-right">Price</th><th className="text-right">Paid</th><th>Progress</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const mine = r.sale.realtorId === user.id;
                return (
                  <tr key={r.sale.id}>
                    <td className="whitespace-nowrap">{formatDate(r.sale.saleDate)}</td>
                    <td>
                      <div className="font-medium">{r.client}</div>
                      {!mine && <div className="text-xs text-zinc-500">Team sale · {r.realtorFirst} {r.realtorLast}</div>}
                    </td>
                    <td>{r.estate}</td>
                    <td>{r.sale.plots}{r.sale.plotNumbers ? <span className="text-xs text-zinc-500"> ({r.sale.plotNumbers})</span> : null}</td>
                    <td className="text-right"><Money kobo={r.sale.totalPrice} /></td>
                    <td className="text-right"><Money kobo={r.paid} /></td>
                    <td><Progress value={r.paid} total={r.sale.totalPrice} /></td>
                    <td><Badge>{r.sale.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
