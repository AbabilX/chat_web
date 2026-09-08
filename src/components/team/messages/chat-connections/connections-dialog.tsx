"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ConnectionSearchTab from "./connection-search-tab";
import ConnectionList from "./connection-list";
import { useConnections } from "./use-connections";

type Tab = "search" | "connections";

const TABS: Array<{ value: Tab; label: string }> = [
  { value: "search", label: "Find people" },
  { value: "connections", label: "Connections" },
];

/**
 * The personal side of messaging: find someone, and manage who you are already
 * talking to. There is no Requests tab — a message request is answered inside
 * the thread it arrived in, the way Signal does it, so it can be read before
 * it is answered.
 */
export default function ConnectionsDialog({
  open,
  onOpenChange,
  onMessage,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMessage: (userId: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("search");
  const { connections, disconnect, block } = useConnections(open);

  function handleMessage(userId: string) {
    onOpenChange(false);
    onMessage(userId);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>People</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={cn(
                "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                tab === item.value
                  ? "bg-[var(--indigo)] text-white"
                  : "border border-[var(--border)] bg-[var(--surface2)] text-muted-foreground hover:text-[var(--text)]",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "search" ? (
          <ConnectionSearchTab onMessage={handleMessage} />
        ) : (
          <ConnectionList
            connections={connections}
            onMessage={handleMessage}
            onDisconnect={disconnect}
            onBlock={block}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
