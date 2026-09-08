"use client";

import RemoteScreen from "./remote-screen";

/**
 * Our own camera, mirrored like a mirror is. Sits in a corner of whatever
 * layout is up so the person can see what the other side sees.
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
      <RemoteScreen stream={stream} mirror className="h-full w-full object-cover" />
    </div>
  );
}
