import { test } from "node:test";
import assert from "node:assert/strict";
import { parseNaira, commissionFor, parseRate, koboToInput } from "../src/lib/money";
import { normalizePhone } from "../src/lib/phone";

test("parseNaira", () => {
  assert.equal(parseNaira("1,500,000"), 150_000_000);
  assert.equal(parseNaira("₦250000.5"), 25_000_050);
  assert.equal(parseNaira("abc"), null);
  assert.equal(parseNaira("1.234"), null);
  assert.equal(koboToInput(25_000_050), "250000.50");
});

test("commission rounding", () => {
  assert.equal(commissionFor(150_000_000, 1000), 15_000_000); // 10% of ₦1.5m
  assert.equal(commissionFor(33_333, 250), 833); // 2.5% rounds to nearest kobo
  assert.equal(parseRate("2.5"), 250);
  assert.equal(parseRate("101"), null);
});

test("normalizePhone", () => {
  assert.equal(normalizePhone("0803 123 4567"), "+2348031234567");
  assert.equal(normalizePhone("+234 803-123-4567"), "+2348031234567");
  assert.equal(normalizePhone("2348031234567"), "+2348031234567");
  assert.equal(normalizePhone("12345"), null);
  assert.equal(normalizePhone("+44 7911 123456"), "+447911123456");
});
