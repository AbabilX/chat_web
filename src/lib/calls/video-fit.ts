/**
 * libwebrtc's `RendererCommon.getDisplaySize`, in TypeScript — the rule Signal
 * uses for a camera tile (`SCALE_ASPECT_FILL` when the video and the view share
 * an orientation, `SCALE_ASPECT_BALANCED` when they do not).
 *
 * It exists because "fill the box" and "fit in the box" are both wrong when a
 * phone's portrait camera lands in a laptop's landscape call window. Filling
 * crops the head and shoulders off; fitting leaves the person in a narrow strip
 * between two black slabs.
 *
 * Balanced is the middle: crop, but never past MIN_VISIBLE_FRACTION of the
 * frame, and letterbox whatever the crop could not cover. The returned size is
 * the box to draw the video into with `object-fit: cover`; centre it on black.
 */
const MIN_VISIBLE_FRACTION = 0.5625;

export type VideoBox = { width: number; height: number };

export function videoDisplaySize(box: VideoBox, videoAspect: number): VideoBox {
  if (!(box.width > 0) || !(box.height > 0) || !(videoAspect > 0)) return box;
  const boxAspect = box.width / box.height;
  // Same side of 1.0 = same orientation. Two landscapes of different shapes
  // still crop freely: that difference is small enough that nobody notices,
  // and Signal treats it the same way.
  if (videoAspect > 1 === boxAspect > 1) return box;
  return {
    width: Math.min(box.width, (box.height / MIN_VISIBLE_FRACTION) * videoAspect),
    height: Math.min(box.height, box.width / MIN_VISIBLE_FRACTION / videoAspect),
  };
}
