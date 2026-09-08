"use client";

import { useRef, type ReactNode } from "react";

/**
 * A click target that opens the file picker and hands back one image.
 *
 * The input is reset on every change so choosing the same file twice still
 * fires — a retry after a failed upload is exactly that case.
 */
export default function GroupImagePicker({
  label,
  disabled,
  onPick,
  className,
  children,
}: {
  label: string;
  disabled?: boolean;
  onPick: (file: File) => void;
  className?: string;
  children: ReactNode;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={() => fileRef.current?.click()}
        className={className}
      >
        {children}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </>
  );
}
