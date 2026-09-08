import { describe, expect, test } from "bun:test";
import { EventIdDeduper } from "./event-id-deduper.ts";

describe("EventIdDeduper", () => {
  test("admits a logical event only once", () => {
    const deduper = new EventIdDeduper();
    expect(deduper.remember("notification-1")).toBe(true);
    expect(deduper.remember("notification-1")).toBe(false);
  });

  test("keeps bounded memory", () => {
    const deduper = new EventIdDeduper(2);
    deduper.remember("notification-1");
    deduper.remember("notification-2");
    deduper.remember("notification-3");
    expect(deduper.remember("notification-1")).toBe(true);
  });
});
