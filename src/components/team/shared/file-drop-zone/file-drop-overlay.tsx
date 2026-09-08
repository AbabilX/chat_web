import { FileAddIcon } from "hugeicons-react";
import { cn } from "@/lib/utils";

export function FileDropOverlay({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-30 flex items-center justify-center animate-fade-in",
        className,
      )}
      style={{
        background: "color-mix(in srgb, var(--bg) 58%, transparent)",
      }}>
      {compact ? null : (
        <div
          aria-hidden
          className="absolute inset-3 rounded-xl border-2 border-dashed border-indigo-400/45"
        />
      )}
      <div
        className={cn(
          "relative mx-4 flex flex-col items-center rounded-2xl border border-dashed border-indigo-400/70 bg-[var(--surface)]/92 shadow-2xl shadow-indigo-500/20 backdrop-blur-md",
          compact ? "gap-2 px-5 py-4" : "gap-3 px-8 py-7",
        )}>
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-400",
            compact ? "h-11 w-11" : "h-16 w-16",
          )}>
          <FileAddIcon size={compact ? 22 : 32} />
        </div>
        <p
          className={cn(
            "font-semibold text-[var(--text)]",
            compact ? "text-xs" : "text-sm",
          )}>
          Drop files to attach
        </p>
        {compact ? null : (
          <p className="text-xs text-muted-foreground">
            Release to add them to your message
          </p>
        )}
      </div>
    </div>
  );
}
