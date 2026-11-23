"use server";

import { z } from "zod";
import { getDb, schema } from "@/db";
import { sendEmail } from "@/lib/email";
import { normalizePhone } from "@/lib/phone";
import { quotePackages } from "@/content/site";

export type QuoteState = { ok?: boolean; error?: string };

const prefixes = ["Mr.", "Mrs.", "Ms.", "Mx.", "Miss", "Dr.", "Prof."] as const;

const quoteSchema = z.object({
  prefix: z.enum(prefixes).catch("Mr."),
  firstName: z.string().trim().min(1, "Please enter your first name.").max(80),
  middleName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().min(1, "Please enter your last name.").max(80),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().min(1, "Please enter your phone number."),
  notes: z.string().trim().max(180, "Additional notes can be at most 180 characters.").optional(),
  sourcePage: z.string().max(200).optional(),
});

export async function requestQuoteAction(_: QuoteState, form: FormData): Promise<QuoteState> {
  // Honeypot: real visitors never see or fill this field.
  if (String(form.get("website") ?? "") !== "") return { ok: true };

  const parsed = quoteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const v = parsed.data;
  const phone = normalizePhone(v.phone);
  if (!phone) return { error: "Please enter a valid phone number, e.g. 0803 123 4567." };
  const packages = form.getAll("packages").map(String).filter((p) => quotePackages.includes(p));

  const [row] = await getDb()
    .insert(schema.enquiries)
    .values({
      prefix: v.prefix,
      firstName: v.firstName,
      middleName: v.middleName || null,
      lastName: v.lastName,
      email: v.email.toLowerCase(),
      phone,
      packages,
      notes: v.notes || null,
      sourcePage: v.sourcePage || null,
    })
    .returning({ id: schema.enquiries.id });

  const notify = process.env.ENQUIRY_NOTIFY_EMAIL;
  if (notify) {
    await sendEmail(
      notify,
      `New quote request: ${v.prefix} ${v.firstName} ${v.lastName}`,
      [
        `Enquiry #${row.id} from the website${v.sourcePage ? ` (${v.sourcePage})` : ""}.`,
        "",
        `Name: ${v.prefix} ${v.firstName} ${v.middleName ?? ""} ${v.lastName}`.replace(/\s+/g, " "),
        `Email: ${v.email}`,
        `Phone: ${phone}`,
        `Packages: ${packages.join(", ") || "none selected"}`,
        `Notes: ${v.notes || "—"}`,
      ].join("\n"),
    );
  }
  return { ok: true };
}
