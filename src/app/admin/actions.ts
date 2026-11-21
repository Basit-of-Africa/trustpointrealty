"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { destroyAllSessions, requireAdmin } from "@/lib/auth/session";
import { createPasswordResetLink } from "@/lib/auth/reset";
import { audit } from "@/lib/audit";
import { normalizePhone } from "@/lib/phone";
import { parseNaira, parseRate } from "@/lib/money";
import {
  amountPaidOnSale,
  createCommissionsForPayment,
  getBalance,
  reverseCommissionsForPayment,
} from "@/lib/ledger";
import { clientStatuses, estateStatuses, saleStatuses, userStatuses } from "@/components/labels";
import type { ActionState } from "@/components/form";

const { users, estates, clients, sales, salePayments, commissions, payouts } = schema;

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const optStr = (form: FormData, key: string) => str(form, key) || null;
const intId = (form: FormData, key: string) => {
  const n = Number(form.get(key));
  return Number.isInteger(n) && n > 0 ? n : null;
};
const uuidOrNull = (form: FormData, key: string) => {
  const v = str(form, key);
  return z.string().uuid().safeParse(v).success ? v : null;
};
const isoDate = (form: FormData, key: string) => {
  const v = str(form, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
};

/* ---------------------------------------------------------------- Realtors */

export async function setRealtorStatusAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = uuidOrNull(form, "userId");
  const status = z.enum(userStatuses).safeParse(str(form, "status"));
  if (!id || !status.success) return { error: "Invalid request." };
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user || user.role !== "realtor") return { error: "Realtor not found." };
  await db
    .update(users)
    .set({ status: status.data, ...(status.data === "active" && !user.approvedAt ? { approvedAt: new Date() } : {}) })
    .where(eq(users.id, id));
  if (status.data === "suspended" || status.data === "rejected") await destroyAllSessions(id);
  await audit(db, admin.id, `realtor.${status.data}`, "user", id, { from: user.status });
  revalidatePath("/admin", "layout");
  return { success: `Status set to ${status.data}.` };
}

export async function updateRealtorAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = uuidOrNull(form, "userId");
  if (!id) return { error: "Invalid request." };
  const phone = normalizePhone(str(form, "phone"));
  if (!phone) return { error: "Enter a valid phone number." };
  const firstName = str(form, "firstName");
  const lastName = str(form, "lastName");
  if (!firstName || !lastName) return { error: "First and last name are required." };
  const accountNumber = optStr(form, "accountNumber");
  if (accountNumber && !/^\d{10}$/.test(accountNumber)) return { error: "Account number must be 10 digits." };
  const uplineId = uuidOrNull(form, "uplineId");
  if (uplineId === id) return { error: "A realtor can't be their own upline." };

  const db = getDb();
  const [before] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!before) return { error: "Realtor not found." };
  if (uplineId) {
    // Prevent loops: walk up from the proposed upline.
    let cursor: string | null = uplineId;
    for (let depth = 0; cursor && depth < 50; depth++) {
      if (cursor === id) return { error: "That would create a loop in the team structure." };
      const [row] = await db.select({ up: users.uplineId }).from(users).where(eq(users.id, cursor)).limit(1);
      cursor = row?.up ?? null;
    }
  }
  const values = {
    firstName,
    lastName,
    phone,
    uplineId,
    address: optStr(form, "address"),
    bankName: optStr(form, "bankName"),
    accountNumber,
    accountName: optStr(form, "accountName"),
    adminNotes: optStr(form, "adminNotes"),
  };
  await db.update(users).set(values).where(eq(users.id, id));
  const changed = Object.fromEntries(
    Object.entries(values).filter(([k, v]) => before[k as keyof typeof before] !== v).map(([k, v]) => [k, { from: before[k as keyof typeof before], to: v }]),
  );
  if (Object.keys(changed).length) await audit(db, admin.id, "realtor.updated", "user", id, changed);
  revalidatePath(`/admin/realtors/${id}`);
  return { success: "Realtor details saved." };
}

export async function resetLinkAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = uuidOrNull(form, "userId");
  if (!id) return { error: "Invalid request." };
  const link = await createPasswordResetLink(id, 48);
  await audit(getDb(), admin.id, "user.reset_link_created", "user", id);
  return { success: `Reset link (valid 48 hours, single use): ${link}` };
}

/* ----------------------------------------------------------------- Estates */

export async function saveEstateAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = intId(form, "id");
  const name = str(form, "name");
  if (!name) return { error: "Enter the estate name." };
  const commissionRateBps = parseRate(str(form, "commissionRate"));
  const uplineRateBps = parseRate(str(form, "uplineRate") || "0");
  if (commissionRateBps == null || uplineRateBps == null) return { error: "Rates must be percentages between 0 and 100." };
  const priceInput = str(form, "pricePerPlot");
  const pricePerPlot = priceInput ? parseNaira(priceInput) : null;
  if (priceInput && pricePerPlot == null) return { error: "Enter a valid price per plot." };
  const status = z.enum(estateStatuses).catch("selling").parse(str(form, "status"));
  const values = {
    name,
    location: str(form, "location"),
    status,
    pricePerPlot,
    commissionRateBps,
    uplineRateBps,
    description: optStr(form, "description"),
  };
  const db = getDb();
  if (id) {
    await db.update(estates).set(values).where(eq(estates.id, id));
    await audit(db, admin.id, "estate.updated", "estate", id, values);
  } else {
    const [row] = await db.insert(estates).values(values).returning({ id: estates.id });
    await audit(db, admin.id, "estate.created", "estate", row.id, values);
  }
  revalidatePath("/admin/estates");
  if (!id) redirect("/admin/estates");
  return { success: "Estate saved. New rates apply to sales recorded from now on." };
}

/* ----------------------------------------------------------------- Clients */

export async function saveClientAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = intId(form, "id");
  const fullName = str(form, "fullName");
  if (fullName.length < 2) return { error: "Enter the client's full name." };
  const phone = normalizePhone(str(form, "phone"));
  if (!phone) return { error: "Enter a valid phone number." };
  const email = optStr(form, "email");
  if (email && !z.string().email().safeParse(email).success) return { error: "Enter a valid email." };
  const status = z.enum(clientStatuses).catch("lead").parse(str(form, "status"));
  const values = {
    fullName,
    phone,
    email,
    realtorId: uuidOrNull(form, "realtorId"),
    estateId: intId(form, "estateId"),
    status,
    notes: optStr(form, "notes"),
  };
  const db = getDb();
  const [dupe] = await db
    .select({ id: clients.id, name: clients.fullName })
    .from(clients)
    .where(eq(clients.phone, phone))
    .limit(1);
  if (dupe && dupe.id !== id) return { error: `That phone number already belongs to client #${dupe.id} (${dupe.name}).` };

  if (id) {
    const [before] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    if (!before) return { error: "Client not found." };
    await db.update(clients).set(values).where(eq(clients.id, id));
    await audit(db, admin.id, before.realtorId !== values.realtorId ? "client.reassigned" : "client.updated", "client", id, {
      ...values,
      previousRealtorId: before.realtorId,
    });
    revalidatePath(`/admin/clients/${id}`);
    return { success: "Client saved." };
  }
  const [row] = await db.insert(clients).values({ ...values, createdById: admin.id }).returning({ id: clients.id });
  await audit(db, admin.id, "client.created", "client", row.id, values);
  redirect(`/admin/clients/${row.id}`);
}

/* ------------------------------------------------------------------- Sales */

export async function createSaleAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const clientId = intId(form, "clientId");
  const estateId = intId(form, "estateId");
  const plots = intId(form, "plots") ?? 1;
  const totalPrice = parseNaira(str(form, "totalPrice"));
  const saleDate = isoDate(form, "saleDate");
  if (!clientId || !estateId) return { error: "Choose the client and the estate." };
  if (!totalPrice) return { error: "Enter the total price." };
  if (!saleDate) return { error: "Enter the sale date." };

  const db = getDb();
  const [client] = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
  const [estate] = await db.select().from(estates).where(eq(estates.id, estateId)).limit(1);
  if (!client || !estate) return { error: "Client or estate not found." };

  let realtorId: string | null = client.realtorId;
  let uplineId: string | null = null;
  if (realtorId) {
    const [realtor] = await db.select().from(users).where(eq(users.id, realtorId)).limit(1);
    uplineId = realtor?.uplineId ?? null;
    if (!realtor) realtorId = null;
  }
  // Admin may override the rates for this sale (e.g. a special deal).
  const commissionRateBps = parseRate(str(form, "commissionRate")) ?? estate.commissionRateBps;
  const uplineRateBps = parseRate(str(form, "uplineRate")) ?? estate.uplineRateBps;

  const saleId = await db.transaction(async (tx) => {
    const [sale] = await tx
      .insert(sales)
      .values({
        clientId,
        estateId,
        realtorId,
        uplineId,
        commissionRateBps: realtorId ? commissionRateBps : 0,
        uplineRateBps: uplineId ? uplineRateBps : 0,
        plots,
        plotNumbers: optStr(form, "plotNumbers"),
        totalPrice,
        saleDate,
        notes: optStr(form, "notes"),
        createdById: admin.id,
      })
      .returning();
    await tx.update(clients).set({ status: "buyer" }).where(eq(clients.id, clientId));
    await audit(tx, admin.id, "sale.created", "sale", sale.id, {
      clientId, estateId, realtorId, uplineId, totalPrice, commissionRateBps: sale.commissionRateBps, uplineRateBps: sale.uplineRateBps,
    });

    // Optional first payment (deposit) recorded together with the sale.
    const deposit = parseNaira(str(form, "deposit"));
    if (deposit) {
      const [payment] = await tx
        .insert(salePayments)
        .values({ saleId: sale.id, amount: deposit, paidOn: saleDate, method: optStr(form, "method"), reference: optStr(form, "reference"), createdById: admin.id })
        .returning();
      await createCommissionsForPayment(tx, sale, payment.id, deposit, admin.id);
      await audit(tx, admin.id, "payment.logged", "sale", sale.id, { paymentId: payment.id, amount: deposit });
      if (deposit >= totalPrice) await tx.update(sales).set({ status: "completed" }).where(eq(sales.id, sale.id));
    }
    return sale.id;
  });
  redirect(`/admin/sales/${saleId}`);
}

export async function setSaleStatusAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = intId(form, "saleId");
  const status = z.enum(saleStatuses).safeParse(str(form, "status"));
  if (!id || !status.success) return { error: "Invalid request." };
  const db = getDb();
  await db.update(sales).set({ status: status.data }).where(eq(sales.id, id));
  await audit(db, admin.id, `sale.${status.data}`, "sale", id);
  revalidatePath(`/admin/sales/${id}`);
  return { success: `Sale marked ${status.data}.` };
}

export async function logPaymentAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const saleId = intId(form, "saleId");
  const amount = parseNaira(str(form, "amount"));
  const paidOn = isoDate(form, "paidOn");
  if (!saleId) return { error: "Invalid request." };
  if (!amount) return { error: "Enter the amount the client paid." };
  if (!paidOn) return { error: "Enter the payment date." };

  const db = getDb();
  const result = await db.transaction(async (tx) => {
    const [sale] = await tx.select().from(sales).where(eq(sales.id, saleId)).for("update").limit(1);
    if (!sale) return { error: "Sale not found." };
    if (sale.status === "cancelled") return { error: "This sale is cancelled." };
    const paidSoFar = await amountPaidOnSale(saleId, tx);
    if (paidSoFar + amount > sale.totalPrice && form.get("allowOverpay") !== "on")
      return { error: `That's more than the balance owed on this sale. Tick "allow overpayment" if this is correct.` };

    const [payment] = await tx
      .insert(salePayments)
      .values({ saleId, amount, paidOn, method: optStr(form, "method"), reference: optStr(form, "reference"), notes: optStr(form, "notes"), createdById: admin.id })
      .returning();
    const created = await createCommissionsForPayment(tx, sale, payment.id, amount, admin.id);
    if (paidSoFar + amount >= sale.totalPrice && sale.status === "active")
      await tx.update(sales).set({ status: "completed" }).where(eq(sales.id, saleId));
    await audit(tx, admin.id, "payment.logged", "sale", saleId, { paymentId: payment.id, amount, commissions: created.length });
    return { success: `Payment logged. ${created.length} commission entr${created.length === 1 ? "y" : "ies"} created for approval.` };
  });
  revalidatePath(`/admin/sales/${saleId}`);
  return result;
}

export async function reversePaymentAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const paymentId = intId(form, "paymentId");
  const reason = str(form, "reason");
  if (!paymentId) return { error: "Invalid request." };
  if (!reason) return { error: "Give a reason for the reversal." };
  const db = getDb();
  const result = await db.transaction(async (tx) => {
    const [payment] = await tx.select().from(salePayments).where(eq(salePayments.id, paymentId)).for("update").limit(1);
    if (!payment || payment.reversedAt) return { error: "Payment not found or already reversed." };
    await tx.update(salePayments).set({ reversedAt: new Date(), reversalReason: reason }).where(eq(salePayments.id, paymentId));
    const r = await reverseCommissionsForPayment(tx, paymentId, admin.id, reason);
    const [sale] = await tx.select().from(sales).where(eq(sales.id, payment.saleId)).limit(1);
    if (sale?.status === "completed" && (await amountPaidOnSale(sale.id, tx)) < sale.totalPrice)
      await tx.update(sales).set({ status: "active" }).where(eq(sales.id, sale.id));
    await audit(tx, admin.id, "payment.reversed", "sale", payment.saleId, { paymentId, reason, ...r });
    return { saleId: payment.saleId, ...r };
  });
  if ("error" in result) return { error: result.error };
  revalidatePath(`/admin/sales/${result.saleId}`);
  return { success: `Payment reversed. ${result.voided} pending commission(s) voided, ${result.clawedBack} approved commission(s) clawed back.` };
}

/* ------------------------------------------------------------- Commissions */

export async function approveCommissionsAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const ids = form.getAll("ids").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  if (!ids.length) return { error: "Tick at least one commission to approve." };
  const db = getDb();
  const updated = await db
    .update(commissions)
    .set({ status: "approved", approvedById: admin.id, approvedAt: new Date() })
    .where(and(inArray(commissions.id, ids), eq(commissions.status, "pending")))
    .returning({ id: commissions.id });
  await audit(db, admin.id, "commission.approved", "commission", null, { ids: updated.map((u) => u.id) });
  revalidatePath("/admin", "layout");
  return { success: `${updated.length} commission(s) approved.` };
}

export async function voidCommissionAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = intId(form, "commissionId");
  const reason = str(form, "reason");
  if (!id) return { error: "Invalid request." };
  if (!reason) return { error: "Give a reason." };
  const db = getDb();
  const [row] = await db
    .update(commissions)
    .set({ status: "void", note: `Voided: ${reason}` })
    .where(and(eq(commissions.id, id), eq(commissions.status, "pending")))
    .returning({ id: commissions.id });
  if (!row) return { error: "Only pending commissions can be voided. Use an adjustment for approved ones." };
  await audit(db, admin.id, "commission.voided", "commission", id, { reason });
  revalidatePath("/admin", "layout");
  return { success: "Commission voided." };
}

export async function addAdjustmentAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const realtorId = uuidOrNull(form, "realtorId");
  const raw = str(form, "amount");
  const negative = raw.startsWith("-");
  const amount = parseNaira(negative ? raw.slice(1) : raw);
  const note = str(form, "note");
  if (!realtorId) return { error: "Invalid request." };
  if (!amount) return { error: "Enter an amount (use a minus sign for a deduction)." };
  if (!note) return { error: "Explain the adjustment; the realtor will see this note." };
  const db = getDb();
  const signed = negative ? -amount : amount;
  const [row] = await db
    .insert(commissions)
    .values({ realtorId, kind: "adjustment", status: "approved", amount: signed, note, approvedById: admin.id, approvedAt: new Date(), createdById: admin.id })
    .returning({ id: commissions.id });
  await audit(db, admin.id, "commission.adjustment", "commission", row.id, { realtorId, amount: signed, note });
  revalidatePath(`/admin/realtors/${realtorId}`);
  return { success: "Adjustment added." };
}

/* ----------------------------------------------------------------- Payouts */

export async function logPayoutAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const realtorId = uuidOrNull(form, "realtorId");
  const amount = parseNaira(str(form, "amount"));
  const paidOn = isoDate(form, "paidOn");
  if (!realtorId) return { error: "Choose the realtor." };
  if (!amount) return { error: "Enter the amount transferred." };
  if (!paidOn) return { error: "Enter the transfer date." };

  const db = getDb();
  const result = await db.transaction(async (tx) => {
    // Lock the realtor row so two admins can't overdraw the same balance.
    const [realtor] = await tx.select().from(users).where(eq(users.id, realtorId)).for("update").limit(1);
    if (!realtor || realtor.role !== "realtor") return { error: "Realtor not found." };
    const balance = await getBalance(realtorId, tx);
    if (amount > balance.available)
      return { error: `That's more than the available balance (₦${(balance.available / 100).toLocaleString("en-NG")}). Approve their pending commissions first, or add an adjustment.` };
    const [payout] = await tx
      .insert(payouts)
      .values({
        realtorId,
        amount,
        paidOn,
        bankName: optStr(form, "bankName") ?? realtor.bankName,
        accountNumber: optStr(form, "accountNumber") ?? realtor.accountNumber,
        accountName: optStr(form, "accountName") ?? realtor.accountName,
        reference: optStr(form, "reference"),
        note: optStr(form, "note"),
        createdById: admin.id,
      })
      .returning({ id: payouts.id });
    await audit(tx, admin.id, "payout.logged", "payout", payout.id, { realtorId, amount, paidOn });
    return { success: "Payout logged. It now shows on the realtor's dashboard." };
  });
  revalidatePath("/admin", "layout");
  return result;
}

export async function voidPayoutAction(_: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = intId(form, "payoutId");
  const reason = str(form, "reason");
  if (!id) return { error: "Invalid request." };
  if (!reason) return { error: "Give a reason (e.g. transfer failed and was refunded)." };
  const db = getDb();
  const [row] = await db
    .update(payouts)
    .set({ voidedAt: new Date(), voidReason: reason })
    .where(and(eq(payouts.id, id), isNull(payouts.voidedAt)))
    .returning({ id: payouts.id, realtorId: payouts.realtorId });
  if (!row) return { error: "Payout not found or already voided." };
  await audit(db, admin.id, "payout.voided", "payout", id, { reason });
  revalidatePath("/admin", "layout");
  return { success: "Payout voided; the amount is back in the realtor's available balance." };
}
