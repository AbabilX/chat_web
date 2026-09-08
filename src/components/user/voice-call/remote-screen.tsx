"use client";

import { useEffect, useRef } from "react";

/** One <video> bound to a MediaStream — remote screen, remote camera or our own. */
export default function RemoteScreen({
  stream,
  mirror = false,
  className = "mt-5 aspect-video w-full rounded-2xl bg-black object-contain",
}: {
  stream: MediaStream;
  /** Our own camera reads naturally only flipped. */
  mirror?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = stream;
    return () => { video.srcObject = null; };
  }, [stream]);
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={mirror}
      className={className}
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    />
  );
}
