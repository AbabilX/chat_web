"use client";

import { useEffect, useMemo, useState } from "react";
import { UserAdd01Icon } from "hugeicons-react";
import { toast } from "sonner";
import { api, type ChatConnection } from "@/lib/api";
import { friendlyError } from "@/lib/api/error-messages";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chatInitials } from "../chat-utils";
import { t } from "@/lib/i18n";

/**
 * Admin-only control to add people into a group. Since migration `0145` the
 * server enforces `CanInviteToGroup`: only an accepted connection may be
 * added, whatever workspace the two of you share — so the picker is built
 * from `listChatConnections`, the same roster `CreatePersonalGroupDialog`
 * already uses, never the team's member list.
 */
export default function GroupAddPeople({
  channelId,
  existingMemberIds,
  onAdded,
  language,
}: {
  channelId: string;
  existingMemberIds: Set<string>;
  onAdded: () => void;
  language?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [connections, setConnections] = useState<ChatConnection[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    void api
      .listChatConnections()
      .then((data) => setConnections(data.connections ?? []))
      .catch((e) => toast.error(friendlyError(e, "Failed to load connections")));
  }, [open]);

  const addable = useMemo(
    () => connections.filter((c) => !existingMemberIds.has(c.user.user_id)),
    [connections, existingMemberIds],
  );

  function toggle(userId: string) {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  async function submit() {
    if (selectedIds.length === 0) return;
    setBusy(true);
    try {
      await Promise.all(selectedIds.map((id) => api.addChatChannelMember(channelId, id)));
      setSelectedIds([]);
      setOpen(false);
      onAdded();
    } catch (e) {
      toast.error(friendlyError(e, "Failed to add people"));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-1.5"
        onClick={() => setOpen(true)}
      >
        <UserAdd01Icon size={15} />
        {t(language, "chat.addPeople")}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {addable.length === 0 ? (
        <p className="px-2 py-4 text-center text-xs text-muted-foreground">
          Connect with someone first — a group can only hold people you can
          already message.
        </p>
      ) : (
        <div className="max-h-48 space-y-0.5 overflow-y-auto rounded-md border p-1" style={{ borderColor: "var(--border)" }}>
          {addable.map((connection) => {
            const id = connection.user.user_id;
            const selected = selectedIds.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                  selected
                    ? "bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)]"
                    : "hover:bg-muted",
                )}
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={connection.user.avatar_url} alt="" />
                  <AvatarFallback className="text-[9px]">
                    {chatInitials(connection.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate">{connection.user.name}</span>
                {selected ? (
                  <span className="text-xs font-medium text-[var(--indigo)]">Added</span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          {t(language, "chat.back")}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={busy || selectedIds.length === 0}
          onClick={() => void submit()}
        >
          {t(language, "chat.addPeople")}
        </Button>
      </div>
    </div>
  );
}
