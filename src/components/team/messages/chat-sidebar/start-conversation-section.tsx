"use client";

import type { TeamMember } from "@/lib/api/types/team";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PresenceAvatar from "@/components/shared/presence-avatar";
import { chatInitials } from "../chat-utils";
import { t } from "@/lib/i18n";
import { useChatStore } from "@/store/chat-store";
import AddPeopleCta from "./add-people-cta";

/**
 * Workspace members you don't yet have a DM with — quick "start a conversation"
 * list. With independent chat on it also carries the way out of the workspace:
 * people outside it are reachable through a connection request, so the entry
 * point sits right where the member list runs out.
 */
export default function StartConversationSection({
  members,
  currentUserId,
  existingPeerIds,
  onStartDM,
  language,
  onOpenPeople,
}: {
  members: TeamMember[];
  currentUserId: string;
  existingPeerIds: Set<string | undefined>;
  onStartDM: (userId: string) => void;
  language?: string | null;
  onOpenPeople?: () => void;
}) {
  const independentChat = useChatStore((s) => s.independentChat);
  const candidates = members.filter(
    (m) => m.user_id !== currentUserId && !existingPeerIds.has(m.user_id),
  );
  const showAddPeople = independentChat && !!onOpenPeople;
  if (candidates.length === 0 && !showAddPeople) return null;

  return (
    <div className="border-t border-[var(--border)] px-2 pt-3">
      <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {t(language, "chat.startConversation")}
      </p>
      {candidates.slice(0, 5).map((m) => (
        <button
          key={m.user_id}
          type="button"
          onClick={() => onStartDM(m.user_id)}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-white/[0.04] hover:text-[var(--text)]"
        >
          <PresenceAvatar userId={m.user_id} dotClassName="h-2 w-2">
            <Avatar className="h-7 w-7 shrink-0 rounded-md">
              <AvatarImage src={m.avatar_url} alt="" />
              <AvatarFallback className="rounded-md text-[9px]">
                {chatInitials(m.name)}
              </AvatarFallback>
            </Avatar>
          </PresenceAvatar>
          <span className="truncate">{m.name}</span>
        </button>
      ))}
      {showAddPeople ? (
        <AddPeopleCta
          onClick={onOpenPeople!}
          label="Add someone outside this workspace"
          className="mt-2"
        />
      ) : null}
    </div>
  );
}
