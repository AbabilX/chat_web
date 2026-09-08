"use client";

import { useState } from "react";
import { Link04Icon } from "hugeicons-react";
import type { ChatConversation, ChatMessage, WallPost } from "@/lib/api";
import type { TeamMember } from "@/lib/api/types/team";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { t } from "@/lib/i18n";
import ForwardTargetList from "./forward-target-list";
import { useForwardSend } from "./use-forward-send";

export default function ForwardDialog({
  open,
  onOpenChange,
  message,
  wallPost,
  channels,
  members,
  language,
  currentUserId,
  onCopyLink,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Forward a chat message. Mutually exclusive with `wallPost`. */
  message?: ChatMessage | null;
  /** Forward a wall post. Mutually exclusive with `message`. */
  wallPost?: WallPost | null;
  channels: ChatConversation[];
  members: TeamMember[];
  language?: string | null;
  /** Needed to encrypt the forward for each DM destination. */
  currentUserId?: string;
  /** Wall-post-only: copy a direct link to the post instead of forwarding. */
  onCopyLink?: () => void;
}) {
  const [convIds, setConvIds] = useState<Set<string>>(new Set());
  const [userIds, setUserIds] = useState<Set<string>>(new Set());
  const [caption, setCaption] = useState("");
  const { busy, send } = useForwardSend({
    message,
    wallPost,
    currentUserId,
    language,
    onDone: () => onOpenChange(false),
  });

  const total = convIds.size + userIds.size;

  function toggle(set: Set<string>, id: string) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pr-6">
          <DialogTitle>{t(language, "chat.forward")}</DialogTitle>
          {onCopyLink ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={onCopyLink}
            >
              <Link04Icon size={14} />
              {t(language, "chat.copyLink")}
            </Button>
          ) : null}
        </DialogHeader>

        <ForwardTargetList
          channels={channels}
          members={members}
          selectedConvIds={convIds}
          selectedUserIds={userIds}
          onToggleConv={(id) => setConvIds((s) => toggle(s, id))}
          onToggleUser={(id) => setUserIds((s) => toggle(s, id))}
          language={language}
        />

        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={t(language, "chat.forwardCaptionPlaceholder")}
          rows={2}
          maxLength={2000}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {t(language, "chat.back")}
          </Button>
          <Button
            type="button"
            disabled={busy || total === 0}
            onClick={() =>
              void send(
                channels.filter((channel) => convIds.has(channel.id)),
                [...userIds],
                caption,
              )
            }
          >
            {busy
              ? t(language, "chat.creating")
              : total > 0
                ? `${t(language, "chat.forward")} (${total})`
                : t(language, "chat.forward")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
