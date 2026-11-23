import { sql } from "drizzle-orm";
import {
  bigint,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/*
 * Money is always stored as integer kobo (₦1 = 100 kobo) to avoid
 * floating-point rounding. Rates are stored in basis points (1% = 100 bps).
 */
const kobo = (name: string) => bigint(name, { mode: "number" });

export const roleEnum = pgEnum("role", ["admin", "realtor"]);
export const userStatusEnum = pgEnum("user_status", [
  "pending",
  "active",
  "suspended",
  "rejected",
]);
export const estateStatusEnum = pgEnum("estate_status", [
  "selling",
  "sold_out",
  "archived",
]);
export const clientStatusEnum = pgEnum("client_status", [
  "lead",
  "inspection",
  "buyer",
  "lost",
]);
export const saleStatusEnum = pgEnum("sale_status", [
  "active",
  "completed",
  "cancelled",
]);
export const commissionKindEnum = pgEnum("commission_kind", [
  "direct", // the realtor who brought the client
  "upline", // the realtor who recruited that realtor
  "adjustment", // manual credit/debit by admin (also used for opening balances)
  "clawback", // reversal of an already-approved commission
]);
export const commissionStatusEnum = pgEnum("commission_status", [
  "pending",
  "approved",
  "void",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull().default("realtor"),
    status: userStatusEnum("status").notNull().default("pending"),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone").notNull(),
    // Realtor fields
    referralCode: text("referral_code"),
    uplineId: uuid("upline_id").references((): AnyPgColumn => users.id, {
      onDelete: "set null",
    }),
    bankName: text("bank_name"),
    accountNumber: text("account_number"),
    accountName: text("account_name"),
    address: text("address"),
    adminNotes: text("admin_notes"),
    // Set when imported from the old WordPress / Ultimate Affiliate Pro site
    legacyWpUserId: integer("legacy_wp_user_id"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(sql`lower(${t.email})`),
    uniqueIndex("users_referral_code_idx").on(t.referralCode),
    index("users_upline_idx").on(t.uplineId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 of the cookie token; the raw token is never stored.
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: text("id").primaryKey(), // SHA-256 of the token
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const estates = pgTable("estates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  status: estateStatusEnum("status").notNull().default("selling"),
  pricePerPlot: kobo("price_per_plot"),
  commissionRateBps: integer("commission_rate_bps").notNull().default(1000),
  uplineRateBps: integer("upline_rate_bps").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clients = pgTable(
  "clients",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    // The realtor who owns this client. Null = walk-in / company client.
    realtorId: uuid("realtor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    fullName: text("full_name").notNull(),
    // Normalised to +234… so the same person can't be registered twice.
    phone: text("phone").notNull(),
    email: text("email"),
    estateId: integer("estate_id").references(() => estates.id, {
      onDelete: "set null",
    }),
    status: clientStatusEnum("status").notNull().default("lead"),
    notes: text("notes"),
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("clients_phone_idx").on(t.phone),
    index("clients_realtor_idx").on(t.realtorId),
  ],
);

export const sales = pgTable(
  "sales",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "restrict" }),
    estateId: integer("estate_id")
      .notNull()
      .references(() => estates.id, { onDelete: "restrict" }),
    // Snapshots taken when the sale is recorded, so later changes to the
    // realtor's upline or the estate's rates don't rewrite history.
    realtorId: uuid("realtor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    uplineId: uuid("upline_id").references(() => users.id, {
      onDelete: "set null",
    }),
    commissionRateBps: integer("commission_rate_bps").notNull(),
    uplineRateBps: integer("upline_rate_bps").notNull(),
    plots: integer("plots").notNull().default(1),
    plotNumbers: text("plot_numbers"),
    totalPrice: kobo("total_price").notNull(),
    saleDate: date("sale_date").notNull(),
    status: saleStatusEnum("status").notNull().default("active"),
    notes: text("notes"),
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("sales_realtor_idx").on(t.realtorId),
    index("sales_client_idx").on(t.clientId),
  ],
);

/** Money received from the client (deposit / instalments). */
export const salePayments = pgTable(
  "sale_payments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    saleId: integer("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "restrict" }),
    amount: kobo("amount").notNull(),
    paidOn: date("paid_on").notNull(),
    method: text("method"),
    reference: text("reference"),
    notes: text("notes"),
    reversedAt: timestamp("reversed_at", { withTimezone: true }),
    reversalReason: text("reversal_reason"),
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sale_payments_sale_idx").on(t.saleId)],
);

/** The commission ledger. Amounts are signed (clawbacks are negative). */
export const commissions = pgTable(
  "commissions",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    realtorId: uuid("realtor_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    kind: commissionKindEnum("kind").notNull(),
    status: commissionStatusEnum("status").notNull().default("pending"),
    amount: kobo("amount").notNull(),
    rateBps: integer("rate_bps"),
    saleId: integer("sale_id").references(() => sales.id, {
      onDelete: "restrict",
    }),
    paymentId: integer("payment_id").references(() => salePayments.id, {
      onDelete: "restrict",
    }),
    // For clawbacks: the commission being reversed
    reversesId: integer("reverses_id").references(
      (): AnyPgColumn => commissions.id,
    ),
    note: text("note"),
    approvedById: uuid("approved_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("commissions_realtor_idx").on(t.realtorId, t.status),
    index("commissions_payment_idx").on(t.paymentId),
  ],
);

/** Payouts made to realtors by bank transfer (logged only; no money moves here). */
export const payouts = pgTable(
  "payouts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    realtorId: uuid("realtor_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    amount: kobo("amount").notNull(),
    paidOn: date("paid_on").notNull(),
    // Snapshot of the bank details the money was sent to
    bankName: text("bank_name"),
    accountNumber: text("account_number"),
    accountName: text("account_name"),
    reference: text("reference"),
    note: text("note"),
    voidedAt: timestamp("voided_at", { withTimezone: true }),
    voidReason: text("void_reason"),
    createdById: uuid("created_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("payouts_realtor_idx").on(t.realtorId)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    details: jsonb("details"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("audit_created_idx").on(t.createdAt)],
);

export const enquiryStatusEnum = pgEnum("enquiry_status", ["new", "contacted", "closed"]);

/** "Request a Quote" submissions from the public website. */
export const enquiries = pgTable(
  "enquiries",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    prefix: text("prefix"),
    firstName: text("first_name").notNull(),
    middleName: text("middle_name"),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    packages: text("packages").array().notNull().default(sql`'{}'::text[]`),
    notes: text("notes"),
    // The page the form was sent from, e.g. /palm-oasis
    sourcePage: text("source_page"),
    status: enquiryStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("enquiries_created_idx").on(t.createdAt)],
);

export type Enquiry = typeof enquiries.$inferSelect;
export type User = typeof users.$inferSelect;
export type Estate = typeof estates.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SalePayment = typeof salePayments.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
