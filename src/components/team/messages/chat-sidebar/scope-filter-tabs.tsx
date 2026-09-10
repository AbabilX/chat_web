"use client";

import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { useChatStore, type ChatScopeFilter } from "@/store/chat-store";

const TABS: Array<{ value: ChatScopeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "personal", label: "Personal" },
  { value: "workspace", label: "Workspaces" },
];

/**
 * All | Personal | Workspaces. Hidden entirely while independent chat is off,
 * so the workspace-only sidebar looks exactly as it always has.
 */
export default function ScopeFilterTabs() {
  const { independentChat, scopeFilter, setScopeFilter } = useChatStore(
    useShallow((s) => ({
      independentChat: s.independentChat,
      scopeFilter: s.scopeFilter,
      setScopeFilter: s.setScopeFilter,
    })),
  );

  if (!independentChat) return null;

  return (
    <div className="flex shrink-0 items-center gap-1 px-3 pb-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => setScopeFilter(tab.value)}
          aria-pressed={scopeFilter === tab.value}
          className={cn(
            "flex-1 rounded-full px-2 py-1 text-[12px] font-medium transition-colors",
            scopeFilter === tab.value
              ? "bg-[var(--sig-fill-pressed)] text-[var(--sig-label)]"
              : "text-[var(--sig-label-2)] hover:bg-[var(--sig-fill)] hover:text-[var(--sig-label)]",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
