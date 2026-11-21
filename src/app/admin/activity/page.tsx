import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireAdmin } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format";
import { pageFrom, PAGE_SIZE } from "@/lib/queries";
import { Card, Empty, PageHeader, Pager } from "@/components/ui";

export const metadata = { title: "Activity log" };

const entityLinks: Record<string, (id: string) => string> = {
  user: (id) => `/admin/realtors/${id}`,
  sale: (id) => `/admin/sales/${id}`,
  client: (id) => `/admin/clients/${id}`,
  estate: (id) => `/admin/estates/${id}`,
};

export default async function ActivityPage({ searchParams }: PageProps<"/admin/activity">) {
  await requireAdmin();
  const page = pageFrom((await searchParams).page);
  const rows = await getDb()
    .select({ a: schema.auditLog, first: schema.users.firstName, last: schema.users.lastName })
    .from(schema.auditLog)
    .leftJoin(schema.users, eq(schema.users.id, schema.auditLog.actorId))
    .orderBy(desc(schema.auditLog.createdAt), desc(schema.auditLog.id))
    .limit(PAGE_SIZE + 1)
    .offset((page - 1) * PAGE_SIZE);
  return (
    <>
      <PageHeader title="Activity log" description="Every change made in the portal, and who made it." />
      <Card flush>
        {rows.length === 0 ? <Empty>No activity yet.</Empty> : (
          <table className="data-table">
            <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead>
            <tbody>
              {rows.slice(0, PAGE_SIZE).map(({ a, first, last }) => {
                const href = a.entityId && entityLinks[a.entity]?.(a.entityId);
                return (
                  <tr key={a.id}>
                    <td className="whitespace-nowrap text-xs">{formatDateTime(a.createdAt)}</td>
                    <td>{first ? `${first} ${last}` : "—"}</td>
                    <td className="font-mono text-xs">{a.action}{href && <> · <a className="link" href={href}>{a.entity} {a.entityId?.slice(0, 8)}</a></>}</td>
                    <td className="max-w-md"><code className="block truncate text-xs text-zinc-500" title={JSON.stringify(a.details)}>{a.details ? JSON.stringify(a.details) : ""}</code></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pager page={page} hasMore={rows.length > PAGE_SIZE} basePath="/admin/activity" />
      </Card>
    </>
  );
}
