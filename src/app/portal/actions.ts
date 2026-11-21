"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireRealtor } from "@/lib/auth/session";
import { hashPassword, passwordProblems, verifyPassword } from "@/lib/auth/password";
import { normalizePhone } from "@/lib/phone";
import { audit } from "@/lib/audit";
import type { ActionState } from "@/components/form";

const optional = z
  .string()
  .trim()
  .max(500)
  .transform((v) => v || null)
  .nullable()
  .optional();

const clientSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the client's full name.").max(120),
  phone: z.string().trim().min(1, "Enter the client's phone number."),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email or leave it blank.")]).optional(),
  estateId: z
    .string()
    .optional()
    .transform((v) => (v && /^\d+$/.test(v) ? Number(v) : undefined)),
  notes: optional,
});

export async function registerClientAction(_: ActionState, form: FormData): Promise<ActionState> {
  const realtor = await requireRealtor();
  const parsed = clientSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const phone = normalizePhone(v.phone);
  if (!phone) return { error: "Enter a valid phone number, e.g. 0803 123 4567." };

  const db = getDb();
  const [existing] = await db
    .select({ id: schema.clients.id, realtorId: schema.clients.realtorId })
    .from(schema.clients)
    .where(eq(schema.clients.phone, phone))
    .limit(1);
  if (existing) {
    return {
      error:
        existing.realtorId === realtor.id
          ? "You've already registered this client."
          : "This client is already registered on the portal. If you believe they are your client, please contact the TrustPoint office.",
    };
  }

  const [client] = await db
    .insert(schema.clients)
    .values({
      realtorId: realtor.id,
      fullName: v.fullName,
      phone,
      email: v.email || null,
      estateId: v.estateId ?? null,
      notes: v.notes ?? null,
      createdById: realtor.id,
    })
    .onConflictDoNothing()
    .returning();
  if (!client) return { error: "This client was just registered by someone else." };
  await audit(db, realtor.id, "client.registered", "client", client.id, { phone });
  revalidatePath("/portal/clients");
  return { success: `${v.fullName} is now registered to you.`, at: Date.now() };
}

const profileSchema = z.object({
  phone: z.string().trim().min(1, "Enter your phone number."),
  address: optional,
  bankName: optional,
  accountNumber: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{10}$/.test(v), "Account number must be 10 digits (NUBAN).")
    .transform((v) => v || null),
  accountName: optional,
});

export async function updateProfileAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireRealtor();
  const parsed = profileSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const phone = normalizePhone(v.phone);
  if (!phone) return { error: "Enter a valid phone number." };

  const db = getDb();
  const bankChanged =
    v.bankName !== user.bankName ||
    v.accountNumber !== user.accountNumber ||
    v.accountName !== user.accountName;
  await db
    .update(schema.users)
    .set({ phone, address: v.address, bankName: v.bankName, accountNumber: v.accountNumber, accountName: v.accountName })
    .where(eq(schema.users.id, user.id));
  if (bankChanged) {
    await audit(db, user.id, "realtor.bank_details_changed", "user", user.id, {
      from: { bankName: user.bankName, accountNumber: user.accountNumber, accountName: user.accountName },
      to: { bankName: v.bankName, accountNumber: v.accountNumber, accountName: v.accountName },
    });
  }
  revalidatePath("/portal/profile");
  return { success: "Profile saved." };
}

export async function changePasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireRealtor();
  const current = String(form.get("currentPassword") ?? "");
  const next = String(form.get("newPassword") ?? "");
  if (next !== String(form.get("confirmPassword") ?? "")) return { error: "New passwords don't match." };
  const problem = passwordProblems(next);
  if (problem) return { error: problem };
  if (!(await verifyPassword(current, user.passwordHash)).ok)
    return { error: "Your current password is incorrect." };
  const db = getDb();
  await db.update(schema.users).set({ passwordHash: await hashPassword(next) }).where(eq(schema.users.id, user.id));
  await audit(db, user.id, "user.password_changed", "user", user.id);
  return { success: "Password changed.", at: Date.now() };
}
