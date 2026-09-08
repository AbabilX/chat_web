"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { filesFromDataTransfer, hasDraggedFiles } from "./files-from-transfer";

function isOutsideEditable(
  target: EventTarget | null,
  root: HTMLElement | null,
): boolean {
  if (!(target instanceof Element) || !root) return false;
  if (root.contains(target)) return false;
  return !!target.closest("input, textarea, select, [contenteditable='true']");
}

function shouldAcceptPaste(
  root: HTMLElement | null,
  target: EventTarget | null,
  hovered: boolean,
): boolean {
  if (!root) return false;
  const active = document.activeElement;
  if (isOutsideEditable(target, root) || isOutsideEditable(active, root)) {
    return false;
  }
  if (target instanceof Node && root.contains(target)) return true;
  if (active && root.contains(active)) return true;
  const focusOnPageChrome =
    !active ||
    active === document.body ||
    active === document.documentElement;
  return hovered && focusOnPageChrome;
}

export function useFileDropZone({
  disabled,
  onFiles,
  captureDocumentPaste = false,
}: {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  captureDocumentPaste?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const hoveredRef = useRef(false);
  const onFilesRef = useRef(onFiles);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    onFilesRef.current = onFiles;
  }, [onFiles]);

  const takeFiles = useCallback(
    (files: File[]) => {
      if (disabled || files.length === 0) return;
      onFilesRef.current(files);
    },
    [disabled],
  );

  useEffect(() => {
    if (!captureDocumentPaste || disabled) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = filesFromDataTransfer(e.clipboardData);
      if (files.length === 0) return;
      if (!shouldAcceptPaste(rootRef.current, e.target, hoveredRef.current)) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      takeFiles(files);
    };
    document.addEventListener("paste", onPaste, true);
    return () => document.removeEventListener("paste", onPaste, true);
  }, [captureDocumentPaste, disabled, takeFiles]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (disabled) return;
      const files = filesFromDataTransfer(e.clipboardData);
      if (files.length === 0) return;
      e.preventDefault();
      takeFiles(files);
    },
    [disabled, takeFiles],
  );

  const handleDragEnter = (e: React.DragEvent) => {
    if (disabled || !hasDraggedFiles(e)) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragActive(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (disabled || !hasDraggedFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!hasDraggedFiles(e)) return;
    const root = rootRef.current;
    const next = e.relatedTarget;
    if (root && next instanceof Node && root.contains(next)) return;
    dragDepth.current = 0;
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    dragDepth.current = 0;
    setDragActive(false);
    if (disabled || !hasDraggedFiles(e)) return;
    e.preventDefault();
    takeFiles(Array.from(e.dataTransfer.files));
  };

  return {
    rootRef,
    dragActive,
    handlers: {
      onPaste: handlePaste,
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onMouseEnter: () => {
        hoveredRef.current = true;
      },
      onMouseLeave: () => {
        hoveredRef.current = false;
      },
    },
  };
}
