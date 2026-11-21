/** Money helpers. All amounts are integer kobo (₦1 = 100 kobo). */

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
});

export function formatNaira(kobo: number | null | undefined): string {
  return naira.format((kobo ?? 0) / 100);
}

/**
 * Parse user input like "1,500,000", "₦250000.50" or "2500000" into kobo.
 * Returns null for empty or invalid input.
 */
export function parseNaira(input: unknown): number | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[₦,\s]/g, "").replace(/^NGN/i, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const value = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return Number.isSafeInteger(value) ? value : null;
}

/** Format kobo as a plain input value, e.g. 150000050 -> "1500000.50". */
export function koboToInput(kobo: number | null | undefined): string {
  if (kobo == null) return "";
  const whole = Math.trunc(kobo / 100);
  const frac = Math.abs(kobo % 100);
  return frac ? `${whole}.${String(frac).padStart(2, "0")}` : String(whole);
}

/** Commission for an amount at a rate in basis points, rounded to the nearest kobo. */
export function commissionFor(amountKobo: number, rateBps: number): number {
  return Math.round((amountKobo * rateBps) / 10_000);
}

export function formatRate(bps: number): string {
  return `${(bps / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}%`;
}

/** Parse "10" or "2.5" (percent) into basis points. */
export function parseRate(input: unknown): number | null {
  if (typeof input !== "string" || input.trim() === "") return null;
  const n = Number(input.replace("%", "").trim());
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return Math.round(n * 100);
}
