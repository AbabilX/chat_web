"use client";

import { UserAdd01Icon } from "hugeicons-react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

export default function ConversationListHeader({
  unreadOnly,
  onToggleUnread,
  language,
  onOpenPeople,
}: {
  unreadOnly: boolean;
  onToggleUnread: (value: boolean) => void;
  language?: string | null;
  /** Only passed while independent chat is on — otherwise no button renders. */
  onOpenPeople?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 px-2 py-2">
      <span className="min-w-0 flex-1 truncate px-1 text-sm font-bold text-[var(--text)]">
        {t(language, "chat.chats")}
      </span>
      <div className="flex shrink-0 items-center gap-1.5 rounded-md px-1 py-0.5">
        <span className="whitespace-nowrap text-[10px] font-medium text-muted-foreground">
          {t(language, "chat.unreadOnly")}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={unreadOnly}
          aria-label={t(language, "chat.unreadOnly")}
          onClick={() => onToggleUnread(!unreadOnly)}
          className={cn(
            "relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indigo)]",
            unreadOnly
              ? "bg-[var(--indigo)]"
              : "border border-[var(--border)] bg-[var(--surface2)]",
          )}
        >
          <span
            className={cn(
              "absolute top-[2px] left-[2px] h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
              unreadOnly && "translate-x-3",
            )}
          />
        </button>
      </div>
      {onOpenPeople ? (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={onOpenPeople}
            aria-label="Add people"
            title="Add people — find someone by username, email or phone"
            className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface2)] text-muted-foreground transition-colors hover:border-[var(--indigo)] hover:bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)] hover:text-[var(--text)]"
          >
            <UserAdd01Icon size={13} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
