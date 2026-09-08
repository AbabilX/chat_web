"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ChatConversation } from "@/lib/api/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GroupBannerField from "./group-banner-field";
import { useGroupImages } from "./use-group-images";

/**
 * A personal group's identity: banner, photo, name, description.
 *
 * The two pictures save themselves the moment one is chosen; only the text
 * fields wait for Save, because a half-typed name is not worth committing and
 * a chosen photo always is.
 */
export default function GroupIdentitySection({
  conv,
  canEdit,
  onUpdated,
}: {
  conv: ChatConversation;
  canEdit: boolean;
  onUpdated: (conv: ChatConversation) => void;
}) {
  const [name, setName] = useState(conv.name ?? "");
  const [description, setDescription] = useState(conv.description ?? "");
  const [saving, setSaving] = useState(false);
  const [textError, setTextError] = useState<string | null>(null);
  const images = useGroupImages(conv, onUpdated);

  const dirty =
    name.trim() !== (conv.name ?? "") ||
    description.trim() !== (conv.description ?? "");

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    setTextError(null);
    try {
      onUpdated(
        await api.updateChatGroupInfo(conv.id, {
          name: name.trim(),
          description: description.trim(),
        }),
      );
    } catch (e) {
      setTextError(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const error = images.error ?? textError;

  return (
    <div className="space-y-3">
      <GroupBannerField
        name={conv.name ?? ""}
        avatarUrl={conv.avatar_url}
        bannerUrl={conv.banner_url}
        canEdit={canEdit}
        uploading={images.uploading}
        onPick={(kind, file) => void images.upload(kind, file)}
      />

      {canEdit ? (
        <>
          <Input
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="Group name"
          />
          <Textarea
            value={description}
            maxLength={1000}
            rows={2}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group about?"
          />
        </>
      ) : (
        <>
          <p className="truncate text-base font-semibold text-[var(--text)]">
            {conv.name}
          </p>
          {conv.description ? (
            <p className="text-sm text-muted-foreground">{conv.description}</p>
          ) : null}
        </>
      )}

      {error ? <p className="text-xs text-red-400">{error}</p> : null}

      {canEdit && dirty ? (
        <Button size="sm" onClick={() => void save()} disabled={saving || !name.trim()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      ) : null}
    </div>
  );
}
