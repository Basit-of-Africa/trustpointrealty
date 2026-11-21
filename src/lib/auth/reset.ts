import "server-only";
import { getDb, schema } from "@/db";
import { randomToken, sha256Hex } from "@/lib/random";
import { appUrl } from "@/lib/email";

/** Create a one-time password reset link. Admins can also send it over WhatsApp. */
export async function createPasswordResetLink(userId: string, hours = 2): Promise<string> {
  const token = randomToken();
  await getDb()
    .insert(schema.passwordResetTokens)
    .values({
      id: await sha256Hex(token),
      userId,
      expiresAt: new Date(Date.now() + hours * 3_600_000),
    });
  return appUrl(`/reset-password/${token}`);
}
