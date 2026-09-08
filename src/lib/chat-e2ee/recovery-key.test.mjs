// The recovery derivation has to be byte-identical on web and mobile, or a code
// written down on a phone opens nothing in a browser and the user has lost their
// history with no error to point at.
//
// The vector below is fixed, so both sides can assert the same number:
//   HKDF-SHA256(ikm = 00..1f, salt = ff..e0, info = "ababilx-recovery-key-v1")
// The Dart twin is test/features/messages/recovery_key_test.dart.
//
//   node --test src/lib/chat-e2ee/recovery-key.test.mjs
import assert from "node:assert/strict";
import test from "node:test";

const INFO = new TextEncoder().encode("ababilx-recovery-key-v1");
const EXPECTED =
  "74ba6507bcb58eae71adb8b463381c90e18bd461e3f780716225dd89c3fff83f";

async function derive(ikm, salt) {
  const material = await crypto.subtle.importKey("raw", ikm, "HKDF", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: INFO },
    material,
    256,
  );
  return Buffer.from(bits).toString("hex");
}

test("recovery key derivation matches the cross-platform vector", async () => {
  const ikm = new Uint8Array(32).map((_, i) => i);
  const salt = new Uint8Array(32).map((_, i) => 255 - i);
  assert.equal(await derive(ikm, salt), EXPECTED);
});

test("a different salt derives a different key", async () => {
  const ikm = new Uint8Array(32).map((_, i) => i);
  const salt = new Uint8Array(32).fill(1);
  assert.notEqual(await derive(ikm, salt), EXPECTED);
});
