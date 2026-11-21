import Link from "next/link";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { getBalances } from "@/lib/ledger";
import { formatDate, fullName } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { pageFrom, PAGE_SIZE } from "@/lib/queries";
import { Badge, Card, Empty, Money, PageHeader, Pager } from "@/components/ui";
import { userStatuses } from "@/components/labels";

export const metadata = { title: "Realtors" };

export default async function RealtorsPage({ searchParams }: PageProps<"/admin/realtors">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = userStatuses.find((s) => s === sp.status);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = pageFrom(sp.page);
  const { users } = schema;
  const rows = await getDb()
    .select({
      u: users,
      uplineName: sql<string | null>`(select up.first_name || ' ' || up.last_name from users up where up.id = "users"."upline_id")`,
    })
    .from(users)
    .where(
      and(
        eq(users.role, "realtor"),
        status ? eq(users.status, status) : undefined,
        q ? or(ilike(sql`${users.firstName} || ' ' || ${users.lastName}`, `%${q}%`), ilike(users.email, `%${q}%`), ilike(users.phone, `%${q.replace(/^0/, "")}%`), ilike(users.referralCode, `%${q}%`)) : undefined,
      ),
    )
    .orderBy(sql`${users.status} = 'pending' desc`, desc(users.createdAt))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  const hasMore = rows.length > PAGE_SIZE;
  const list = rows.slice(0, PAGE_SIZE);
  const balances = await getBalances(list.map((r) => r.u.id));

  return (
    <>
      <PageHeader title="Realtors" description="Approve applications, manage details and see balances." />
      <form className="mb-4 flex flex-wrap gap-2">
        <input className="input max-w-xs" name="q" defaultValue={q} placeholder="Search name, email, phone, code" />
        <select className="input w-auto" name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          {userStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-secondary">Filter</button>
      </form>
      <Card flush>
        {list.length === 0 ? <Empty>No realtors found.</Empty> : (
          <table className="data-table">
            <thead><tr><th>Realtor</th><th>Code</th><th>Upline</th><th>Status</th><th>Joined</th><th className="text-right">Pending</th><th className="text-right">Available</th></tr></thead>
            <tbody>
              {list.map(({ u, uplineName }) => {
                const b = balances.get(u.id)!;
                return (
                  <tr key={u.id}>
                    <td>
                      <Link className="link" href={`/admin/realtors/${u.id}`}>{fullName(u)}</Link>
                      <div className="text-xs text-zinc-500">{u.email} · {formatPhone(u.phone)}</div>
                    </td>
                    <td className="font-mono text-xs">{u.referralCode}</td>
                    <td>{uplineName ? uplineName : <span className="text-zinc-400">—</span>}</td>
                    <td><Badge>{u.status}</Badge></td>
                    <td className="whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="text-right"><Money kobo={b.pending} /></td>
                    <td className="text-right font-semibold"><Money kobo={b.available} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pager page={page} hasMore={hasMore} basePath="/admin/realtors" params={{ q, status }} />
      </Card>
    </>
  );
}
