"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, type ChatConversation, type ChatConnection } from "@/lib/api";
import { friendlyError } from "@/lib/api/error-messages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { chatInitials } from "../chat-utils";

/**
 * A group that belongs to no workspace. Only people the creator can already
 * message are selectable, which the server enforces again on submit.
 */
export default function CreatePersonalGroupDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversation: ChatConversation) => void;
}) {
  const [name, setName] = useState("");
  const [candidates, setCandidates] = useState<ChatConnection[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // The roster loads after the request resolves; the form itself is reset on
  // close, which is an event rather than a render effect.
  useEffect(() => {
    if (!open) return;
    void api
      .listChatConnections()
      .then((data) => setCandidates(data.connections ?? []))
      .catch((e) => toast.error(friendlyError(e, "Failed to load connections")));
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setSelected([]);
    }
    onOpenChange(next);
  }

  function toggle(userId: string) {
    setSelected((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("Give the group a name");
      return;
    }
    setSaving(true);
    try {
      const conv = await api.createPersonalGroup(name.trim(), selected);
      handleOpenChange(false);
      onCreated(conv);
    } catch (e) {
      toast.error(friendlyError(e, "Failed to create group"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New personal group</DialogTitle>
        </DialogHeader>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          autoFocus
        />

        <div className="max-h-56 space-y-0.5 overflow-y-auto">
          {candidates.length === 0 ? (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              Connect with someone first — a personal group can only hold people
              you can already message.
            </p>
          ) : (
            candidates.map((connection) => {
              const id = connection.user.user_id;
              const active = selected.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left",
                    active
                      ? "bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)]"
                      : "hover:bg-[var(--surface2)]",
                  )}
                >
                  <Avatar className="h-8 w-8 rounded-md">
                    <AvatarImage src={connection.user.avatar_url} alt="" />
                    <AvatarFallback className="rounded-md text-[10px]">
                      {chatInitials(connection.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {connection.user.name}
                  </span>
                  {active ? (
                    <span className="text-xs font-medium text-[var(--indigo)]">Added</span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        <Button type="button" onClick={submit} disabled={saving}>
          {saving ? "Creating…" : "Create group"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
