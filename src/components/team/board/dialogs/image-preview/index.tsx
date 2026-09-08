"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  fitImageToPreviewBounds,
  IMAGE_PREVIEW_ZOOM_SCALE,
  useImagePreviewZoom,
} from "@/components/shared/use-image-preview-zoom";

export default function ImagePreviewDialog({
  open,
  src,
  alt,
  onOpenChange,
  images = [],
  currentIndex,
  onIndexChange,
}: {
  open: boolean;
  src: string | null;
  alt?: string;
  onOpenChange: (open: boolean) => void;
  images?: { src: string; alt?: string }[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}) {
  const [internalIndex, setInternalIndex] = useState(0);

  const isControlled = currentIndex !== undefined && onIndexChange !== undefined;
  const activeIndex = isControlled ? currentIndex : internalIndex;

  const activeImages = images.length > 0 ? images : src ? [{ src, alt }] : [];

  const {
    zoomed,
    pan,
    viewportRef,
    handleViewportMouseMove,
    handleViewportMouseLeave,
    handleImageClick,
  } = useImagePreviewZoom(open, activeIndex);

  const handleIndexChange = (index: number) => {
    if (isControlled) {
      onIndexChange(index);
    } else {
      setInternalIndex(index);
    }
  };

  // Adjust state when prop 'src' or 'open' changes during render (recommended patterns by React team)
  const [prevOpenSrc, setPrevOpenSrc] = useState<string | null>(null);
  if (open && src !== prevOpenSrc) {
    setPrevOpenSrc(src);
    if (!isControlled && src && images.length > 0) {
      const idx = images.findIndex((img) => img.src === src);
      setInternalIndex(idx !== -1 ? idx : 0);
    }
  }

  const prev = () => {
    if (activeImages.length <= 1) return;
    const nextIdx = (activeIndex - 1 + activeImages.length) % activeImages.length;
    handleIndexChange(nextIdx);
  };

  const next = () => {
    if (activeImages.length <= 1) return;
    const nextIdx = (activeIndex + 1) % activeImages.length;
    handleIndexChange(nextIdx);
  };

  // Keep navigation callbacks in a ref to prevent constantly rebinding keyboard listeners
  const callbacksRef = useRef({ prev, next });

  useEffect(() => {
    callbacksRef.current.prev = prev;
    callbacksRef.current.next = next;
  });

  useEffect(() => {
    if (!open || activeImages.length <= 1) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        callbacksRef.current.prev();
      } else if (e.key === "ArrowRight") {
        callbacksRef.current.next();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, activeImages.length]);

  const currentImage = activeImages[activeIndex];
  const imageSrc = currentImage?.src;

  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const [trackedImageSrc, setTrackedImageSrc] = useState(imageSrc);
  const [, setLayoutTick] = useState(0);

  if (trackedImageSrc !== imageSrc) {
    setTrackedImageSrc(imageSrc);
    setNaturalSize(null);
  }

  useEffect(() => {
    if (!open) return;
    const onResize = () => setLayoutTick((n) => n + 1);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const displaySize = naturalSize
    ? fitImageToPreviewBounds(naturalSize.w, naturalSize.h)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-auto max-h-[95vh] max-w-[92vw] gap-0 overflow-hidden p-0 [&>button]:hidden data-[state=open]:[--tw-enter-scale:1] data-[state=closed]:[--tw-exit-scale:1] data-[state=open]:slide-in-from-left-0 data-[state=open]:slide-in-from-top-0 data-[state=closed]:slide-out-to-left-0 data-[state=closed]:slide-out-to-top-0"
        onPointerDownOutside={() => onOpenChange(false)}
      >
        <DialogTitle className="sr-only">
          {currentImage?.alt || alt || "Image preview"}
        </DialogTitle>
        {currentImage ? (
          <div
            ref={viewportRef}
            onMouseMove={handleViewportMouseMove}
            onMouseLeave={handleViewportMouseLeave}
            onClick={handleImageClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleImageClick();
              }
            }}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            style={
              displaySize
                ? { width: displaySize.width, height: displaySize.height }
                : undefined
            }
            className={cn(
              "relative shrink-0 overflow-hidden",
              !displaySize && "h-40 w-64",
              zoomed ? "cursor-zoom-out" : "cursor-zoom-in",
            )}
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt || alt || "Preview"}
              width={displaySize?.width ?? 256}
              height={displaySize?.height ?? 160}
              sizes="(max-width: 960px) 92vw, 960px"
              className={cn(
                "block h-full w-full select-none",
                !displaySize && "opacity-0",
              )}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomed ? IMAGE_PREVIEW_ZOOM_SCALE : 1})`,
                transition: "transform 150ms ease-out",
              }}
              unoptimized
              priority
              draggable={false}
              onLoadingComplete={(img) => {
                const w = img.naturalWidth;
                const h = img.naturalHeight;
                // SVG (and some remote assets) report 0×0 — use a stable box so the
                // dialog is not stuck opacity-0 / collapsed.
                setNaturalSize({
                  w: w > 0 ? w : 512,
                  h: h > 0 ? h : 512,
                });
              }}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pb-3 pt-8 text-center">
              <span className="truncate text-xs text-white/90">
                {currentImage.alt || alt || "Image"}
              </span>
              {activeImages.length > 1 ? (
                <span className="ml-2 tabular-nums text-white/70">
                  {activeIndex + 1} / {activeImages.length}
                </span>
              ) : null}
            </div>

            {activeImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prev();
                  }}
                  className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-black/50 text-white outline-none transition-all hover:bg-black/75 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    next();
                  }}
                  className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-0 bg-black/50 text-white outline-none transition-all hover:bg-black/75 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
