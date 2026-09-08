"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Delete02Icon,
  Mic01Icon,
  PauseIcon,
  PlayIcon,
  SentIcon,
} from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatVoiceTimer } from "./voice-recorder";

const MAX_VOICE_MS = 60_000;

export default function VoiceRecordingBar({
  elapsedMs,
  preparing,
  uploading,
  paused,
  onDelete,
  onPauseToggle,
  onSend,
}: {
  elapsedMs: number;
  preparing?: boolean;
  uploading?: boolean;
  paused?: boolean;
  onDelete: () => void;
  onPauseToggle: () => void;
  onSend: () => void;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (preparing || uploading || paused) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 120);
    return () => window.clearInterval(id);
  }, [preparing, uploading, paused]);

  const bars = useMemo(() => {
    void tick;
    return Array.from({ length: 28 }, (_, i) => {
      const wave = Math.sin((tick + i) * 0.55) * 0.5 + 0.5;
      const h = paused || preparing || uploading ? 4 : 4 + wave * 14;
      return h;
    });
  }, [tick, paused, preparing, uploading]);

  const label = preparing
    ? "Starting…"
    : uploading
      ? "Sending…"
      : formatVoiceTimer(elapsedMs);

  return (
    <div
      className="flex items-center gap-2 rounded-xl border px-2 py-2"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300"
        disabled={uploading}
        aria-label="Delete recording"
        onClick={onDelete}
      >
        <Delete02Icon size={18} />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            paused || preparing || uploading
              ? "bg-white/10 text-muted-foreground"
              : "bg-rose-500/20 text-rose-400",
          )}
        >
          <Mic01Icon size={14} />
        </span>
        <div className="flex h-8 min-w-0 flex-1 items-end gap-[2px] overflow-hidden px-1">
          {bars.map((h, i) => (
            <span
              key={i}
              className="w-[3px] shrink-0 rounded-full bg-rose-400/80"
              style={{ height: h }}
            />
          ))}
        </div>
        <span className="shrink-0 tabular-nums text-xs font-semibold text-[var(--text)]">
          {label}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-white/10 hover:text-[var(--text)]"
        disabled={preparing || uploading}
        aria-label={paused ? "Resume" : "Pause"}
        onClick={onPauseToggle}
      >
        {paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
      </Button>

      <Button
        type="button"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-full"
        disabled={preparing || uploading || elapsedMs < 400}
        aria-label="Send voice message"
        onClick={onSend}
      >
        <SentIcon size={16} className={cn(uploading && "animate-pulse")} />
      </Button>

      {!preparing && !uploading && elapsedMs >= MAX_VOICE_MS - 5000 ? (
        <span className="sr-only">Almost at 60 second limit</span>
      ) : null}
    </div>
  );
}
