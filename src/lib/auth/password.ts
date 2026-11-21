import bcrypt from "bcryptjs";
import { createHash, createHmac } from "node:crypto";

/*
 * New passwords use bcrypt (cost 10).
 *
 * Users imported from WordPress keep their old hashes and can log in
 * with their existing password; on first successful login we re-hash
 * to bcrypt. Supported WordPress formats:
 *   - "$wp$2y$…"  WordPress 6.8+ (bcrypt over HMAC-SHA384 of the password)
 *   - "$P$…"/"$H$…" phpass portable hashes (WordPress < 6.8)
 *   - "$2y$…"      plain bcrypt (some plugins)
 *   - 32-char md5  very old WordPress installs
 */

const BCRYPT_COST = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export type VerifyResult = { ok: boolean; needsRehash: boolean };

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<VerifyResult> {
  if (stored.startsWith("$wp$2")) {
    const prehashed = createHmac("sha384", "wp-sha384")
      .update(password, "utf8")
      .digest("base64");
    const ok = await bcryptCompare(prehashed, stored.slice(3));
    return { ok, needsRehash: ok };
  }
  if (stored.startsWith("$2")) {
    const ok = await bcryptCompare(password, stored);
    return { ok, needsRehash: ok && !stored.startsWith("$2b$") };
  }
  if (stored.startsWith("$P$") || stored.startsWith("$H$")) {
    const ok = timingSafeEqual(phpassCrypt(password, stored), stored);
    return { ok, needsRehash: ok };
  }
  if (/^[a-f0-9]{32}$/i.test(stored)) {
    const md5 = createHash("md5").update(password, "utf8").digest("hex");
    const ok = timingSafeEqual(md5, stored.toLowerCase());
    return { ok, needsRehash: ok };
  }
  return { ok: false, needsRehash: false };
}

async function bcryptCompare(password: string, hash: string): Promise<boolean> {
  // PHP writes "$2y$"; it is the same algorithm as "$2a$"/"$2b$".
  const normalised = hash.replace(/^\$2y\$/, "$2b$");
  try {
    return await bcrypt.compare(password, normalised);
  } catch {
    return false;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const ITOA64 =
  "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** phpass "portable" hash, as used by WordPress before 6.8. */
export function phpassCrypt(password: string, setting: string): string {
  const fail = setting.startsWith("*0") ? "*1" : "*0";
  const id = setting.slice(0, 3);
  if (id !== "$P$" && id !== "$H$") return fail;
  const countLog2 = ITOA64.indexOf(setting[3]);
  if (countLog2 < 7 || countLog2 > 30) return fail;
  let count = 1 << countLog2;
  const salt = setting.slice(4, 12);
  if (salt.length !== 8) return fail;

  const pw = Buffer.from(password, "utf8");
  let hash = createHash("md5").update(Buffer.concat([Buffer.from(salt), pw])).digest();
  do {
    hash = createHash("md5").update(Buffer.concat([hash, pw])).digest();
  } while (--count);

  return setting.slice(0, 12) + encode64(hash, 16);
}

function encode64(input: Buffer, count: number): string {
  let output = "";
  let i = 0;
  do {
    let value = input[i++];
    output += ITOA64[value & 0x3f];
    if (i < count) value |= input[i] << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i++ >= count) break;
    if (i < count) value |= input[i] << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i++ >= count) break;
    output += ITOA64[(value >> 18) & 0x3f];
  } while (i < count);
  return output;
}

export function passwordProblems(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[\d\W_]/.test(password))
    return "Password must contain a number or symbol.";
  return null;
}
