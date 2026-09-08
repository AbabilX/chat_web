"use client";

import { useRef, useState } from "react";

export const IMAGE_PREVIEW_ZOOM_SCALE = 1.75;

type Pan = { x: number; y: number };

export function fitImageToPreviewBounds(
  naturalWidth: number,
  naturalHeight: number,
): { width: number; height: number } {
  const maxW =
    typeof window !== "undefined"
      ? Math.min(window.innerWidth * 0.92, 960)
      : 960;
  const maxH =
    typeof window !== "undefined" ? window.innerHeight * 0.95 : 720;

  if (naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: maxW, height: maxH };
  }

  const scale = Math.min(maxW / naturalWidth, maxH / naturalHeight, 1);

  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
}

export function useImagePreviewZoom(open: boolean, resetKey: string | number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewId = `${open}:${resetKey}`;

  const [viewState, setViewState] = useState<{
    viewId: string;
    zoomed: boolean;
    pan: Pan;
  }>({ viewId, zoomed: false, pan: { x: 0, y: 0 } });

  if (viewState.viewId !== viewId) {
    setViewState({ viewId, zoomed: false, pan: { x: 0, y: 0 } });
  }

  const { zoomed, pan } =
    viewState.viewId === viewId
      ? viewState
      : { zoomed: false, pan: { x: 0, y: 0 } };

  const resetView = () => {
    setViewState((s) => ({ ...s, zoomed: false, pan: { x: 0, y: 0 } }));
  };

  const handleViewportMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;

    const el = viewportRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    const maxPanX = rect.width * ((IMAGE_PREVIEW_ZOOM_SCALE - 1) / 2);
    const maxPanY = rect.height * ((IMAGE_PREVIEW_ZOOM_SCALE - 1) / 2);

    setViewState((s) => ({
      ...s,
      pan: {
        x: -relX * maxPanX * 2,
        y: -relY * maxPanY * 2,
      },
    }));
  };

  const handleViewportMouseLeave = () => {
    if (zoomed) {
      setViewState((s) => ({ ...s, pan: { x: 0, y: 0 } }));
    }
  };

  const handleImageClick = () => {
    if (zoomed) {
      resetView();
      return;
    }
    setViewState((s) => ({ ...s, zoomed: true }));
  };

  return {
    zoomed,
    pan,
    viewportRef,
    handleViewportMouseMove,
    handleViewportMouseLeave,
    handleImageClick,
  };
}
