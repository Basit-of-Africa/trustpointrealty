import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRealtor } from "@/lib/auth/session";
import { activeEstates } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { Badge, Card, Empty, Field, PageHeader } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/form";
import { registerClientAction } from "../actions";

export const metadata = { title: "My clients" };

export default async function ClientsPage() {
  const user = await requireRealtor();
  const db = getDb();
  const [estates, rows] = await Promise.all([
    activeEstates(),
    db
      .select({ client: schema.clients, estate: schema.estates.name })
      .from(schema.clients)
      .leftJoin(schema.estates, eq(schema.estates.id, schema.clients.estateId))
      .where(eq(schema.clients.realtorId, user.id))
      .orderBy(desc(schema.clients.createdAt)),
  ]);

  return (
    <>
      <PageHeader
        title="My clients"
        description="Register a prospect before their site inspection. Once registered, a client's phone number is locked to you, so no one else can claim them."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Register a client" className="lg:order-2">
          <ActionForm action={registerClientAction} resetOnSuccess>
            <Field label="Full name">
              <input className="input" name="fullName" required />
            </Field>
            <Field label="Phone number">
              <input className="input" name="phone" type="tel" placeholder="0803 123 4567" required />
            </Field>
            <Field label="Email (optional)">
              <input className="input" name="email" type="email" />
            </Field>
            <Field label="Interested in">
              <select className="input" name="estateId" defaultValue="">
                <option value="">Not sure yet</option>
                {estates.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Notes (optional)">
              <textarea className="input" name="notes" rows={2} placeholder="e.g. Wants 2 plots, inspection on Saturday" />
            </Field>
            <SubmitButton className="w-full">Register client</SubmitButton>
          </ActionForm>
        </Card>
        <Card title={`Registered clients (${rows.length})`} flush className="lg:order-1 lg:col-span-2">
          {rows.length === 0 ? (
            <Empty>You haven&apos;t registered any clients yet.</Empty>
          ) : (
            <table className="data-table">
              <thead><tr><th>Client</th><th>Interested in</th><th>Status</th><th>Registered</th></tr></thead>
              <tbody>
                {rows.map(({ client, estate }) => (
                  <tr key={client.id}>
                    <td>
                      <div className="font-medium">{client.fullName}</div>
                      <div className="text-xs text-zinc-500">{formatPhone(client.phone)}</div>
                    </td>
                    <td>{estate ?? <span className="text-zinc-400">—</span>}</td>
                    <td><Badge>{client.status}</Badge></td>
                    <td className="whitespace-nowrap">{formatDate(client.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
