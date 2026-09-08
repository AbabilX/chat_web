"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api, type ChatConversation } from "@/lib/api";
import { friendlyError } from "@/lib/api/error-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";

/** Manager-only inline rename for a group. */
export default function GroupRenameField({
  channelId,
  currentName,
  onRenamed,
  language,
}: {
  channelId: string;
  currentName: string;
  onRenamed: (conv: ChatConversation) => void;
  language?: string | null;
}) {
  const [name, setName] = useState(currentName);
  const [busy, setBusy] = useState(false);

  const dirty = name.trim() !== "" && name.trim() !== currentName;

  async function save() {
    if (!dirty) return;
    setBusy(true);
    try {
      const updated = await api.patchChatChannel(channelId, { name: name.trim() });
      onRenamed(updated);
      toast.success(t(language, "chat.groupRenamed"));
    } catch (e) {
      toast.error(friendlyError(e, "Failed to rename group"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor="group-rename">{t(language, "chat.renameGroup")}</Label>
      <div className="flex gap-2">
        <Input
          id="group-rename"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="button" size="sm" disabled={!dirty || busy} onClick={() => void save()}>
          {t(language, "chat.save")}
        </Button>
      </div>
    </div>
  );
}
