import "server-only";

/**
 * Sends email through Resend's HTTP API (works on Workers and Node).
 * Without RESEND_API_KEY the message is printed to the server log instead,
 * which is handy in development.
 */
export async function sendEmail(to: string, subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email:dev] to=${to} subject=${subject}\n${text}`);
    return { ok: true, dev: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "TrustPoint Realty <no-reply@trustpointrealty.ng>",
      to,
      subject,
      text,
    }),
  });
  if (!res.ok) console.error("[email] send failed", res.status, await res.text());
  return { ok: res.ok, dev: false };
}

export function appUrl(path = ""): string {
  const base = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path}`;
}
