import { describe, expect, test } from "bun:test";
import { generateLocalMessagingDevice, samePublicKey } from "./keys.ts";

describe("messaging device identity", () => {
  test("keeps the persisted private key non-extractable", async () => {
    const userId = "10000000-0000-4000-8000-000000000001";
    const device = await generateLocalMessagingDevice(
      userId,
      "00000000-0000-4000-8000-000000000001",
    );

    expect(device.id).toBe(userId);
    expect(device.privateKey.extractable).toBe(false);
    expect(device.publicKey.kty).toBe("EC");
    expect(device.publicKey.crv).toBe("P-256");
    expect(device.publicKey.d).toBeUndefined();
  });

  test("compares public identities by curve coordinates", async () => {
    const device = await generateLocalMessagingDevice(
      "10000000-0000-4000-8000-000000000002",
      "00000000-0000-4000-8000-000000000002",
    );
    expect(samePublicKey(device.publicKey, { ...device.publicKey })).toBe(true);
    expect(
      samePublicKey(device.publicKey, { ...device.publicKey, x: "bad" }),
    ).toBe(false);
  });
});
