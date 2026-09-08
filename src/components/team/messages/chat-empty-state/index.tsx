"use client";

import {
  MessageMultiple01Icon,
  Message01Icon,
  SparklesIcon,
  UserGroup02Icon,
  ZapIcon,
} from "hugeicons-react";
import { t } from "@/lib/i18n";

export default function ChatEmptyState({ language }: { language?: string | null }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--indigo)_6%,transparent)] blur-3xl"
        aria-hidden
      />
      <div
        className="relative mb-7 flex h-36 w-36 items-center justify-center"
        aria-hidden
      >
        <div className="absolute inset-0 rounded-[2.5rem] bg-[color-mix(in_srgb,var(--indigo)_25%,transparent)] blur-2xl" />
        <div
          className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/20 shadow-2xl shadow-[var(--indigo-glow)]"
          style={{
            background:
              "linear-gradient(145deg, var(--indigo-light) 0%, var(--indigo) 100%)",
            transform: "perspective(400px) rotateX(8deg) rotateY(-12deg)",
          }}
        >
          <span className="text-white">
            <MessageMultiple01Icon size={52} strokeWidth={1.6} />
          </span>
          <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[var(--surface)] text-[var(--text)] shadow-lg">
            <SparklesIcon size={14} />
          </span>
        </div>
      </div>
      <div className="relative max-w-md text-center">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Workspace conversations
        </p>
        <h3 className="text-xl font-semibold tracking-tight text-[var(--text)]">
          {t(language, "chat.emptyTitle")}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          {t(language, "chat.emptyDesc")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2" aria-hidden="true">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <Message01Icon size={14} /> Direct messages
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <UserGroup02Icon size={14} /> Team channels
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)]/70 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
            <ZapIcon size={14} /> Stay in sync
          </span>
        </div>
      </div>
    </div>
  );
}
