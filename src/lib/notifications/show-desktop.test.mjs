import { afterEach, describe, expect, test } from "bun:test";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalNotification = globalThis.Notification;

afterEach(() => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
  globalThis.Notification = originalNotification;
});

describe("showDesktopForNotification", () => {
  test("plays exactly one sound for one desktop notification", async () => {
    let oscillatorStarts = 0;
    const values = new Map();

    class FakeNotification {
      static permission = "granted";
      close() {}
    }
    class FakeAudioContext {
      currentTime = 0;
      destination = {};
      createGain() {
        return {
          connect() {},
          gain: {
            setValueAtTime() {},
            exponentialRampToValueAtTime() {},
          },
        };
      }
      createOscillator() {
        return {
          type: "sine",
          frequency: { setValueAtTime() {} },
          connect() {},
          start() {
            oscillatorStarts += 1;
          },
          stop() {},
          onended: null,
        };
      }
      async close() {}
    }

    globalThis.Notification = FakeNotification;
    globalThis.window = {
      Notification: FakeNotification,
      AudioContext: FakeAudioContext,
      localStorage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
      },
      location: { origin: "https://ababilx.test" },
      focus() {},
    };
    globalThis.document = { hidden: true, hasFocus: () => false };

    const { showDesktopForNotification } = await import("./show-desktop.ts");
    const shown = showDesktopForNotification(
      {
        id: "notification-1",
        title: "Hello",
        body: "World",
        link: "/messages",
        created_at: "2026-09-03T12:00:00Z",
      },
      { serverEnabled: true, navigate() {} },
    );

    expect(shown).toBe(true);
    expect(oscillatorStarts).toBe(1);

    const duplicate = showDesktopForNotification(
      {
        id: "notification-1",
        title: "Hello again",
        body: "World",
        link: "/messages",
        created_at: "2026-09-03T12:00:00Z",
      },
      { serverEnabled: true, navigate() {} },
    );
    expect(duplicate).toBe(false);
    expect(oscillatorStarts).toBe(1);
  });
});
