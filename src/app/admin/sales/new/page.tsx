import Link from "next/link";
import { aliasedTable, eq, ilike, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { activeEstates } from "@/lib/queries";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { formatRate, koboToInput } from "@/lib/money";
import { todayLagos } from "@/lib/format";
import { Card, Empty, Field, PageHeader } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/form";
import { createSaleAction } from "../../actions";

export const metadata = { title: "New sale" };

export default async function NewSalePage({ searchParams }: PageProps<"/admin/sales/new">) {
  await requireAdmin();
  const sp = await searchParams;
  const clientId = Number(sp.clientId);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const db = getDb();
  const { clients, users } = schema;
  const realtor = aliasedTable(users, "realtor");

  const [client] = Number.isInteger(clientId) && clientId > 0
    ? await db.select({ c: clients, rf: realtor.firstName, rl: realtor.lastName, uplineId: realtor.uplineId })
        .from(clients).leftJoin(realtor, eq(realtor.id, clients.realtorId)).where(eq(clients.id, clientId)).limit(1)
    : [];

  if (!client) {
    const phone = q ? normalizePhone(q) : null;
    const matches = q
      ? await db.select({ c: clients, rf: realtor.firstName, rl: realtor.lastName })
          .from(clients).leftJoin(realtor, eq(realtor.id, clients.realtorId))
          .where(or(ilike(clients.fullName, `%${q}%`), phone ? eq(clients.phone, phone) : undefined)).limit(20)
      : [];
    return (
      <>
        <PageHeader title="New sale" description="Step 1: find the client who is buying." />
        <Card>
          <form className="flex flex-wrap gap-2">
            <input className="input max-w-sm" name="q" defaultValue={q} placeholder="Client name or phone" autoFocus />
            <button className="btn-primary">Search</button>
            <Link className="btn-secondary" href="/admin/clients/new">Add new client</Link>
          </form>
          {q && (matches.length === 0 ? <Empty>No client matches “{q}”.</Empty> : (
            <ul className="mt-4 divide-y divide-zinc-100 rounded-lg border border-zinc-200">
              {matches.map(({ c, rf, rl }) => (
                <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div><div className="font-medium">{c.fullName}</div><div className="text-xs text-zinc-500">{formatPhone(c.phone)} · {rf ? `Realtor: ${rf} ${rl}` : "No realtor"}</div></div>
                  <Link className="btn-secondary btn-sm" href={`/admin/sales/new?clientId=${c.id}`}>Select</Link>
                </li>
              ))}
            </ul>
          ))}
        </Card>
      </>
    );
  }

  const estates = await activeEstates();
  const estateDetails = await db.select().from(schema.estates);
  return (
    <>
      <PageHeader title="New sale" description={<>Step 2: sale details for <b>{client.c.fullName}</b>. <Link className="link" href="/admin/sales/new">Change client</Link></>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <ActionForm action={createSaleAction} className="grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="clientId" value={client.c.id} />
            <Field label="Estate" className="sm:col-span-2">
              <select className="input" name="estateId" required defaultValue={client.c.estateId ?? ""}>
                <option value="" disabled>Choose estate…</option>
                {estates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </Field>
            <Field label="Number of plots"><input className="input" name="plots" type="number" min={1} defaultValue={1} required /></Field>
            <Field label="Plot numbers (optional)"><input className="input" name="plotNumbers" placeholder="e.g. B12, B13" /></Field>
            <Field label="Total price (₦)"><input className="input" name="totalPrice" inputMode="decimal" required /></Field>
            <Field label="Sale date"><input className="input" name="saleDate" type="date" defaultValue={todayLagos()} required /></Field>
            <Field label="Commission override (%)" hint="Leave blank to use the estate's rate."><input className="input" name="commissionRate" inputMode="decimal" /></Field>
            <Field label="Upline override (%)" hint="Leave blank to use the estate's rate."><input className="input" name="uplineRate" inputMode="decimal" /></Field>
            <div className="border-t border-zinc-100 pt-4 sm:col-span-2"><h3 className="text-sm font-semibold">Deposit received now (optional)</h3></div>
            <Field label="Amount paid (₦)"><input className="input" name="deposit" inputMode="decimal" /></Field>
            <Field label="Method"><input className="input" name="method" placeholder="Transfer, POS, cash…" /></Field>
            <Field label="Payment reference" className="sm:col-span-2"><input className="input" name="reference" /></Field>
            <Field label="Notes" className="sm:col-span-2"><textarea className="input" name="notes" rows={2} placeholder="Payment plan, special terms…" /></Field>
            <div className="sm:col-span-2"><SubmitButton>Record sale</SubmitButton></div>
          </ActionForm>
        </Card>
        <Card title="Commission on this sale">
          <p className="text-sm">
            Realtor: <b>{client.rf ? `${client.rf} ${client.rl}` : "none (direct sale, no commission)"}</b>
            {client.rf && !client.uplineId && <span className="block text-xs text-zinc-500">No upline, so no team bonus.</span>}
          </p>
          <table className="data-table mt-3">
            <thead><tr><th>Estate</th><th className="text-right">Price</th><th className="text-right">Rate</th><th className="text-right">Upline</th></tr></thead>
            <tbody>
              {estateDetails.filter((e) => e.status !== "archived").map((e) => (
                <tr key={e.id}><td>{e.name}</td><td className="text-right text-xs">{e.pricePerPlot ? `₦${Number(koboToInput(e.pricePerPlot)).toLocaleString("en-NG")}` : "—"}</td><td className="text-right">{formatRate(e.commissionRateBps)}</td><td className="text-right">{formatRate(e.uplineRateBps)}</td></tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
