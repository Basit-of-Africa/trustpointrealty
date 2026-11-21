/**
 * Create (or promote) an admin account.
 *   npm run create-admin -- admin@trustpointrealty.ng "First" "Last" 08031234567
 * You'll be prompted for the password (or set ADMIN_PASSWORD).
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { createInterface } from "node:readline/promises";
import * as schema from "../src/db/schema";
import { hashPassword, passwordProblems } from "../src/lib/auth/password";
import { normalizePhone } from "../src/lib/phone";

const [email, firstName = "Admin", lastName = "User", phoneArg = "08000000000"] = process.argv.slice(2);
if (!email) {
  console.error('Usage: npm run create-admin -- <email> [first] [last] [phone]');
  process.exit(1);
}
let password = process.env.ADMIN_PASSWORD;
if (!password) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  password = await rl.question("Password: ");
  rl.close();
}
const problem = passwordProblems(password);
if (problem) {
  console.error(problem);
  process.exit(1);
}
const client = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const db = drizzle(client, { schema });
const passwordHash = await hashPassword(password);
const [existing] = await db.select().from(schema.users).where(sql`lower(${schema.users.email}) = ${email.toLowerCase()}`);
if (existing) {
  await db.update(schema.users).set({ role: "admin", status: "active", passwordHash }).where(sql`id = ${existing.id}`);
  console.log(`Promoted ${email} to admin and reset the password.`);
} else {
  await db.insert(schema.users).values({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    phone: normalizePhone(phoneArg) ?? "+2348000000000",
    role: "admin",
    status: "active",
    approvedAt: new Date(),
  });
  console.log(`Created admin ${email}.`);
}
await client.end();
