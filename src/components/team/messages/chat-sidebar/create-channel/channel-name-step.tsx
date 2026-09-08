"use client";

import { Link01Icon, UserGroupIcon } from "hugeicons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { t } from "@/lib/i18n";
import { CHANNEL_NAME_MAX, slugifyChannel } from "./channel-slug";
import WebhookAvatarField from "./webhook-avatar-field";

export default function ChannelNameStep({
  name,
  onNameChange,
  onNext,
  webhookOnly,
  onWebhookOnlyChange,
  avatarFile,
  onAvatarFileChange,
  language,
}: {
  name: string;
  onNameChange: (name: string) => void;
  onNext: () => void;
  webhookOnly: boolean;
  onWebhookOnlyChange: (value: boolean) => void;
  avatarFile: File | null;
  onAvatarFileChange: (file: File | null) => void;
  language?: string | null;
}) {
  const slug = slugifyChannel(name);
  const remaining = CHANNEL_NAME_MAX - name.length;

  return (
    <>
      <div className="space-y-2 py-1">
        <div className="grid grid-cols-2 gap-2 pb-2">
          <button
            type="button"
            onClick={() => onWebhookOnlyChange(false)}
            className={`rounded-lg border p-3 text-left text-sm ${!webhookOnly ? "border-[var(--indigo)] bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)]" : "border-[var(--border)]"}`}
          >
            <UserGroupIcon size={16} className="mb-1" />
            <span className="font-medium">Chat group</span>
            <p className="text-xs text-muted-foreground">
              Members can send messages
            </p>
          </button>
          <button
            type="button"
            onClick={() => onWebhookOnlyChange(true)}
            className={`rounded-lg border p-3 text-left text-sm ${webhookOnly ? "border-[var(--indigo)] bg-[color-mix(in_srgb,var(--indigo)_10%,transparent)]" : "border-[var(--border)]"}`}
          >
            <Link01Icon size={16} className="mb-1" />
            <span className="font-medium">Webhook feed</span>
            <p className="text-xs text-muted-foreground">
              Incoming messages only
            </p>
          </button>
        </div>
        <Label htmlFor="channel-name">{t(language, "chat.channelName")}</Label>
        <div className="relative">
          <UserGroupIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="channel-name"
            autoFocus
            value={name}
            maxLength={CHANNEL_NAME_MAX}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t(language, "chat.channelNamePlaceholder")}
            className="pl-9 pr-14"
            onKeyDown={(e) => {
              if (e.key === "Enter" && slug) {
                e.preventDefault();
                onNext();
              }
            }}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {remaining}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t(language, "chat.channelNameHelp")}
        </p>
        {webhookOnly ? (
          <WebhookAvatarField file={avatarFile} onChange={onAvatarFileChange} />
        ) : null}
      </div>
      <DialogFooter>
        <Button type="button" disabled={!slug} onClick={onNext}>
          {t(language, "chat.next")}
        </Button>
      </DialogFooter>
    </>
  );
}
