import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { activeEstates, realtorOptions, salesList } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { Badge, ButtonLink, Card, Empty, Money, PageHeader } from "@/components/ui";
import { ClientForm } from "../client-form";

export const metadata = { title: "Client" };

export default async function ClientDetail({ params }: PageProps<"/admin/clients/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [client] = await getDb().select().from(schema.clients).where(eq(schema.clients.id, id)).limit(1);
  if (!client) notFound();
  const [realtors, estates, sales] = await Promise.all([realtorOptions(), activeEstates(), salesList(eq(schema.sales.clientId, id))]);
  return (
    <>
      <PageHeader title={client.fullName} description={`Client #${client.id} · registered ${formatDate(client.createdAt)}`} actions={<ButtonLink href={`/admin/sales/new?clientId=${id}`}>Record sale</ButtonLink>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Details" className="lg:col-span-2"><ClientForm client={client} realtors={realtors} estates={estates} /></Card>
        <Card title="Purchases" flush>
          {sales.length === 0 ? <Empty>No purchases yet.</Empty> : (
            <ul className="divide-y divide-zinc-100">
              {sales.map((s) => (
                <li key={s.sale.id} className="px-4 py-3 text-sm">
                  <Link className="link" href={`/admin/sales/${s.sale.id}`}>#{s.sale.id} · {s.estate}</Link> <Badge>{s.sale.status}</Badge>
                  <div className="text-xs text-zinc-500"><Money kobo={s.paid} /> of <Money kobo={s.sale.totalPrice} /> paid</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
