import Link from "next/link";
import { notFound } from "next/navigation";
import { aliasedTable, desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { salesList } from "@/lib/queries";
import { formatNaira, formatRate } from "@/lib/money";
import { formatDate, todayLagos } from "@/lib/format";
import { saleStatuses } from "@/components/labels";
import { Badge, Card, Empty, Field, Money, PageHeader, Stat } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/form";
import { CommissionTable, ReasonAction } from "../../_components";
import { logPaymentAction, reversePaymentAction, setSaleStatusAction } from "../../actions";

export const metadata = { title: "Sale" };

export default async function SaleDetail({ params }: PageProps<"/admin/sales/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await salesList(eq(schema.sales.id, id), 1);
  if (!row) notFound();
  const { sale } = row;
  const db = getDb();
  const realtor = aliasedTable(schema.users, "realtor");
  const [payments, commissionRows, upline] = await Promise.all([
    db.select().from(schema.salePayments).where(eq(schema.salePayments.saleId, id)).orderBy(desc(schema.salePayments.paidOn), desc(schema.salePayments.id)),
    db.select({ c: schema.commissions, rf: realtor.firstName, rl: realtor.lastName })
      .from(schema.commissions).innerJoin(realtor, eq(realtor.id, schema.commissions.realtorId))
      .where(eq(schema.commissions.saleId, id)).orderBy(desc(schema.commissions.createdAt), desc(schema.commissions.id)),
    sale.uplineId ? db.select().from(schema.users).where(eq(schema.users.id, sale.uplineId)).limit(1).then((r) => r[0]) : null,
  ]);
  const outstanding = sale.totalPrice - row.paid;

  return (
    <>
      <PageHeader
        title={`Sale #${sale.id}: ${row.client}`}
        description={<>{row.estate} · {sale.plots} plot{sale.plots > 1 ? "s" : ""}{sale.plotNumbers ? ` (${sale.plotNumbers})` : ""} · {formatDate(sale.saleDate)} · <Badge>{sale.status}</Badge></>}
        actions={
          <ActionForm action={setSaleStatusAction} className="flex gap-2">
            <input type="hidden" name="saleId" value={sale.id} />
            <select className="input w-auto" name="status" defaultValue={sale.status}>
              {saleStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <SubmitButton variant="secondary">Update status</SubmitButton>
          </ActionForm>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total price" value={formatNaira(sale.totalPrice)} />
        <Stat tone="brand" label="Paid by client" value={formatNaira(row.paid)} />
        <Stat label="Outstanding" value={formatNaira(Math.max(0, outstanding))} />
        <Stat label="Commission rates" value={`${formatRate(sale.commissionRateBps)} + ${formatRate(sale.uplineRateBps)}`} hint={
          <>{row.realtorFirst ? <Link className="link" href={`/admin/realtors/${sale.realtorId}`}>{row.realtorFirst} {row.realtorLast}</Link> : "Direct sale"}{upline && <> · upline <Link className="link" href={`/admin/realtors/${upline.id}`}>{upline.firstName} {upline.lastName}</Link></>}</>
        } />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Client payments" flush className="lg:col-span-2">
          {payments.length === 0 ? <Empty>No payments logged yet.</Empty> : (
            <table className="data-table">
              <thead><tr><th>Date</th><th>Method / ref</th><th>Notes</th><th className="text-right">Amount</th><th /></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className={p.reversedAt ? "opacity-60" : ""}>
                    <td className="whitespace-nowrap">{formatDate(p.paidOn)}</td>
                    <td className="text-xs">{p.method ?? "—"}<div className="font-mono text-zinc-500">{p.reference}</div></td>
                    <td className="text-xs">{p.reversedAt ? <><Badge>reversed</Badge> {p.reversalReason}</> : p.notes}</td>
                    <td className="text-right"><Money kobo={p.amount} className={p.reversedAt ? "line-through" : "font-semibold"} /></td>
                    <td className="text-right">{!p.reversedAt && <ReasonAction label="Reverse" action={reversePaymentAction} hidden={{ paymentId: p.id }} placeholder="e.g. cheque bounced" confirm="Reverse this payment? Its commissions will be voided or clawed back." />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
        <Card title="Log a client payment">
          {sale.status === "cancelled" ? <p className="text-sm text-zinc-500">This sale is cancelled.</p> : (
            <ActionForm action={logPaymentAction} resetOnSuccess>
              <input type="hidden" name="saleId" value={sale.id} />
              <Field label="Amount (₦)" hint={outstanding > 0 ? `Outstanding: ${formatNaira(outstanding)}` : "Fully paid"}><input className="input" name="amount" inputMode="decimal" required /></Field>
              <Field label="Date paid"><input className="input" name="paidOn" type="date" defaultValue={todayLagos()} required /></Field>
              <Field label="Method"><input className="input" name="method" placeholder="Transfer, POS, cash…" /></Field>
              <Field label="Reference"><input className="input" name="reference" /></Field>
              <Field label="Notes"><input className="input" name="notes" /></Field>
              <label className="flex items-center gap-2 text-xs text-zinc-600"><input type="checkbox" name="allowOverpay" /> Allow overpayment</label>
              <SubmitButton>Log payment</SubmitButton>
            </ActionForm>
          )}
        </Card>
      </div>

      <Card title="Commissions from this sale" flush className="mt-6">
        <CommissionTable showRealtor rows={commissionRows.map(({ c, rf, rl }) => ({ c, realtorId: c.realtorId, realtorName: `${rf} ${rl}` }))} />
      </Card>
      {sale.notes && <Card title="Notes" className="mt-6"><p className="text-sm whitespace-pre-wrap">{sale.notes}</p></Card>}
    </>
  );
}
