import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireRealtor } from "@/lib/auth/session";
import { appUrl } from "@/lib/email";
import { formatDate, fullName } from "@/lib/format";
import { Badge, Card, Empty, Money, PageHeader } from "@/components/ui";
import { CopyButton } from "@/components/form";

export const metadata = { title: "My team" };

export default async function TeamPage() {
  const user = await requireRealtor();
  const { users } = schema;
  const rows = await getDb()
    .select({
      member: users,
      salesCount: sql<number>`(select count(*) from sales s where s.realtor_id = "users"."id" and s.status <> 'cancelled')`.mapWith(Number),
      salesValue: sql<number>`(select coalesce(sum(s.total_price), 0) from sales s where s.realtor_id = "users"."id" and s.status <> 'cancelled')`.mapWith(Number),
    })
    .from(users)
    .where(eq(users.uplineId, user.id))
    .orderBy(desc(users.createdAt));
  const link = appUrl(`/r/${user.referralCode}`);

  return (
    <>
      <PageHeader
        title="My team"
        description="Realtors who joined with your referral link or code."
        actions={<CopyButton text={link} label="Copy invite link" />}
      />
      <Card flush>
        {rows.length === 0 ? (
          <Empty>No one has joined with your link yet. Share it from your dashboard.</Empty>
        ) : (
          <table className="data-table">
            <thead><tr><th>Realtor</th><th>Joined</th><th>Status</th><th className="text-right">Sales</th><th className="text-right">Sales value</th></tr></thead>
            <tbody>
              {rows.map(({ member, salesCount, salesValue }) => (
                <tr key={member.id}>
                  <td className="font-medium">{fullName(member)}</td>
                  <td>{formatDate(member.createdAt)}</td>
                  <td><Badge>{member.status}</Badge></td>
                  <td className="text-right tabular-nums">{salesCount}</td>
                  <td className="text-right"><Money kobo={salesValue} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
