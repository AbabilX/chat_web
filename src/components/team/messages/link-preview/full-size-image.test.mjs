import { expect, test } from "bun:test";
import { isFullSizePreviewImage } from "./full-size-image.ts";

test("a wide og:image leads the card", () => {
  expect(isFullSizePreviewImage(1200, 630)).toBe(true);
  expect(isFullSizePreviewImage(480, 360)).toBe(true);
});

test("a square image is a logo and stays a thumbnail", () => {
  expect(isFullSizePreviewImage(512, 512)).toBe(false);
  expect(isFullSizePreviewImage(500, 490)).toBe(false);
});

test("a small image stays a thumbnail whatever its shape", () => {
  expect(isFullSizePreviewImage(199, 400)).toBe(false);
  expect(isFullSizePreviewImage(400, 100)).toBe(false);
});

test("an unmeasured image is not a hero", () => {
  expect(isFullSizePreviewImage(0, 0)).toBe(false);
});
