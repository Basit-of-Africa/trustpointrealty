import "server-only";
import { aliasedTable, desc, eq, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/db";

const { sales, estates, clients, users } = schema;
const realtor = aliasedTable(users, "realtor");

// Correlated subqueries name the outer table explicitly ("sales"."id"):
// drizzle drops table prefixes in some queries, which would silently bind
// the column to the inner table instead.
/** Sales with estate, client, realtor and the amount the client has paid so far. */
export function salesList(where?: SQL, limit = 50, offset = 0) {
  return getDb()
    .select({
      sale: sales,
      estate: estates.name,
      client: clients.fullName,
      clientPhone: clients.phone,
      realtorFirst: realtor.firstName,
      realtorLast: realtor.lastName,
      paid: sql<string>`(select coalesce(sum(sp.amount), 0) from sale_payments sp where sp.sale_id = "sales"."id" and sp.reversed_at is null)`.mapWith(Number),
    })
    .from(sales)
    .innerJoin(estates, eq(estates.id, sales.estateId))
    .innerJoin(clients, eq(clients.id, sales.clientId))
    .leftJoin(realtor, eq(realtor.id, sales.realtorId))
    .where(where)
    .orderBy(desc(sales.saleDate), desc(sales.id))
    .limit(limit)
    .offset(offset);
}

export function activeEstates() {
  return getDb()
    .select({ id: estates.id, name: estates.name, status: estates.status })
    .from(estates)
    .where(sql`${estates.status} <> 'archived'`)
    .orderBy(estates.name);
}

export const PAGE_SIZE = 50;

export function pageFrom(value: string | string[] | undefined): number {
  const n = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

/** Realtors for <select> menus (active first, then others). */
export async function realtorOptions() {
  const rows = await getDb()
    .select({ id: users.id, firstName: users.firstName, lastName: users.lastName, status: users.status })
    .from(users)
    .where(eq(users.role, "realtor"))
    .orderBy(sql`${users.status} = 'active' desc`, users.firstName, users.lastName);
  return rows.map((r) => ({
    id: r.id,
    name: `${r.firstName} ${r.lastName}${r.status === "active" ? "" : ` (${r.status})`}`,
  }));
}
