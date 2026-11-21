import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, lt } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { randomToken, sha256Hex } from "@/lib/random";
import type { User } from "@/db/schema";

const COOKIE = "tp_session";
const SESSION_DAYS = 30;

export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const db = getDb();
  await db.insert(schema.sessions).values({
    id: await sha256Hex(token),
    userId,
    expiresAt,
  });
  // Opportunistic cleanup of expired sessions.
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await getDb()
      .delete(schema.sessions)
      .where(eq(schema.sessions.id, await sha256Hex(token)));
  }
  jar.delete(COOKIE);
}

/** Log a user out everywhere (e.g. after a password reset or suspension). */
export async function destroyAllSessions(userId: string) {
  await getDb().delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

/** The logged-in user, or null. Memoised for the duration of a request. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await getDb()
    .select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(
      and(
        eq(schema.sessions.id, await sha256Hex(token)),
        gt(schema.sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows[0]?.user ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/realtor-login");
  return user;
}

/** An active admin. Every admin page and admin server action must call this. */
export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin" || user.status !== "active") redirect("/portal");
  return user;
}

/** An approved realtor. Pending/suspended accounts are sent to a status page. */
export async function requireRealtor(): Promise<User> {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  if (user.status !== "active") redirect("/portal/status");
  return user;
}

export function homeFor(user: Pick<User, "role">): string {
  return user.role === "admin" ? "/admin" : "/portal";
}
