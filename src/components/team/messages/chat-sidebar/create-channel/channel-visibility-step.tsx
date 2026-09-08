"use client";

import { UserGroupIcon, LockIcon } from "hugeicons-react";
import type { TeamMember } from "@/lib/api/types/team";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import BoardMemberPicker from "@/components/team/board/shared/board-member-picker";
import { t } from "@/lib/i18n";
import VisibilityOption from "./visibility-option";

export default function ChannelVisibilityStep({
  isPrivate,
  onPrivateChange,
  members,
  selectedIds,
  onSelectedChange,
  currentUserId,
  teamName,
  busy,
  onBack,
  onCreate,
  language,
}: {
  isPrivate: boolean;
  onPrivateChange: (isPrivate: boolean) => void;
  members: TeamMember[];
  selectedIds: string[];
  onSelectedChange: (ids: string[]) => void;
  currentUserId: string;
  teamName: string;
  busy: boolean;
  onBack: () => void;
  onCreate: () => void;
  language?: string | null;
}) {
  return (
    <>
      <div className="space-y-3 py-1">
        <Label>{t(language, "chat.visibility")}</Label>
        <div className="space-y-1.5">
          <VisibilityOption
            selected={!isPrivate}
            onSelect={() => onPrivateChange(false)}
            icon={<UserGroupIcon size={16} />}
            title={
              <>
                {t(language, "chat.public")} —{" "}
                <span className="text-muted-foreground">
                  {t(language, "chat.publicAnyoneIn")}{" "}
                  <span className="font-semibold text-[var(--text)]">{teamName}</span>
                </span>
              </>
            }
          />
          <VisibilityOption
            selected={isPrivate}
            onSelect={() => onPrivateChange(true)}
            icon={<LockIcon size={16} />}
            title={
              <>
                {t(language, "chat.private")} —{" "}
                <span className="text-muted-foreground">
                  {t(language, "chat.privateDesc")}
                </span>
              </>
            }
            hint={t(language, "chat.privateHint")}
          />
        </div>

        {isPrivate ? (
          <div className="space-y-1.5 pt-1">
            <Label>{t(language, "chat.invitePeople")}</Label>
            <BoardMemberPicker
              members={members}
              selectedIds={selectedIds}
              onChange={onSelectedChange}
              lockedIds={[currentUserId]}
            />
          </div>
        ) : null}
      </div>
      <DialogFooter className="items-center sm:justify-between">
        <span className="mr-auto text-xs text-muted-foreground">
          {t(language, "chat.stepTwoOfTwo")}
        </span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            {t(language, "chat.back")}
          </Button>
          <Button type="button" disabled={busy} onClick={onCreate}>
            {busy ? t(language, "chat.creating") : t(language, "chat.create")}
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}
