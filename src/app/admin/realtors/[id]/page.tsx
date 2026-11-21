import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { getBalance } from "@/lib/ledger";
import { salesList } from "@/lib/queries";
import { formatNaira } from "@/lib/money";
import { formatDate, formatDateTime, fullName } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { Badge, Card, Empty, Field, Money, PageHeader, Stat } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/form";
import { CommissionTable, LogPayoutForm, PayoutTable } from "../../_components";
import { addAdjustmentAction, resetLinkAction, setRealtorStatusAction, updateRealtorAction } from "../../actions";

export const metadata = { title: "Realtor" };

export default async function RealtorDetail({ params }: PageProps<"/admin/realtors/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const db = getDb();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!user || user.role !== "realtor") notFound();

  const [balance, commissionRows, payoutRows, clientRows, saleRows, team, uplineOptions] = await Promise.all([
    getBalance(id),
    db.select({ c: schema.commissions, client: schema.clients.fullName, estate: schema.estates.name })
      .from(schema.commissions)
      .leftJoin(schema.sales, eq(schema.sales.id, schema.commissions.saleId))
      .leftJoin(schema.clients, eq(schema.clients.id, schema.sales.clientId))
      .leftJoin(schema.estates, eq(schema.estates.id, schema.sales.estateId))
      .where(eq(schema.commissions.realtorId, id))
      .orderBy(desc(schema.commissions.createdAt), desc(schema.commissions.id)).limit(200),
    db.select().from(schema.payouts).where(eq(schema.payouts.realtorId, id)).orderBy(desc(schema.payouts.paidOn), desc(schema.payouts.id)),
    db.select().from(schema.clients).where(eq(schema.clients.realtorId, id)).orderBy(desc(schema.clients.createdAt)).limit(200),
    salesList(eq(schema.sales.realtorId, id), 200),
    db.select().from(schema.users).where(eq(schema.users.uplineId, id)).orderBy(desc(schema.users.createdAt)),
    db.select({ id: schema.users.id, firstName: schema.users.firstName, lastName: schema.users.lastName })
      .from(schema.users).where(and(eq(schema.users.role, "realtor"), ne(schema.users.id, id))).orderBy(schema.users.firstName),
  ]);

  const statusButtons = {
    pending: [["active", "Approve"], ["rejected", "Reject"]],
    active: [["suspended", "Suspend"]],
    suspended: [["active", "Reactivate"]],
    rejected: [["active", "Approve"]],
  }[user.status] as [string, string][];

  return (
    <>
      <PageHeader
        title={fullName(user)}
        description={<>
          <Badge>{user.status}</Badge> <span className="ml-1">Code <span className="font-mono font-semibold">{user.referralCode}</span> · joined {formatDate(user.createdAt)} · last login {formatDateTime(user.lastLoginAt)}</span>
        </>}
        actions={statusButtons.map(([status, label]) => (
          <ActionForm key={status} action={setRealtorStatusAction} className="" confirm={`${label} ${fullName(user)}?`}>
            <input type="hidden" name="userId" value={user.id} />
            <input type="hidden" name="status" value={status} />
            <SubmitButton variant={status === "active" ? "primary" : "danger"}>{label}</SubmitButton>
          </ActionForm>
        ))}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat tone="brand" label="Available balance" value={formatNaira(balance.available)} />
        <Stat label="Pending approval" value={formatNaira(balance.pending)} hint={balance.pending ? <Link className="link" href={`/admin/commissions?realtor=${id}`}>Review</Link> : undefined} />
        <Stat label="Total earned" value={formatNaira(balance.approved)} />
        <Stat label="Total paid out" value={formatNaira(balance.paidOut)} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Details" className="lg:col-span-2">
          <ActionForm action={updateRealtorAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="userId" value={user.id} />
            <Field label="First name"><input className="input" name="firstName" defaultValue={user.firstName} required /></Field>
            <Field label="Last name"><input className="input" name="lastName" defaultValue={user.lastName} required /></Field>
            <Field label="Email"><input className="input" value={user.email} disabled /></Field>
            <Field label="Phone"><input className="input" name="phone" defaultValue={formatPhone(user.phone)} required /></Field>
            <Field label="Address" className="sm:col-span-2"><input className="input" name="address" defaultValue={user.address ?? ""} /></Field>
            <Field label="Bank"><input className="input" name="bankName" defaultValue={user.bankName ?? ""} /></Field>
            <Field label="Account number"><input className="input" name="accountNumber" defaultValue={user.accountNumber ?? ""} maxLength={10} /></Field>
            <Field label="Account name" className="sm:col-span-2"><input className="input" name="accountName" defaultValue={user.accountName ?? ""} /></Field>
            <Field label="Upline (recruited by)" className="sm:col-span-2" hint="Changing this only affects sales recorded from now on.">
              <select className="input" name="uplineId" defaultValue={user.uplineId ?? ""}>
                <option value="">None</option>
                {uplineOptions.map((o) => <option key={o.id} value={o.id}>{o.firstName} {o.lastName}</option>)}
              </select>
            </Field>
            <Field label="Internal notes (not shown to realtor)" className="sm:col-span-2">
              <textarea className="input" name="adminNotes" rows={2} defaultValue={user.adminNotes ?? ""} />
            </Field>
            <div className="sm:col-span-2"><SubmitButton>Save details</SubmitButton></div>
          </ActionForm>
        </Card>
        <div className="space-y-6">
          <Card title="Log a payout">
            <LogPayoutForm fixedRealtor={user} />
          </Card>
          <Card title="Adjustment">
            <ActionForm action={addAdjustmentAction} resetOnSuccess className="space-y-3">
              <input type="hidden" name="realtorId" value={user.id} />
              <Field label="Amount (₦)" hint="Use a minus sign for a deduction, e.g. -5000. Opening balances from the old site go here too.">
                <input className="input" name="amount" required />
              </Field>
              <Field label="Note (visible to realtor)"><input className="input" name="note" required /></Field>
              <SubmitButton variant="secondary">Add adjustment</SubmitButton>
            </ActionForm>
          </Card>
          <Card title="Password">
            <p className="mb-3 text-sm text-zinc-600">Generate a one-time reset link to send the realtor on WhatsApp.</p>
            <ActionForm action={resetLinkAction} inlineSuccess>
              <input type="hidden" name="userId" value={user.id} />
              <SubmitButton variant="secondary">Create reset link</SubmitButton>
            </ActionForm>
          </Card>
        </div>
      </div>

      <Card title="Commission ledger" flush className="mt-6"><CommissionTable rows={commissionRows} /></Card>
      <Card title="Payouts" flush className="mt-6"><PayoutTable rows={payoutRows.map((p) => ({ p }))} /></Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={`Clients (${clientRows.length})`} flush>
          {clientRows.length === 0 ? <Empty>No clients.</Empty> : (
            <table className="data-table"><tbody>
              {clientRows.map((c) => (
                <tr key={c.id}>
                  <td><Link className="link" href={`/admin/clients/${c.id}`}>{c.fullName}</Link><div className="text-xs text-zinc-500">{formatPhone(c.phone)}</div></td>
                  <td><Badge>{c.status}</Badge></td>
                  <td className="text-right text-xs text-zinc-500">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </Card>
        <Card title={`Sales (${saleRows.length})`} flush>
          {saleRows.length === 0 ? <Empty>No sales.</Empty> : (
            <table className="data-table"><tbody>
              {saleRows.map((r) => (
                <tr key={r.sale.id}>
                  <td><Link className="link" href={`/admin/sales/${r.sale.id}`}>#{r.sale.id} {r.client}</Link><div className="text-xs text-zinc-500">{r.estate} · {formatDate(r.sale.saleDate)}</div></td>
                  <td className="text-right"><Money kobo={r.sale.totalPrice} /><div className="text-xs text-zinc-500">paid <Money kobo={r.paid} /></div></td>
                  <td><Badge>{r.sale.status}</Badge></td>
                </tr>
              ))}
            </tbody></table>
          )}
        </Card>
      </div>

      <Card title={`Team (${team.length})`} flush className="mt-6">
        {team.length === 0 ? <Empty>No downline realtors.</Empty> : (
          <table className="data-table"><tbody>
            {team.map((m) => (
              <tr key={m.id}>
                <td><Link className="link" href={`/admin/realtors/${m.id}`}>{fullName(m)}</Link></td>
                <td><Badge>{m.status}</Badge></td>
                <td className="text-right text-xs text-zinc-500">{formatDate(m.createdAt)}</td>
              </tr>
            ))}
          </tbody></table>
        )}
      </Card>
    </>
  );
}
