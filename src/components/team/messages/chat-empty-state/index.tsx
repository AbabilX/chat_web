"use client";

import { Call02Icon, ComputerIcon } from "hugeicons-react";
import { t } from "@/lib/i18n";

/** WhatsApp-style empty pane: a card about calling, then pick a chat. */
export default function ChatEmptyState({
  language,
}: {
  language?: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-sm rounded-2xl px-8 py-10 text-center"
        style={{ background: "var(--sig-surface-2)" }}
      >
        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl"
          aria-hidden
          style={{
            background: "color-mix(in srgb, var(--sig-accent) 12%, transparent)",
          }}
        >
          <span className="relative text-[var(--sig-accent)]">
            <ComputerIcon size={56} />
            <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sig-surface-2)]">
              <Call02Icon size={18} />
            </span>
          </span>
        </div>
        <h3 className="text-[20px] font-semibold text-[var(--sig-label)]">
          {t(language, "chat.emptyCallTitle")}
        </h3>
        <p className="mt-2 text-[14px] leading-6 text-[var(--sig-label-2)]">
          {t(language, "chat.emptyCallDesc")}
        </p>
      </div>
      <p className="mt-8 max-w-sm text-center text-[13px] text-[var(--sig-label-2)]">
        {t(language, "chat.emptyDesc")}
      </p>
    </div>
  );
}
