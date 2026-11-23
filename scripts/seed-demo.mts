/**
 * Demo data for local development only. Refuses to run against Neon.
 *   npm run seed:demo
 * Logins (password "Password1!"): admin@demo.ng, ada@demo.ng, tunde@demo.ng
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";

const url = process.env.DATABASE_URL!;
if (/neon\.tech/.test(url)) {
  console.error("Refusing to seed demo data into a Neon database.");
  process.exit(1);
}
const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema });
const pw = await hashPassword("Password1!");

await client`truncate audit_log, enquiries, commissions, payouts, sale_payments, sales, clients, estates, password_reset_tokens, sessions, users restart identity cascade`;

const [admin] = await db.insert(schema.users).values({ email: "admin@demo.ng", passwordHash: pw, firstName: "Office", lastName: "Admin", phone: "+2347025050037", role: "admin", status: "active" }).returning();
const [ada] = await db.insert(schema.users).values({ email: "ada@demo.ng", passwordHash: pw, firstName: "Ada", lastName: "Okafor", phone: "+2348031111111", status: "active", referralCode: "TPADA01", bankName: "GTBank", accountNumber: "0123456789", accountName: "Ada Okafor", approvedAt: new Date() }).returning();
const [tunde] = await db.insert(schema.users).values({ email: "tunde@demo.ng", passwordHash: pw, firstName: "Tunde", lastName: "Bakare", phone: "+2348032222222", status: "active", referralCode: "TPTUN02", uplineId: ada.id, bankName: "Access Bank", accountNumber: "0987654321", accountName: "Babatunde Bakare", approvedAt: new Date() }).returning();
await db.insert(schema.users).values({ email: "kemi@demo.ng", passwordHash: pw, firstName: "Kemi", lastName: "Adeyemi", phone: "+2348033333333", status: "pending", referralCode: "TPKEM03", uplineId: ada.id });

const estates = await db.insert(schema.estates).values([
  { name: "Coconutview Estate", location: "Ibadan, Oyo State", pricePerPlot: 250_000_000, commissionRateBps: 1000, uplineRateBps: 200 },
  { name: "Avocado Crest Estate", location: "Ibadan, Oyo State", pricePerPlot: 350_000_000, commissionRateBps: 1000, uplineRateBps: 200 },
  { name: "Palm Oasis Farm Resort", location: "Ibadan, Oyo State", pricePerPlot: 150_000_000, commissionRateBps: 800, uplineRateBps: 0 },
  { name: "Maple Nexus Estate", location: "Ibadan, Oyo State", pricePerPlot: 400_000_000, commissionRateBps: 1000, uplineRateBps: 250 },
]).returning();

const [c1] = await db.insert(schema.clients).values({ realtorId: tunde.id, fullName: "Mr. Mubarak Lawal", phone: "+2348051234567", estateId: estates[0].id, status: "lead", createdById: tunde.id }).returning();
await db.insert(schema.clients).values([
  { realtorId: ada.id, fullName: "Ms. Wuraola Ige", phone: "+2348061234567", estateId: estates[1].id, status: "inspection", createdById: ada.id },
  { realtorId: tunde.id, fullName: "Dr. Funmi Ojo", phone: "+2348071234567", status: "lead", createdById: tunde.id },
]);
console.log("Seeded. Admin: admin@demo.ng / Password1!  Realtors: ada@demo.ng, tunde@demo.ng, (pending) kemi@demo.ng");
console.log(`Try: record a sale for client #${c1.id} in the admin.`);
void admin;
await client.end();
