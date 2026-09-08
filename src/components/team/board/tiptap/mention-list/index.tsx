"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { SuggestionKeyDownProps } from "@tiptap/suggestion";
import { UserGroupIcon } from "hugeicons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { memberMentionLabel } from "../utils";

export type MentionSuggestionItem = {
  id: string;
  label: string;
  avatarUrl?: string;
  /** "all" for the @all / @everyone broadcast entries (rendered with a group icon). */
  special?: "all";
};

/** Sentinel mention IDs that expand to every conversation member on send. */
export const MENTION_ALL_IDS = ["__all__", "__everyone__"];

export function isMentionAllId(id: string): boolean {
  return MENTION_ALL_IDS.includes(id);
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const MentionList = forwardRef<
  { onKeyDown: (props: SuggestionKeyDownProps) => boolean },
  {
    items: MentionSuggestionItem[];
    command: (item: MentionSuggestionItem) => void;
  }
>(function MentionList({ items, command }, ref) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.children[selectedIndex] as HTMLElement | null;
    if (activeEl) {
      activeEl.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [selectedIndex]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((i) => (i + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div
        className="rounded-md border bg-[var(--surface2)] p-2 text-xs text-[var(--text-muted)] shadow-md animate-fade-in"
        style={{ borderColor: "var(--border)" }}
      >
        No members found
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="max-h-52 overflow-y-auto rounded-md border bg-[var(--surface2)] p-1 shadow-md animate-fade-in"
      style={{ borderColor: "var(--border)" }}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={cn(
            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
            index === selectedIndex
              ? "bg-[var(--indigo-glow)] text-[var(--indigo-light)] font-medium"
              : "text-[var(--text)] hover:bg-white/5",
          )}
          onClick={() => command(item)}
        >
          {item.special === "all" ? (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--indigo-glow)] text-[var(--indigo-light)]">
              <UserGroupIcon size={13} />
            </span>
          ) : (
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={item.avatarUrl} alt={item.label} />
              <AvatarFallback className="text-[9px] bg-[var(--surface3)] text-[var(--text-muted)]">{initials(item.label)}</AvatarFallback>
            </Avatar>
          )}
          <span className="truncate">{item.label}</span>
          {item.special === "all" ? (
            <span className="ml-auto shrink-0 text-[10px] text-[var(--text-muted)]">
              Notify all
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
});

export default MentionList;

export function mentionItemsFromMembers(
  members: { user_id: string; name?: string; github_username?: string; avatar_url?: string }[],
  query: string,
  allowMentionAll = false,
): MentionSuggestionItem[] {
  const q = query.trim().toLowerCase();

  const specials: MentionSuggestionItem[] =
    allowMentionAll && members.length > 1
      ? (
          [
            { id: "__all__", label: "all" },
            { id: "__everyone__", label: "everyone" },
          ] as const
        )
          .filter((s) => !q || s.label.startsWith(q))
          .map((s) => ({ id: s.id, label: s.label, special: "all" as const }))
      : [];

  const people = members
    .filter((m) => {
      if (!q) return true;
      const label = memberMentionLabel(m).toLowerCase();
      return label.includes(q);
    })
    .slice(0, 8)
    .map((m) => ({
      id: m.user_id,
      label: memberMentionLabel(m),
      avatarUrl: m.avatar_url,
    }));

  return [...specials, ...people];
}
