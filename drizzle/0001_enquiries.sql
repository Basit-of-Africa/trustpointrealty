CREATE TYPE "public"."enquiry_status" AS ENUM('new', 'contacted', 'closed');--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "enquiries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"prefix" text,
	"first_name" text NOT NULL,
	"middle_name" text,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"packages" text[] DEFAULT '{}'::text[] NOT NULL,
	"notes" text,
	"source_page" text,
	"status" "enquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "enquiries_created_idx" ON "enquiries" USING btree ("created_at");