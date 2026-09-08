import { describe, expect, test } from "bun:test";
import { videoDisplaySize } from "./video-fit.ts";

const phone = { width: 1080, height: 2160 };   // portrait call screen
const theater = { width: 1200, height: 700 };  // desktop call window

describe("videoDisplaySize", () => {
  test("same orientation fills the box", () => {
    expect(videoDisplaySize(theater, 1280 / 720)).toEqual(theater);
    expect(videoDisplaySize(phone, 720 / 1280)).toEqual(phone);
  });

  test("portrait camera in a landscape window is capped, not cropped to a torso", () => {
    const size = videoDisplaySize(theater, 720 / 1280);
    expect(size.height).toBe(theater.height);
    expect(size.width).toBeLessThan(theater.width);
    // 56.25% of the frame stays visible — libwebrtc's balanced fraction.
    const visible = (size.height / size.width) / (1280 / 720);
    expect(visible).toBeCloseTo(0.5625, 3);
  });

  test("landscape camera in a portrait screen is capped too", () => {
    const size = videoDisplaySize(phone, 1280 / 720);
    expect(size.width).toBe(phone.width);
    expect(size.height).toBeLessThan(phone.height);
  });

  test("degenerate input returns the box rather than a zero-sized video", () => {
    expect(videoDisplaySize(phone, 0)).toEqual(phone);
    expect(videoDisplaySize(phone, Number.NaN)).toEqual(phone);
    expect(videoDisplaySize({ width: 0, height: 0 }, 1.777)).toEqual({ width: 0, height: 0 });
  });
});
