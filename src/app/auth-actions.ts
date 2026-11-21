"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import {
  createSession,
  destroyAllSessions,
  destroySession,
  homeFor,
} from "@/lib/auth/session";
import { hashPassword, passwordProblems, verifyPassword } from "@/lib/auth/password";
import { normalizePhone } from "@/lib/phone";
import { randomCode, sha256Hex } from "@/lib/random";
import { sendEmail } from "@/lib/email";
import { createPasswordResetLink } from "@/lib/auth/reset";
import { audit } from "@/lib/audit";
import type { ActionState } from "@/components/form";

const { users } = schema;

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

function findUserByEmail(email: string) {
  return getDb()
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1)
    .then((r) => r[0]);
}

export async function loginAction(_: ActionState, form: FormData): Promise<ActionState> {
  const email = emailSchema.safeParse(form.get("email"));
  const password = String(form.get("password") ?? "");
  if (!email.success || !password) return { error: "Enter your email and password." };

  const user = await findUserByEmail(email.data);
  const result = user ? await verifyPassword(password, user.passwordHash) : null;
  if (!user || !result?.ok) return { error: "Incorrect email or password." };
  if (user.status === "rejected") return { error: "This account is not active. Please contact TrustPoint." };

  const db = getDb();
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      // Upgrade WordPress-imported hashes to bcrypt on first login.
      ...(result.needsRehash ? { passwordHash: await hashPassword(password) } : {}),
    })
    .where(eq(users.id, user.id));
  await createSession(user.id);

  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : homeFor(user));
}

export async function logoutAction() {
  await destroySession();
  redirect("/realtor-login");
}

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Enter your first name.").max(60),
    lastName: z.string().trim().min(1, "Enter your last name.").max(60),
    email: emailSchema,
    phone: z.string().trim().min(1, "Enter your phone number."),
    password: z.string(),
    confirmPassword: z.string(),
    referralCode: z.string().trim().toUpperCase().max(20).optional(),
    terms: z.literal("on", { message: "Please accept the realtor terms." }),
  })
  .refine((v) => v.password === v.confirmPassword, { message: "Passwords don't match." });

async function uniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `TP${randomCode(5)}`;
    const [exists] = await getDb()
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, code))
      .limit(1);
    if (!exists) return code;
  }
  throw new Error("Could not generate a referral code");
}

export async function registerAction(_: ActionState, form: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;

  const pwProblem = passwordProblems(v.password);
  if (pwProblem) return { error: pwProblem };
  const phone = normalizePhone(v.phone);
  if (!phone) return { error: "Enter a valid phone number, e.g. 0803 123 4567." };
  if (await findUserByEmail(v.email))
    return { error: "An account with this email already exists. Try logging in." };

  const db = getDb();
  let uplineId: string | null = null;
  if (v.referralCode) {
    const [upline] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.referralCode, v.referralCode), eq(users.role, "realtor")))
      .limit(1);
    if (!upline) return { error: "That referral code wasn't found. Check it or leave it blank." };
    uplineId = upline.id;
  }

  const [user] = await db
    .insert(users)
    .values({
      email: v.email,
      passwordHash: await hashPassword(v.password),
      firstName: v.firstName,
      lastName: v.lastName,
      phone,
      role: "realtor",
      status: "pending",
      referralCode: await uniqueReferralCode(),
      uplineId,
    })
    .returning();
  await audit(db, user.id, "realtor.registered", "user", user.id, { uplineId });

  (await cookies()).delete("tp_ref");
  await createSession(user.id);
  redirect("/portal/status");
}

export async function forgotPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  const user = await findUserByEmail(email.data);
  if (user && user.status !== "rejected") {
    const link = await createPasswordResetLink(user.id);
    await sendEmail(
      user.email,
      "Reset your TrustPoint Partners password",
      `Hello ${user.firstName},\n\nUse this link to set a new password. It expires in 2 hours.\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.\n\nTrustPoint Realty`,
    );
  }
  // Same message either way, so the form doesn't reveal who has an account.
  return { success: "If that email has an account, a reset link is on its way." };
}

export async function resetPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("confirmPassword") ?? ""))
    return { error: "Passwords don't match." };
  const problem = passwordProblems(password);
  if (problem) return { error: problem };

  const db = getDb();
  const id = await sha256Hex(token);
  const [row] = await db
    .select()
    .from(schema.passwordResetTokens)
    .where(
      and(
        eq(schema.passwordResetTokens.id, id),
        isNull(schema.passwordResetTokens.usedAt),
        gt(schema.passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!row) return { error: "This reset link is invalid or has expired. Request a new one." };

  await db.update(users).set({ passwordHash: await hashPassword(password) }).where(eq(users.id, row.userId));
  await db.update(schema.passwordResetTokens).set({ usedAt: new Date() }).where(eq(schema.passwordResetTokens.id, id));
  await audit(db, row.userId, "user.password_reset", "user", row.userId);
  await destroyAllSessions(row.userId);
  await createSession(row.userId);
  redirect("/portal");
}
