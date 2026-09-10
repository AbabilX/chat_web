"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Signal's `Lightbox__nav-prev` / `--next`: a quarter-width, 96px-capped click
 * zone down each side, its chevron invisible until the cursor is over it.
 */
export default function MediaLightboxNav({ onStep }: { onStep: (delta: number) => void }) {
  const zone =
    "absolute inset-y-0 flex w-1/4 max-w-24 items-center opacity-0 transition-opacity hover:opacity-100";
  const stop = (event: React.MouseEvent, delta: number) => {
    event.stopPropagation();
    onStep(delta);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Previous"
        onClick={(event) => stop(event, -1)}
        className={`${zone} start-0 justify-start ps-4`}
      >
        <ChevronLeft className="h-8 w-8 drop-shadow" style={{ color: "var(--sig-label)" }} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={(event) => stop(event, 1)}
        className={`${zone} end-0 justify-end pe-4`}
      >
        <ChevronRight className="h-8 w-8 drop-shadow" style={{ color: "var(--sig-label)" }} />
      </button>
    </>
  );
}
