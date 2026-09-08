"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserGroupIcon } from "hugeicons-react";
import { api, type ChatConversation } from "@/lib/api";
import type { TeamMember } from "@/lib/api/types/team";
import { friendlyError } from "@/lib/api/error-messages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { slugifyChannel } from "./create-channel/channel-slug";
import ChannelNameStep from "./create-channel/channel-name-step";
import ChannelVisibilityStep from "./create-channel/channel-visibility-step";
import WebhookCreatedStep from "./create-channel/webhook-created-step";

type Step = "name" | "visibility";

export default function CreateChannelDialog({
  open,
  onOpenChange,
  members,
  currentUserId,
  teamName,
  language,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: TeamMember[];
  currentUserId: string;
  teamName: string;
  language?: string | null;
  onCreated: (conv: ChatConversation) => void;
}) {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [webhookOnly, setWebhookOnly] = useState(false);
  const [webhookURL, setWebhookURL] = useState("");
  const [webhookAvatar, setWebhookAvatar] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function reset() {
    setStep("name");
    setName("");
    setIsPrivate(false);
    setWebhookOnly(false);
    setWebhookURL("");
    setWebhookAvatar(null);
    setSelectedIds([]);
    setBusy(false);
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) reset();
  }

  async function submit() {
    if (!slugifyChannel(name)) {
      setStep("name");
      return;
    }
    setBusy(true);
    try {
      const webhook = webhookOnly
        ? await api.createChatWebhookChannel({
            name: name.trim(),
            is_private: isPrivate,
          })
        : null;
      const channel =
        webhook?.conversation ??
        (await api.createChatChannel({
          name: name.trim(),
          is_private: isPrivate,
        }));
      if (webhook) {
        onCreated(channel);
        setWebhookURL(webhook.url);
      }
      if (isPrivate && selectedIds.length > 0) {
        await Promise.all(
          selectedIds
            .filter((id) => id !== currentUserId)
            .map((id) => api.addChatChannelMember(channel.id, id)),
        );
      }
      if (webhook && webhookAvatar) {
        try {
          await api.uploadChatWebhookAvatar(channel.id, webhookAvatar);
        } catch (error) {
          toast.warning(friendlyError(error, "Feed created, but avatar upload failed"));
        }
      }
      if (!webhook) {
        onCreated(channel);
        handleOpenChange(false);
      }
    } catch (e) {
      toast.error(friendlyError(e, "Failed to create channel"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-0 overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t(language, "chat.createChannel")}</DialogTitle>
          {step === "visibility" && name.trim() ? (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <UserGroupIcon size={14} />
              {name.trim()}
            </p>
          ) : null}
        </DialogHeader>

        {webhookURL ? (
          <WebhookCreatedStep
            url={webhookURL}
            onDone={() => handleOpenChange(false)}
          />
        ) : step === "name" ? (
          <ChannelNameStep
            name={name}
            onNameChange={setName}
            onNext={() => setStep("visibility")}
            webhookOnly={webhookOnly}
            onWebhookOnlyChange={setWebhookOnly}
            avatarFile={webhookAvatar}
            onAvatarFileChange={setWebhookAvatar}
            language={language}
          />
        ) : (
          <ChannelVisibilityStep
            isPrivate={isPrivate}
            onPrivateChange={setIsPrivate}
            members={members}
            selectedIds={selectedIds}
            onSelectedChange={setSelectedIds}
            currentUserId={currentUserId}
            teamName={teamName}
            busy={busy}
            onBack={() => setStep("name")}
            onCreate={() => void submit()}
            language={language}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
