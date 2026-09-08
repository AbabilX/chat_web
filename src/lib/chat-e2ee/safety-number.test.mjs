import { describe, expect, test } from "bun:test";
import {
  formatSafetyNumber,
  identityFingerprint,
  safetyNumber,
} from "./safety-number.ts";

// The same vector is pinned in ababilx-mobile's safety_number_test.dart. If one
// side changes, the other has to change with it or two people comparing digits
// across platforms see unrelated numbers.
const ALICE = {
  userId: "11111111-1111-4111-8111-111111111111",
  publicKey: {
    kty: "EC",
    crv: "P-256",
    x: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
    y: "ICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj8",
  },
};
const BOB = {
  userId: "22222222-2222-4222-8222-222222222222",
  publicKey: {
    kty: "EC",
    crv: "P-256",
    x: "QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl8",
    y: "YGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn8",
  },
};

const ALICE_FINGERPRINT = "368748491245674928966846753175";
const BOB_FINGERPRINT = "562881143535833004522062121746";

describe("safety number", () => {
  test("matches the cross-platform vector", async () => {
    expect(await identityFingerprint(ALICE)).toBe(ALICE_FINGERPRINT);
    expect(await identityFingerprint(BOB)).toBe(BOB_FINGERPRINT);
    expect(await safetyNumber(ALICE, BOB)).toBe(ALICE_FINGERPRINT + BOB_FINGERPRINT);
  });

  test("reads the same from either side", async () => {
    expect(await safetyNumber(BOB, ALICE)).toBe(await safetyNumber(ALICE, BOB));
  });

  test("binds the user id, not just the key", async () => {
    const impostor = { ...ALICE, userId: BOB.userId };
    expect(await identityFingerprint(impostor)).not.toBe(ALICE_FINGERPRINT);
  });

  test("changes completely when the key is substituted", async () => {
    const swapped = { ...ALICE, publicKey: BOB.publicKey };
    expect(await identityFingerprint(swapped)).not.toBe(ALICE_FINGERPRINT);
  });

  test("refuses a key that is not a P-256 point", async () => {
    expect(identityFingerprint({ userId: ALICE.userId, publicKey: { kty: "EC" } }))
      .rejects.toThrow();
  });

  test("reads in groups of five", () => {
    expect(formatSafetyNumber(ALICE_FINGERPRINT)).toBe(
      "36874 84912 45674 92896 68467 53175",
    );
  });
});
