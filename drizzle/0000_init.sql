CREATE TYPE "public"."client_status" AS ENUM('lead', 'inspection', 'buyer', 'lost');--> statement-breakpoint
CREATE TYPE "public"."commission_kind" AS ENUM('direct', 'upline', 'adjustment', 'clawback');--> statement-breakpoint
CREATE TYPE "public"."commission_status" AS ENUM('pending', 'approved', 'void');--> statement-breakpoint
CREATE TYPE "public"."estate_status" AS ENUM('selling', 'sold_out', 'archived');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'realtor');--> statement-breakpoint
CREATE TYPE "public"."sale_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended', 'rejected');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"realtor_id" uuid,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"estate_id" integer,
	"status" "client_status" DEFAULT 'lead' NOT NULL,
	"notes" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "commissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"realtor_id" uuid NOT NULL,
	"kind" "commission_kind" NOT NULL,
	"status" "commission_status" DEFAULT 'pending' NOT NULL,
	"amount" bigint NOT NULL,
	"rate_bps" integer,
	"sale_id" integer,
	"payment_id" integer,
	"reverses_id" integer,
	"note" text,
	"approved_by_id" uuid,
	"approved_at" timestamp with time zone,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "estates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"status" "estate_status" DEFAULT 'selling' NOT NULL,
	"price_per_plot" bigint,
	"commission_rate_bps" integer DEFAULT 1000 NOT NULL,
	"upline_rate_bps" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payouts" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payouts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"realtor_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"paid_on" date NOT NULL,
	"bank_name" text,
	"account_number" text,
	"account_name" text,
	"reference" text,
	"note" text,
	"voided_at" timestamp with time zone,
	"void_reason" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sale_payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"sale_id" integer NOT NULL,
	"amount" bigint NOT NULL,
	"paid_on" date NOT NULL,
	"method" text,
	"reference" text,
	"notes" text,
	"reversed_at" timestamp with time zone,
	"reversal_reason" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sales_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"client_id" integer NOT NULL,
	"estate_id" integer NOT NULL,
	"realtor_id" uuid,
	"upline_id" uuid,
	"commission_rate_bps" integer NOT NULL,
	"upline_rate_bps" integer NOT NULL,
	"plots" integer DEFAULT 1 NOT NULL,
	"plot_numbers" text,
	"total_price" bigint NOT NULL,
	"sale_date" date NOT NULL,
	"status" "sale_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_by_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'realtor' NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"referral_code" text,
	"upline_id" uuid,
	"bank_name" text,
	"account_number" text,
	"account_name" text,
	"address" text,
	"admin_notes" text,
	"legacy_wp_user_id" integer,
	"approved_at" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_estate_id_estates_id_fk" FOREIGN KEY ("estate_id") REFERENCES "public"."estates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payment_id_sale_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."sale_payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_reverses_id_commissions_id_fk" FOREIGN KEY ("reverses_id") REFERENCES "public"."commissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_estate_id_estates_id_fk" FOREIGN KEY ("estate_id") REFERENCES "public"."estates"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_realtor_id_users_id_fk" FOREIGN KEY ("realtor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_upline_id_users_id_fk" FOREIGN KEY ("upline_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_upline_id_users_id_fk" FOREIGN KEY ("upline_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "clients_phone_idx" ON "clients" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "clients_realtor_idx" ON "clients" USING btree ("realtor_id");--> statement-breakpoint
CREATE INDEX "commissions_realtor_idx" ON "commissions" USING btree ("realtor_id","status");--> statement-breakpoint
CREATE INDEX "commissions_payment_idx" ON "commissions" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payouts_realtor_idx" ON "payouts" USING btree ("realtor_id");--> statement-breakpoint
CREATE INDEX "sale_payments_sale_idx" ON "sale_payments" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sales_realtor_idx" ON "sales" USING btree ("realtor_id");--> statement-breakpoint
CREATE INDEX "sales_client_idx" ON "sales" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree (lower("email"));--> statement-breakpoint
CREATE UNIQUE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "users_upline_idx" ON "users" USING btree ("upline_id");