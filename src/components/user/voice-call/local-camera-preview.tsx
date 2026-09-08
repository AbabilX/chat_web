"use client";

import BalancedVideo from "./balanced-video";

/**
 * Our own camera, mirrored like a mirror is. Sits in a corner of whatever
 * layout is up so the person can see what the other side sees.
 *
 * Balanced rather than cropped for the same reason the stage is: this tile is
 * portrait in the theater and landscape in the dock, and a webcam is neither
 * shape in both.
 */
export default function LocalCameraPreview({
  stream,
  className = "",
}: {
  stream: MediaStream;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/20 bg-black shadow-lg ${className}`}
      aria-label="Your camera"
    >
      <BalancedVideo stream={stream} mirror className="h-full w-full" />
    </div>
  );
}
