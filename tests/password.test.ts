import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import { verifyPassword, hashPassword } from "../src/lib/auth/password";

test("phpass test vector from the phpass distribution", async () => {
  const r = await verifyPassword("test12345", "$P$9IQRaTwmfeRo7ud9Fh4E2PdI0S3r.L0");
  assert.equal(r.ok, true);
  assert.equal(r.needsRehash, true);
  assert.equal((await verifyPassword("test12346", "$P$9IQRaTwmfeRo7ud9Fh4E2PdI0S3r.L0")).ok, false);
});

test("WordPress 6.8 $wp$ bcrypt format", async () => {
  const pre = createHmac("sha384", "wp-sha384").update("s3cret!pass").digest("base64");
  const stored = "$wp" + (await bcrypt.hash(pre, 4)).replace(/^\$2b\$/, "$2y$");
  assert.ok(stored.startsWith("$wp$2y$04$"));
  assert.equal((await verifyPassword("s3cret!pass", stored)).ok, true);
  assert.equal((await verifyPassword("wrong", stored)).ok, false);
});

test("new bcrypt hashes round-trip", async () => {
  const h = await hashPassword("hello123");
  assert.deepEqual(await verifyPassword("hello123", h), { ok: true, needsRehash: false });
});
