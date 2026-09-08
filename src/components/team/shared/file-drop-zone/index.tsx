"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FileDropOverlay } from "./file-drop-overlay";
import { useFileDropZone } from "./use-file-drop-zone";

export function FileDropZone({
  disabled,
  onFiles,
  className,
  children,
}: {
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  className?: string;
  children: ReactNode;
}) {
  const { rootRef, dragActive, handlers } = useFileDropZone({
    disabled,
    onFiles,
    captureDocumentPaste: true,
  });

  return (
    <div ref={rootRef} className={cn("relative", className)} {...handlers}>
      {children}
      {dragActive ? <FileDropOverlay /> : null}
    </div>
  );
}
