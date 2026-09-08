"use client";

import { format, isToday, parseISO } from "date-fns";
import { Link01Icon } from "hugeicons-react";
import type { ChatMessage } from "@/lib/api";
import CommentAttachments from "@/components/team/board/comments/attachments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function messageTime(iso: string) {
  const value = parseISO(iso);
  return format(value, isToday(value) ? "h:mm a" : "MMM d, h:mm a");
}

export default function WebhookMessageRow({
  message,
}: {
  message: ChatMessage;
}) {
  const source =
    (message.meta as { source_name?: string } | null)?.source_name?.trim() ||
    "Webhook";
  const avatarURL = message.user_avatar_url?.trim();
  return (
    <article className="flex min-w-0 gap-3 py-2 pr-2 hover:bg-white/[0.02]">
      <Avatar className="mt-0.5 h-9 w-9 rounded-md">
        {avatarURL ? <AvatarImage src={avatarURL} alt={`${source} avatar`} /> : null}
        <AvatarFallback className="rounded-md bg-[color-mix(in_srgb,var(--indigo)_15%,transparent)] text-[var(--indigo)]">
          <Link01Icon size={17} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold text-[var(--text)]">
            {source}
          </span>
          <span className="rounded bg-[color-mix(in_srgb,var(--indigo)_15%,transparent)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--indigo)]">
            webhook
          </span>
          <time
            className="text-xs text-muted-foreground"
            dateTime={message.created_at}
          >
            {messageTime(message.created_at)}
          </time>
        </div>
        {message.body ? (
          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--text)]">
            {message.body}
          </p>
        ) : null}
        <CommentAttachments attachments={message.attachments ?? []} />
      </div>
    </article>
  );
}
