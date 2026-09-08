"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import type { ChatMessage } from "@/lib/api";
import type { TeamMember } from "@/lib/api/types/team";
import { FileDropZone } from "@/components/team/shared/file-drop-zone";
import { selectActiveConversation, useChatStore } from "@/store/chat-store";
import MessageComposer, {
  type MessageComposerHandle,
} from "./message-composer";
import MessageRequestBar from "./message-request-bar";
import SafetyNumberAlert from "../safety-number/safety-number-alert";
import TimelineContent from "./timeline-content";
import { useTimelineScroll } from "./use-timeline-scroll";
import "./timeline-feed.css";

type Props = {
  conversationId?: string | null;
  messages: ChatMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentUserId?: string;
  mentionMembers: TeamMember[];
  onSend: Parameters<typeof MessageComposer>[0]["onSubmit"];
  onToggleReaction: (messageId: string, emoji: string) => void;
  onOpenThread?: (messageId: string) => void;
  onEditMessage?: (messageId: string, body: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onForwardMessage?: (message: ChatMessage) => void;
  onPresign: Parameters<typeof MessageComposer>[0]["onPresign"];
  onDiscard: Parameters<typeof MessageComposer>[0]["onDiscard"];
  sending?: boolean;
  isFreeTier?: boolean;
  activeThreadRootId?: string | null;
  threadRepliesByRoot?: Record<string, ChatMessage[]>;
  showComposer?: boolean;
  peerLeft?: boolean;
  messageRequest?: {
    peerName: string;
    onAccept: () => Promise<void> | void;
    onDelete: () => Promise<void> | void;
    onBlock: () => Promise<void> | void;
  };
  composerPlaceholder?: string;
  composerSubmitLabel?: string;
  composerInitialValue?: string;
  highlightMessageId?: string | null;
  emptyLabel?: string;
  readOnlyLabel?: string;
  isGroup?: boolean;
  onOpenProfile?: (userId: string) => void;
};

export default function ChatTimeline({
  conversationId = null,
  messages,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  currentUserId = "",
  mentionMembers,
  onSend,
  onToggleReaction,
  onOpenThread,
  onEditMessage,
  onDeleteMessage,
  onForwardMessage,
  onPresign,
  onDiscard,
  sending,
  isFreeTier,
  activeThreadRootId,
  threadRepliesByRoot = {},
  showComposer = true,
  peerLeft = false,
  messageRequest,
  composerPlaceholder,
  composerSubmitLabel,
  composerInitialValue,
  highlightMessageId,
  emptyLabel = "No messages yet. Say hello!",
  readOnlyLabel,
  isGroup = false,
  onOpenProfile,
}: Props) {
  const webhookOnly =
    useChatStore(selectActiveConversation)?.type === "webhook";
  const composerVisible = showComposer && !webhookOnly;
  const readOnlyText = webhookOnly
    ? "Messages arrive through this group's webhook. Members can only view this feed."
    : readOnlyLabel;
  const composerRef = useRef<MessageComposerHandle>(null);
  const composerReady = composerVisible && !peerLeft && !messageRequest;
  const lastMessage = messages.length ? messages[messages.length - 1] : null;
  const { containerRef, contentRef, bottomDetectorRef, anchorBeforePrepend } =
    useTimelineScroll({
      conversationId,
      lastMessageId: lastMessage?.id ?? null,
      messageCount: messages.length,
      lastMessageFromSelf:
        !!lastMessage && lastMessage.user_id === currentUserId,
      loading,
    });
  const loadOlder = useCallback(() => {
    anchorBeforePrepend();
    onLoadMore();
  }, [anchorBeforePrepend, onLoadMore]);
  const addIncomingFiles = useCallback((files: File[]) => {
    if (!composerRef.current) {
      toast.error("Finish or cancel the voice recording first");
      return;
    }
    composerRef.current.addFiles(files);
  }, []);

  return (
    <FileDropZone
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      disabled={!composerReady || sending}
      onFiles={addIncomingFiles}
    >
      <div ref={containerRef} className="chat-timeline-scroller px-2">
        <div
          ref={contentRef}
          className={[
            "chat-timeline-feed chat-timeline-feed--have-newest",
            hasMore ? "" : "chat-timeline-feed--have-oldest",
          ].join(" ")}
        >
          <TimelineContent
            messages={messages}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={loadOlder}
            currentUserId={currentUserId}
            activeThreadRootId={activeThreadRootId}
            threadRepliesByRoot={threadRepliesByRoot}
            onToggleReaction={onToggleReaction}
            onOpenThread={onOpenThread}
            onEditMessage={onEditMessage}
            onDeleteMessage={onDeleteMessage}
            onForwardMessage={onForwardMessage}
            onOpenProfile={onOpenProfile}
            highlightMessageId={highlightMessageId}
            emptyLabel={emptyLabel}
          />
          <div
            ref={bottomDetectorRef}
            className="chat-timeline-bottom-detector"
            aria-hidden
          />
        </div>
      </div>
      {/* Renders only when the peer's identity key has changed under us. */}
      <SafetyNumberAlert />
      {peerLeft ? (
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-xs text-muted-foreground">
          This user has left the team. You cannot send messages to them.
        </div>
      ) : messageRequest ? (
        <MessageRequestBar {...messageRequest} />
      ) : !composerVisible && readOnlyText ? (
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-center text-xs text-muted-foreground">
          {readOnlyText}
        </div>
      ) : composerVisible ? (
        <MessageComposer
          ref={composerRef}
          mentionMembers={mentionMembers}
          onSubmit={onSend}
          busy={sending}
          onPresign={onPresign}
          onDiscard={onDiscard}
          isFreeTier={isFreeTier}
          placeholder={composerPlaceholder}
          submitLabel={composerSubmitLabel}
          initialValue={composerInitialValue}
          allowMentionAll={isGroup}
          secureSend={!isGroup}
        />
      ) : null}
    </FileDropZone>
  );
}
