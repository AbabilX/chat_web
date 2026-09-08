"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { videoDisplaySize } from "@/lib/calls/video-fit";
import RemoteScreen from "./remote-screen";

/**
 * A camera drawn the way Signal draws one: filling its box when the two share
 * an orientation, and cropped only as far as `videoDisplaySize` allows when
 * they do not — a phone calling a laptop, which is most cross-device calls.
 *
 * Plain `object-cover` is what this replaces. It slices a 16:9 webcam down to a
 * vertical strip on a portrait screen, and beheads a portrait phone camera in a
 * landscape window; neither reads as a person.
 */
export default function BalancedVideo({
  stream,
  mirror = false,
  className = "",
}: {
  stream: MediaStream;
  mirror?: boolean;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [frame, setFrame] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setBox({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Stable identity: RemoteScreen re-subscribes its listeners whenever this
  // changes, and a fresh closure every render would do that on every render.
  const onIntrinsicSize = useCallback((size: { width: number; height: number }) => {
    setFrame((prev) =>
      prev.width === size.width && prev.height === size.height ? prev : size,
    );
  }, []);

  const measured = box.width > 0 && frame.width > 0 && frame.height > 0;
  const size = measured
    ? videoDisplaySize(box, frame.width / frame.height)
    : null;

  return (
    <div
      ref={boxRef}
      className={`flex items-center justify-center overflow-hidden bg-black ${className}`}
    >
      <RemoteScreen
        stream={stream}
        mirror={mirror}
        onIntrinsicSize={onIntrinsicSize}
        className="object-cover"
        style={size ? { width: size.width, height: size.height } : { width: "100%", height: "100%" }}
      />
    </div>
  );
}
