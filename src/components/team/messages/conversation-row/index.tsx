"use client";

import { Message01Icon } from "hugeicons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PresenceAvatar from "@/components/shared/presence-avatar";
import PeerCallOrStatus from "@/components/shared/peer-call-or-status";
import ChatMessagePreview from "../chat-message-preview";
import type { ChatPreviewAttachment } from "../chat-preview-utils";
import { chatInitials, chatListTime } from "../chat-utils";
import { cn } from "@/lib/utils";

export default function ConversationRow({
  title,
  avatarUrl,
  avatarFallback,
  peerUserId,
  lastMessageAt,
  lastMessageBody,
  lastMessageUserId,
  lastMessageAttachmentType,
  lastMessageAttachmentName,
  lastMessageAttachments,
  currentUserId,
  unreadCount = 0,
  active,
  onClick,
  prefix,
  showAvatar = true,
  avatarNode,
  onAvatarClick,
}: {
  title: string;
  avatarUrl?: string;
  avatarFallback?: string;
  peerUserId?: string;
  lastMessageAt?: string | null;
  lastMessageBody?: string;
  lastMessageUserId?: string;
  lastMessageAttachmentType?: string;
  lastMessageAttachmentName?: string;
  lastMessageAttachments?: ChatPreviewAttachment[];
  currentUserId?: string;
  unreadCount?: number;
  active?: boolean;
  onClick: () => void;
  prefix?: React.ReactNode;
  showAvatar?: boolean;
  /** Custom node rendered in the avatar slot (e.g. a group avatar stack). */
  avatarNode?: React.ReactNode;
  onAvatarClick?: () => void;
}) {
  const isYou =
    !!currentUserId &&
    !!lastMessageUserId &&
    lastMessageUserId === currentUserId;
  const previewPrefix = isYou ? "You: " : "";
  const hasUnread = unreadCount > 0 && !active;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        active
          ? "bg-[color-mix(in_srgb,var(--indigo)_15%,transparent)]"
          : "hover:bg-white/[0.04]",
        hasUnread && "bg-white/[0.02]",
      )}
    >
      {avatarNode ? (
        <div className="mt-0.5 shrink-0">{avatarNode}</div>
      ) : showAvatar ? (
        <PresenceAvatar userId={peerUserId} className="mt-0.5">
          <Avatar
            className={cn(
              "h-9 w-9 shrink-0 rounded-md",
              onAvatarClick && "cursor-pointer",
            )}
            onClick={
              onAvatarClick
                ? (e) => {
                    e.stopPropagation();
                    onAvatarClick();
                  }
                : undefined
            }
          >
            <AvatarImage src={avatarUrl} alt="" />
            <AvatarFallback className="rounded-md text-[10px]">
              {avatarFallback ?? chatInitials(title)}
            </AvatarFallback>
          </Avatar>
        </PresenceAvatar>
      ) : (
        <div
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-muted-foreground"
          style={{ background: "var(--surface2)" }}
        >
          {prefix ?? "#"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "min-w-0 truncate text-sm",
              hasUnread
                ? "font-bold text-[var(--text)]"
                : "font-medium text-[var(--text)]",
            )}
          >
            {title}
          </span>
          {peerUserId ? (
            <PeerCallOrStatus userId={peerUserId} compact />
          ) : null}
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {lastMessageAt ? (
              <span
                className={cn(
                  "text-[11px] text-muted-foreground",
                  hasUnread && "font-medium text-[var(--text-muted)]",
                )}
              >
                {chatListTime(lastMessageAt)}
              </span>
            ) : null}
            {hasUnread ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--indigo)] px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
          <ChatMessagePreview
            body={lastMessageBody}
            attachmentType={lastMessageAttachmentType}
            attachmentName={lastMessageAttachmentName}
            attachments={lastMessageAttachments}
            prefix={previewPrefix}
            className={cn(
              "min-w-0 flex-1",
              hasUnread && "font-medium text-[var(--text-muted)]",
            )}
          />
          {!hasUnread ? (
            <Message01Icon
              size={14}
              className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-40"
            />
          ) : null}
        </div>
      </div>
    </button>
  );
}
