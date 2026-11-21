import Link from "next/link";
import { aliasedTable, and, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { pageFrom, PAGE_SIZE } from "@/lib/queries";
import { Badge, ButtonLink, Card, Empty, PageHeader, Pager } from "@/components/ui";
import { clientStatuses } from "@/components/labels";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage({ searchParams }: PageProps<"/admin/clients">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = clientStatuses.find((s) => s === sp.status);
  const page = pageFrom(sp.page);
  const { clients, estates, users } = schema;
  const realtor = aliasedTable(users, "realtor");
  const phone = q ? normalizePhone(q) : null;
  const rows = await getDb()
    .select({ c: clients, estate: estates.name, rf: realtor.firstName, rl: realtor.lastName })
    .from(clients)
    .leftJoin(estates, eq(estates.id, clients.estateId))
    .leftJoin(realtor, eq(realtor.id, clients.realtorId))
    .where(and(
      status ? eq(clients.status, status) : undefined,
      sp.unassigned === "1" ? isNull(clients.realtorId) : undefined,
      q ? or(ilike(clients.fullName, `%${q}%`), ilike(clients.email, `%${q}%`), phone ? eq(clients.phone, phone) : undefined) : undefined,
    ))
    .orderBy(desc(clients.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  const hasMore = rows.length > PAGE_SIZE;

  return (
    <>
      <PageHeader title="Clients" description="Everyone registered by realtors or the office. Phone numbers are unique." actions={<ButtonLink href="/admin/clients/new">Add client</ButtonLink>} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" name="q" defaultValue={q} placeholder="Name, email or phone" />
        <select className="input w-auto" name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          {clientStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-secondary">Filter</button>
      </form>
      <Card flush>
        {rows.length === 0 ? <Empty>No clients found.</Empty> : (
          <table className="data-table">
            <thead><tr><th>Client</th><th>Realtor</th><th>Interested in</th><th>Status</th><th>Registered</th><th /></tr></thead>
            <tbody>
              {rows.slice(0, PAGE_SIZE).map(({ c, estate, rf, rl }) => (
                <tr key={c.id}>
                  <td><Link className="link" href={`/admin/clients/${c.id}`}>{c.fullName}</Link><div className="text-xs text-zinc-500">{formatPhone(c.phone)}</div></td>
                  <td>{rf ? <Link className="link" href={`/admin/realtors/${c.realtorId}`}>{rf} {rl}</Link> : <span className="text-zinc-400">Direct</span>}</td>
                  <td>{estate ?? "—"}</td>
                  <td><Badge>{c.status}</Badge></td>
                  <td className="whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="text-right"><Link className="link text-xs" href={`/admin/sales/new?clientId=${c.id}`}>Record sale</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager page={page} hasMore={hasMore} basePath="/admin/clients" params={{ q, status }} />
      </Card>
    </>
  );
}
