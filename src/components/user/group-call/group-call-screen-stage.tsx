"use client";

import { useEffect, useRef } from "react";
import type { GroupScreenView } from "./group-call-context";

export default function GroupCallScreenStage({ screen }: { screen: GroupScreenView }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = screen.stream;
    void video.play().catch(() => {
      // Autoplay refusal on a muted video is harmless; the poster frame stays.
    });
    return () => {
      video.srcObject = null;
    };
  }, [screen.stream]);

  return (
    <section className="relative min-h-[240px] flex-1 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface2)] shadow-2xl">
      <video ref={videoRef} autoPlay playsInline muted className="h-full w-full bg-black object-contain" />
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-1.5 text-xs text-[var(--text)] backdrop-blur">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--green)]" />
        {screen.isLocal ? "You are sharing" : `${screen.participantName}'s screen`}
      </div>
    </section>
  );
}
