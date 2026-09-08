"use client";

import { useEffect, useRef, type CSSProperties } from "react";

/** One <video> bound to a MediaStream — remote screen, remote camera or our own. */
export default function RemoteScreen({
  stream,
  mirror = false,
  className = "mt-5 aspect-video w-full rounded-2xl bg-black object-contain",
  style,
  onIntrinsicSize,
}: {
  stream: MediaStream;
  /** Our own camera reads naturally only flipped. */
  mirror?: boolean;
  className?: string;
  style?: CSSProperties;
  /**
   * The frame's own size, as the element learns it. Reported again on the
   * `resize` event, not only once: the far side flipping a camera or rotating
   * a phone changes the shape of a live track.
   */
  onIntrinsicSize?: (size: { width: number; height: number }) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    return () => { video.srcObject = null; };
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onIntrinsicSize) return;
    const report = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        onIntrinsicSize({ width: video.videoWidth, height: video.videoHeight });
      }
    };
    report();
    video.addEventListener("loadedmetadata", report);
    video.addEventListener("resize", report);
    return () => {
      video.removeEventListener("loadedmetadata", report);
      video.removeEventListener("resize", report);
    };
  }, [onIntrinsicSize, stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={mirror}
      className={className}
      style={mirror ? { ...style, transform: "scaleX(-1)" } : style}
    />
  );
}
