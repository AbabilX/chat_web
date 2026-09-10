"use client";

import type { ReactNode } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** One slot in the left nav rail: 40px square, icon only, name on hover. */
export default function RailButton({
  label,
  active,
  disabled,
  badge,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip content={label} side="right">
      <button
        type="button"
        aria-label={label}
        aria-current={active ? "page" : undefined}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-[10px] transition-colors",
          disabled && "cursor-not-allowed opacity-35",
          !disabled &&
            active &&
            "bg-[var(--sig-fill-pressed)] text-[var(--sig-label)]",
          !disabled &&
            !active &&
            "text-[var(--sig-label-2)] hover:bg-[var(--sig-fill)] hover:text-[var(--sig-label)]",
        )}
      >
        {children}
        {badge && badge > 0 ? (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-medium text-white"
            style={{ background: "var(--sig-accent)" }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </button>
    </Tooltip>
  );
}
