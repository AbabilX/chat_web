"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api, type ChatConversation } from "@/lib/api";
import { friendlyError } from "@/lib/api/error-messages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CHANNEL_NAME_MAX, slugifyChannel } from "./create-channel/channel-slug";
import WebhookAvatarField from "./create-channel/webhook-avatar-field";
import WebhookCreatedStep from "./create-channel/webhook-created-step";
import { t } from "@/lib/i18n";

/**
 * A read-only feed — members see incoming messages, nobody replies. No
 * visibility step and no member picker: since migration `0145` a feed has no
 * roster to pick from at creation, the same as `CreatePersonalWebhookFeed` on
 * the server ignores `is_private`.
 */
export default function CreateWebhookFeedDialog({
  open,
  onOpenChange,
  language,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language?: string | null;
  onCreated: (conv: ChatConversation) => void;
}) {
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [webhookURL, setWebhookURL] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    setName("");
    setAvatarFile(null);
    setWebhookURL("");
    setBusy(false);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) reset();
  }

  async function submit() {
    if (!slugifyChannel(name)) return;
    setBusy(true);
    try {
      const webhook = await api.createChatWebhookChannel({ name: name.trim() });
      onCreated(webhook.conversation);
      setWebhookURL(webhook.url);
      if (avatarFile) {
        try {
          await api.uploadChatWebhookAvatar(webhook.conversation.id, avatarFile);
        } catch (error) {
          toast.warning(friendlyError(error, "Feed created, but avatar upload failed"));
        }
      }
    } catch (e) {
      toast.error(friendlyError(e, "Failed to create feed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-0 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New feed</DialogTitle>
        </DialogHeader>

        {webhookURL ? (
          <WebhookCreatedStep url={webhookURL} onDone={() => handleOpenChange(false)} />
        ) : (
          <>
            <div className="space-y-2 py-1">
              <Label htmlFor="webhook-feed-name">{t(language, "chat.channelName")}</Label>
              <Input
                id="webhook-feed-name"
                autoFocus
                value={name}
                maxLength={CHANNEL_NAME_MAX}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(language, "chat.channelNamePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && slugifyChannel(name)) {
                    e.preventDefault();
                    void submit();
                  }
                }}
              />
              <WebhookAvatarField file={avatarFile} onChange={setAvatarFile} />
            </div>
            <DialogFooter>
              <Button
                type="button"
                disabled={busy || !slugifyChannel(name)}
                onClick={() => void submit()}
              >
                {busy ? t(language, "chat.creating") : t(language, "chat.create")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
