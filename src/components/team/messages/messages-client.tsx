"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { friendlyError } from "@/lib/api/error-messages";
import { cn } from "@/lib/utils";
import { useTeamContext } from "@/components/team/shared/team-provider";
import { useTeamPlan } from "@/components/team/shared/use-team-plan";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ChatSidebar from "./chat-sidebar";
import ChatTimeline from "./chat-timeline";
import ChatThreadPanel from "./chat-thread-panel";
import ChatProfilePanel from "./chat-profile-panel";
import { useChatFeed } from "./use-chat-messages";
import { useConversationUrlSync } from "./use-conversation-url-sync";
import { useChatFocus } from "@/lib/hooks/use-chat-focus";
import ChatEmptyState from "./chat-empty-state";
import ChatHeader from "./chat-header";
import ForwardDialog from "./chat-forward/forward-dialog";
import { extractMentionUserIds } from "@/components/team/board/tiptap/utils";
import { selectActiveConversation, useChatStore } from "@/store/chat-store";
import { useMessageRequest } from "./use-message-request";
import type { ChatMessage } from "@/lib/api";
import MessageVaultGate from "./message-vault-gate";
import { useMessageVaultStore } from "@/store/message-vault-store";
import { encryptExistingDMText } from "@/lib/chat-e2ee/crypto";
import E2EEIntroDialog, { hasSeenE2EEIntro } from "./e2ee-intro-dialog";
import MessageStorageNoticeDialog, {
  hasSeenMessageStorageNotice,
} from "./message-storage-notice-dialog";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function MessagesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { detail, loading: teamLoading, hasTeam } = useTeamContext();
  const [appLanguage, setAppLanguage] = useState<string | null>(null);
  // Team chat is a team feature — gate on the team's own plan, not the solo plan.
  const { isFreeTier } = useTeamPlan();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(
    null,
  );
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [e2eeIntroDismissed, setE2EEIntroDismissed] = useState(false);
  const [storageNoticeDismissed, setStorageNoticeDismissed] = useState(false);
  const vaultState = useMessageVaultStore((s) => s.state);
  const checkMessageVault = useMessageVaultStore((s) => s.check);
  // With independent chat live, messaging no longer depends on having a team.
  const independentChat = useChatStore((s) => s.independentChat);
  const chatReady = hasTeam || independentChat;

  // Conversation ids are UUIDs — ignore malformed deep links (e.g. a name slug)
  // instead of passing them to the API.
  const rawConvParam = searchParams.get("c");
  const convParam =
    rawConvParam && UUID_RE.test(rawConvParam) ? rawConvParam : null;
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [pendingMessageId, setPendingMessageId] = useState<string | null>(null);
  const [jumpNonce, setJumpNonce] = useState(0);
  const loadOlderAttemptsRef = useRef(0);
  // Deep-link params from Ababil AI: m = scroll-to message, draft = composer prefill.
  const targetMessageId = searchParams.get("m") || pendingMessageId;
  const draftParam = searchParams.get("draft");

  const {
    dms,
    channels,
    sidebarLoading,
    currentUserId,
    activeConversationId,
    threadRootId,
    threadRepliesByRoot,
    sending,
    setActiveConversationId,
    resetThreadState,
    setThreadRootId,
    clearUnread,
    upsertDM,
    loadFeed,
    prefetchThreadSummaries,
    setThreadReplies,
    sendMessage,
    setSending,
    updateFeedMessage,
    removeFeedMessage,
    updateFeedReactions,
    fetchSidebar,
  } = useChatStore(
    useShallow((s) => ({
      dms: s.dms,
      channels: s.channels,
      sidebarLoading: s.sidebarLoading,
      currentUserId: s.currentUserId,
      activeConversationId: s.activeConversationId,
      threadRootId: s.threadRootId,
      threadRepliesByRoot: s.threadRepliesByRoot,
      sending: s.sending,
      setActiveConversationId: s.setActiveConversationId,
      resetThreadState: s.resetThreadState,
      setThreadRootId: s.setThreadRootId,
      clearUnread: s.clearUnread,
      upsertDM: s.upsertDM,
      loadFeed: s.loadFeed,
      prefetchThreadSummaries: s.prefetchThreadSummaries,
      setThreadReplies: s.setThreadReplies,
      sendMessage: s.sendMessage,
      setSending: s.setSending,
      updateFeedMessage: s.updateFeedMessage,
      removeFeedMessage: s.removeFeedMessage,
      updateFeedReactions: s.updateFeedReactions,
      fetchSidebar: s.fetchSidebar,
    })),
  );

  const activeConv = useChatStore(selectActiveConversation);
  // Stands in for the composer on a DM a stranger opened; undefined otherwise.
  const messageRequest = useMessageRequest(activeConv ?? null);
  const showE2EEIntro =
    vaultState === "unlocked" && !e2eeIntroDismissed && !hasSeenE2EEIntro();
  const showStorageNotice =
    vaultState === "unlocked" &&
    !showE2EEIntro &&
    !storageNoticeDismissed &&
    !hasSeenMessageStorageNotice(currentUserId);
  // Suppress bell rows / phone pushes for the conversation on screen.
  useChatFocus(vaultState === "unlocked" ? activeConversationId : null);
  const mainChat = useChatFeed(activeConversationId, null);
  const threadChat = useChatFeed(activeConversationId, threadRootId);

  const threadRoot = threadRootId
    ? (mainChat.messages.find((m) => m.id === threadRootId) ?? null)
    : null;

  const threadPanelMessages = useMemo(() => {
    if (!threadRoot) return [];
    return [threadRoot, ...threadChat.messages];
  }, [threadRoot, threadChat.messages]);

  useEffect(() => {
    void api.getMeSession().then((me) => {
      useChatStore.getState().setCurrentUserId(me.id);
      useChatStore.getState().setIndependentChat(!!me.independent_chat);
      setAppLanguage(me.app_language ?? null);
    });
  }, []);

  useEffect(() => {
    if (!teamLoading && chatReady) void checkMessageVault();
  }, [teamLoading, chatReady, checkMessageVault]);

  useEffect(() => {
    if (vaultState === "unlocked") void fetchSidebar({ silent: true });
  }, [vaultState, fetchSidebar]);

  useConversationUrlSync({
    ready: !teamLoading && chatReady,
    convParam,
    activeConversationId,
  });

  useEffect(() => {
    if (teamLoading || !chatReady) return;
    if (vaultState !== "unlocked") return;
    if (!activeConversationId || !currentUserId) return;
    void loadFeed(activeConversationId, null, { force: true });
    void api.markChatConversationRead(activeConversationId).catch(() => {});
    clearUnread(activeConversationId);
  }, [
    teamLoading,
    chatReady,
    vaultState,
    activeConversationId,
    currentUserId,
    loadFeed,
    clearUnread,
  ]);

  useEffect(() => {
    if (teamLoading || !chatReady) return;
    if (vaultState !== "unlocked") return;
    if (!threadRootId || !activeConversationId || !currentUserId) return;
    void loadFeed(activeConversationId, threadRootId);
  }, [
    teamLoading,
    chatReady,
    vaultState,
    threadRootId,
    activeConversationId,
    currentUserId,
    loadFeed,
  ]);

  useEffect(() => {
    if (!threadRootId || threadChat.messages.length === 0) return;
    setThreadReplies(threadRootId, threadChat.messages);
  }, [threadRootId, threadChat.messages, setThreadReplies]);

  // Scroll to + flash-highlight the deep-linked message once it is in the feed.
  // If it is older than the loaded page, fetch older pages (bounded).
  const targetInFeed = useMemo(
    () =>
      !!targetMessageId &&
      mainChat.messages.some((m) => m.id === targetMessageId),
    [targetMessageId, mainChat.messages],
  );
  const loadMoreRef = useRef(mainChat.loadMore);
  useEffect(() => {
    loadMoreRef.current = mainChat.loadMore;
  });
  useEffect(() => {
    if (!targetMessageId || !activeConversationId || mainChat.loading) return;
    if (targetInFeed) {
      const scrollTimer = setTimeout(() => {
        setHighlightId(targetMessageId);
        document
          .getElementById(`chat-msg-${targetMessageId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 150);
      const clearTimer = setTimeout(() => {
        setHighlightId(null);
        setPendingMessageId(null);
        router.replace(`${pathname}?c=${activeConversationId}`, {
          scroll: false,
        });
      }, 2800);
      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(clearTimer);
      };
    }
    if (mainChat.hasMore && loadOlderAttemptsRef.current < 8) {
      loadOlderAttemptsRef.current += 1;
      loadMoreRef.current();
    }
  }, [
    targetMessageId,
    targetInFeed,
    activeConversationId,
    mainChat.loading,
    mainChat.hasMore,
    router,
    pathname,
    jumpNonce,
  ]);

  useEffect(() => {
    if (!activeConversationId) return;
    const rootIds = mainChat.messages
      .filter((m) => m.thread_count > 0)
      .map((m) => m.id);
    if (rootIds.length) prefetchThreadSummaries(activeConversationId, rootIds);
  }, [activeConversationId, mainChat.messages, prefetchThreadSummaries]);

  const members = detail?.members ?? [];
  const mentionMembers = members.filter((m) => m.status === "active");

  const openProfile = useCallback(
    (userId: string) => {
      setThreadRootId(null);
      setProfileUserId(userId);
    },
    [setThreadRootId],
  );

  const profileMember = profileUserId
    ? (members.find((m) => m.user_id === profileUserId) ?? null)
    : null;
  const profileFallbackName =
    (activeConv?.type === "dm" && activeConv.peer_user_id === profileUserId
      ? activeConv.peer_user_name
      : mainChat.messages.find((m) => m.user_id === profileUserId)
          ?.user_name) || "Member";
  const profileFallbackAvatar =
    activeConv?.type === "dm" && activeConv.peer_user_id === profileUserId
      ? activeConv.peer_user_avatar
      : mainChat.messages.find((m) => m.user_id === profileUserId)
          ?.user_avatar_url;

  const selectConversation = useCallback(
    (id: string, messageId?: string) => {
      setActiveConversationId(id);
      resetThreadState();
      setProfileUserId(null);
      setMobileNavOpen(false);
      void api.markChatConversationRead(id).catch(() => {});
      clearUnread(id);
      void loadFeed(id, null);
      if (messageId) {
        loadOlderAttemptsRef.current = 0;
        setPendingMessageId(messageId);
        setJumpNonce((n) => n + 1);
      } else {
        setPendingMessageId(null);
      }
    },
    [clearUnread, setActiveConversationId, resetThreadState, loadFeed],
  );

  async function handleStartDM(peerUserId: string) {
    try {
      const dm = await api.startChatDM(peerUserId);
      upsertDM(dm);
      selectConversation(dm.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start DM");
    }
  }

  async function handleSend(
    body: string,
    attachments: Parameters<typeof sendMessage>[1],
    mentionedUserIds: string[],
    parentId?: string | null,
  ) {
    if (!activeConversationId) return;
    setSending(true);
    try {
      await sendMessage(
        body,
        attachments,
        mentionedUserIds,
        parentId ?? threadRootId,
      );
    } catch (e) {
      toast.error(friendlyError(e, "Failed to send message"));
    } finally {
      setSending(false);
    }
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    if (!activeConversationId) return;
    try {
      const reactions = await api.toggleChatReaction(messageId, emoji);
      updateFeedReactions(activeConversationId, messageId, reactions, null);
      updateFeedReactions(
        activeConversationId,
        messageId,
        reactions,
        threadRootId,
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to react");
    }
  }

  async function handleEditMessage(messageId: string, body: string) {
    if (!activeConversationId || !currentUserId) return;
    const existing = [...mainChat.messages, ...threadChat.messages].find(
      (message) => message.id === messageId,
    );
    const payload =
      existing?.encryption_version === 1
        ? await encryptExistingDMText(activeConversationId, body, currentUserId)
        : body;
    const updated = await api.patchChatMessage(messageId, payload);
    const display =
      existing?.encryption_version === 1 ? { ...updated, body } : updated;
    updateFeedMessage(activeConversationId, display, null);
    updateFeedMessage(activeConversationId, display, threadRootId);
  }

  function presign(contentType: string, fileName: string, sizeBytes?: number) {
    if (!activeConversationId)
      return Promise.reject(new Error("No conversation"));
    return api.presignChatAttachment(
      activeConversationId,
      contentType,
      fileName,
      sizeBytes ?? 0,
    );
  }

  function discard(fileUrl: string) {
    if (!activeConversationId) return Promise.resolve();
    return api.discardChatUpload(activeConversationId, fileUrl);
  }

  const sidebarProps = {
    members: mentionMembers,
    onSelect: selectConversation,
    onStartDM: handleStartDM,
    language: appLanguage,
    onOpenProfile: openProfile,
  };

  if (!teamLoading && !chatReady) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center px-4 text-center lg:h-[100dvh]">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)]">
            Create a team first
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Direct messages are available after you create or join a team.
          </p>
          <Button
            type="button"
            className="mt-4"
            onClick={() => router.push("/user/workspace/teamMembers")}
          >
            Go to Team Members
          </Button>
        </div>
      </div>
    );
  }

  if (!teamLoading && chatReady && vaultState !== "unlocked") {
    return <MessageVaultGate />;
  }

  if (sidebarLoading && dms.length === 0 && channels.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem)] items-center justify-center lg:h-[100dvh]">
        <p className="text-sm text-[var(--text-muted)]">Loading chat…</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 lg:h-[100dvh]">
      <ChatSidebar
        {...sidebarProps}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        className="fixed left-0 top-14 z-40 hidden h-[calc(100dvh-3.5rem)] lg:top-0 lg:flex lg:h-[100dvh]"
      />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <ChatSidebar {...sidebarProps} className="h-full border-r-0" />
        </SheetContent>
      </Sheet>

      <div
        className={cn(
          "relative flex min-w-0 flex-1 flex-col",
          sidebarCollapsed ? "lg:ml-14" : "lg:ml-80",
        )}
      >
        <ChatHeader
          activeConv={activeConv}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          language={appLanguage}
          onOpenProfile={openProfile}
          profileOpen={!!profileUserId}
        />

        <div className="flex min-h-0 flex-1">
          <main
            className="flex min-w-0 flex-1 flex-col"
            style={{ background: "var(--bg)" }}
          >
            {activeConv ? (
              <ChatTimeline
                key={activeConv.id}
                conversationId={activeConv.id}
                messages={mainChat.messages}
                loading={mainChat.loading && mainChat.messages.length === 0}
                loadingMore={mainChat.loadingMore}
                hasMore={mainChat.hasMore}
                onLoadMore={mainChat.loadMore}
                currentUserId={currentUserId}
                mentionMembers={mentionMembers}
                onSend={(body, attachments, mentioned) =>
                  handleSend(body, attachments, mentioned, null)
                }
                onToggleReaction={handleToggleReaction}
                onOpenThread={(id) => {
                  setProfileUserId(null);
                  setThreadRootId(id);
                }}
                activeThreadRootId={threadRootId}
                threadRepliesByRoot={threadRepliesByRoot}
                onEditMessage={async (id, body) => {
                  try {
                    await handleEditMessage(id, body);
                  } catch (e) {
                    toast.error(
                      e instanceof Error ? e.message : "Failed to edit message",
                    );
                  }
                }}
                onDeleteMessage={async (id) => {
                  try {
                    await api.deleteChatMessage(id);
                    removeFeedMessage(activeConversationId!, id, null);
                  } catch (e) {
                    toast.error(
                      e instanceof Error
                        ? e.message
                        : "Failed to delete message",
                    );
                  }
                }}
                onForwardMessage={(message) => setForwardMessage(message)}
                onPresign={presign}
                onDiscard={discard}
                sending={sending}
                isFreeTier={isFreeTier}
                peerLeft={
                  activeConv?.type === "dm" &&
                  (activeConv.can_message === false || !!activeConv.peer_left)
                }
                messageRequest={messageRequest}
                isGroup={activeConv?.type !== "dm"}
                highlightMessageId={highlightId}
                composerInitialValue={draftParam ?? undefined}
                onOpenProfile={openProfile}
              />
            ) : (
              <ChatEmptyState language={appLanguage} />
            )}
          </main>

          {profileUserId ? (
            <ChatProfilePanel
              userId={profileUserId}
              member={profileMember}
              fallbackName={profileFallbackName}
              fallbackAvatar={profileFallbackAvatar}
              onClose={() => setProfileUserId(null)}
              channels={channels}
              currentUserId={currentUserId}
              onOpenConversation={selectConversation}
              onStartDM={handleStartDM}
            />
          ) : threadRootId && threadRoot && currentUserId ? (
            <ChatThreadPanel
              rootId={threadRootId}
              messages={threadPanelMessages}
              members={mentionMembers}
              currentUserId={currentUserId}
              busy={sending}
              onClose={() => setThreadRootId(null)}
              onSubmitReply={(body, parentId, attachments) =>
                handleSend(
                  body,
                  attachments,
                  extractMentionUserIds(body),
                  parentId,
                )
              }
              onEditMessage={async (id, body) => {
                try {
                  await handleEditMessage(id, body);
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Failed to edit message",
                  );
                }
              }}
              onDeleteMessage={async (id) => {
                try {
                  await api.deleteChatMessage(id);
                  removeFeedMessage(activeConversationId!, id, null);
                  removeFeedMessage(activeConversationId!, id, threadRootId);
                } catch (e) {
                  toast.error(
                    e instanceof Error ? e.message : "Failed to delete message",
                  );
                }
              }}
              onToggleReaction={handleToggleReaction}
              onPresign={presign}
              onDiscard={discard}
              isFreeTier={isFreeTier}
            />
          ) : null}
        </div>
      </div>

      <ForwardDialog
        key={forwardMessage?.id ?? "closed"}
        open={!!forwardMessage}
        onOpenChange={(next) => {
          if (!next) setForwardMessage(null);
        }}
        message={forwardMessage}
        channels={channels}
        members={mentionMembers}
        language={appLanguage}
        currentUserId={currentUserId ?? undefined}
      />
      <E2EEIntroDialog
        open={showE2EEIntro}
        onDone={() => setE2EEIntroDismissed(true)}
      />
      {currentUserId ? (
        <MessageStorageNoticeDialog
          open={showStorageNotice}
          userId={currentUserId}
          onDone={() => setStorageNoticeDismissed(true)}
        />
      ) : null}
    </div>
  );
}
