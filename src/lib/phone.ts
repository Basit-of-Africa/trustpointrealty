/**
 * Normalise Nigerian phone numbers to E.164 (+234XXXXXXXXXX) so the same
 * client can't be registered twice under different spellings.
 * Non-Nigerian numbers written with a leading "+" are kept as-is.
 */
export function normalizePhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+") && !digits.startsWith("234")) {
    return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  }
  let local: string;
  if (digits.startsWith("234")) local = digits.slice(3);
  else if (digits.startsWith("0")) local = digits.slice(1);
  else local = digits;
  if (!/^[789]\d{9}$/.test(local)) return null;
  return `+234${local}`;
}

/** Display +2348031234567 as 0803 123 4567. */
export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  const m = /^\+234(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : e164;
}
