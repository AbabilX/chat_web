import { describe, expect, test } from "bun:test";
import { decryptChatOutboxPayload, encryptChatOutboxEntry } from "./codec";

describe("chat outbox encryption", () => {
  test("round-trips a payload without exposing plaintext bytes", async () => {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const entry = {
      clientMessageId: "5af4c787-1337-4809-817e-d2221fd95144",
      userId: "user-1",
      conversationId: "conversation-1",
      createdAt: 1,
      payload: {
        client_message_id: "5af4c787-1337-4809-817e-d2221fd95144",
        body: "private channel message",
      },
    };

    const encrypted = await encryptChatOutboxEntry(key, entry);
    const bytes = new TextDecoder().decode(encrypted.ciphertext);
    expect(bytes).not.toContain(entry.payload.body);
    await expect(
      decryptChatOutboxPayload(key, encrypted.ciphertext, encrypted.nonce),
    ).resolves.toEqual(entry.payload);
  });
});
