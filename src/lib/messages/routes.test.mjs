import { describe, expect, test } from "bun:test";
import {
  messageBasePath,
  messageConversationHref,
  messageEntryPath,
} from "./routes.ts";

describe("message routes", () => {
  test("keeps a personal conversation on the no-workspace route", () => {
    expect(
      messageConversationHref(
        "/user/messages",
        "5af4c787-1337-4809-817e-d2221fd95144",
      ),
    ).toBe(
      "/user/messages?c=5af4c787-1337-4809-817e-d2221fd95144",
    );
  });

  test("keeps workspace conversations on the workspace route", () => {
    expect(messageBasePath("/user/workspace/messages")).toBe(
      "/user/workspace/messages",
    );
  });

  test("sends a no-team independent-chat user to personal messages", () => {
    expect(messageEntryPath({ hasTeam: false, independentChat: true })).toBe(
      "/user/messages",
    );
    expect(messageEntryPath({ hasTeam: true, independentChat: true })).toBe(
      "/user/workspace/messages",
    );
  });
});
