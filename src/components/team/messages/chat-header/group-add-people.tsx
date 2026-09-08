"use client";

import { useMemo, useState } from "react";
import { UserAdd01Icon } from "hugeicons-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { TeamMember } from "@/lib/api/types/team";
import { friendlyError } from "@/lib/api/error-messages";
import { Button } from "@/components/ui/button";
import BoardMemberPicker from "@/components/team/board/shared/board-member-picker";
import { t } from "@/lib/i18n";

/** Manager-only control to add team members into a group. */
export default function GroupAddPeople({
  channelId,
  teamMembers,
  existingMemberIds,
  onAdded,
  language,
}: {
  channelId: string;
  teamMembers: TeamMember[];
  existingMemberIds: Set<string>;
  onAdded: () => void;
  language?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const addable = useMemo(
    () => teamMembers.filter((m) => !existingMemberIds.has(m.user_id)),
    [teamMembers, existingMemberIds],
  );

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
        disabled={addable.length === 0}
        onClick={() => setOpen(true)}
      >
        <UserAdd01Icon size={15} />
        {t(language, "chat.addPeople")}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <BoardMemberPicker members={addable} selectedIds={selectedIds} onChange={setSelectedIds} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          {t(language, "chat.back")}
        </Button>
        <Button type="button" size="sm" disabled={busy || selectedIds.length === 0} onClick={() => void submit()}>
          {t(language, "chat.addPeople")}
        </Button>
      </div>
    </div>
  );
}
