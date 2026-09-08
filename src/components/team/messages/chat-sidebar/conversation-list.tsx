"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { Search01Icon } from "hugeicons-react";
import type { TeamMember } from "@/lib/api/types/team";
import { Input } from "@/components/ui/input";
import { chatConvLabel } from "../chat-utils";
import { localMessageSearchHit } from "@/lib/chat-local-index";
import ConversationListHeader from "./conversation-list-header";
import ScopeFilterTabs from "./scope-filter-tabs";
import ConversationListItem from "./conversation-list-item";
import StartConversationSection from "./start-conversation-section";
import AddPeopleCta from "./add-people-cta";
import { sortConversations } from "./conversation-sort";
import { t } from "@/lib/i18n";
import { useChatStore } from "@/store/chat-store";

export default function ConversationList({
  members,
  onSelect,
  onStartDM,
  language,
  onOpenProfile,
  onOpenPeople,
}: {
  members: TeamMember[];
  onSelect: (id: string, messageId?: string) => void;
  onStartDM: (userId: string) => void;
  language?: string | null;
  onOpenProfile?: (userId: string) => void;
  onOpenPeople?: () => void;
}) {
  const {
    dms,
    channels,
    activeConversationId,
    currentUserId,
    unreadOnly,
    dmSearchQuery,
    independentChat,
    setUnreadOnly,
    setDmSearchQuery,
  } = useChatStore(
    useShallow((s) => ({
      dms: s.dms,
      channels: s.channels,
      activeConversationId: s.activeConversationId,
      currentUserId: s.currentUserId,
      unreadOnly: s.unreadOnly,
      dmSearchQuery: s.dmSearchQuery,
      independentChat: s.independentChat,
      setUnreadOnly: s.setUnreadOnly,
      setDmSearchQuery: s.setDmSearchQuery,
    })),
  );

  const dmPeerIds = new Set(dms.map((d) => d.peer_user_id).filter(Boolean));

  const filtered = useMemo(() => {
    const q = dmSearchQuery.trim().toLowerCase();
    return sortConversations([...channels, ...dms]).flatMap((conv) => {
      if (unreadOnly && conv.unread_count <= 0) return [];
      if (!q) return [{ conv, snippet: null as string | null, messageId: null as string | null }];
      if (chatConvLabel(conv).toLowerCase().includes(q)) {
        return [{ conv, snippet: null as string | null, messageId: null as string | null }];
      }
      const hit = localMessageSearchHit(conv.id, q);
      return hit
        ? [{ conv, snippet: hit.snippet, messageId: hit.messageId }]
        : [];
    });
  }, [channels, dms, dmSearchQuery, unreadOnly]);

  return (
    <div className="flex min-h-0 flex-col">
      <ConversationListHeader
        unreadOnly={unreadOnly}
        onToggleUnread={setUnreadOnly}
        language={language}
        onOpenPeople={onOpenPeople}
      />

      <div className="shrink-0 px-2 pb-2">
        <div className="relative">
          <Search01Icon
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={dmSearchQuery}
            onChange={(e) => setDmSearchQuery(e.target.value)}
            placeholder={t(language, "chat.searchChats")}
            className="h-8 border-[var(--border)] bg-[var(--surface2)] pl-8 text-xs"
          />
        </div>
      </div>

      <ScopeFilterTabs />

      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1 pb-32">
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <p className="text-xs text-muted-foreground">
              {unreadOnly
                ? t(language, "chat.noUnread")
                : t(language, "chat.noConversations")}
            </p>
            {independentChat && onOpenPeople && !unreadOnly ? (
              <AddPeopleCta
                onClick={onOpenPeople}
                label="Find people to message"
                className="mt-3"
              />
            ) : null}
          </div>
        ) : (
          filtered.map(({ conv, snippet, messageId }) => (
            <ConversationListItem
              key={conv.id}
              conv={conv}
              active={conv.id === activeConversationId}
              currentUserId={currentUserId}
              onSelect={onSelect}
              searchSnippet={snippet}
              searchMessageId={messageId}
              onOpenProfile={onOpenProfile}
            />
          ))
        )}

        <StartConversationSection
          members={members}
          currentUserId={currentUserId}
          existingPeerIds={dmPeerIds}
          onStartDM={onStartDM}
          language={language}
          onOpenPeople={onOpenPeople}
        />
      </div>
    </div>
  );
}
