"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ThreadMessage } from "../thread-types";
import { tiptapToPlainText } from "../../tiptap/utils";
import { cn } from "@/lib/utils";

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function threadParticipants(
  root: ThreadMessage,
  replies: ThreadMessage[],
  max = 3,
) {
  const byUser = new Map<
    string,
    {
      user_id: string;
      user_name?: string;
      user_avatar_url?: string;
      latest: number;
    }
  >();

  for (const m of [root, ...replies]) {
    const ts = new Date(m.created_at).getTime();
    const existing = byUser.get(m.user_id);
    if (!existing || ts > existing.latest) {
      byUser.set(m.user_id, {
        user_id: m.user_id,
        user_name: m.user_name,
        user_avatar_url: m.user_avatar_url,
        latest: ts,
      });
    }
  }

  return [...byUser.values()].sort((a, b) => b.latest - a.latest).slice(0, max);
}

function lastReplyMessage(replies: ThreadMessage[]): ThreadMessage | null {
  if (replies.length === 0) return null;
  return replies.reduce((latest, r) => {
    const ts = new Date(r.created_at).getTime();
    const latestTs = new Date(latest.created_at).getTime();
    return ts > latestTs ? r : latest;
  }, replies[0]);
}

/** Thread title = root message text (like Discord), not the author name. */
function threadTitle(root: ThreadMessage): string {
  const plain = tiptapToPlainText(root.body).trim();
  if (plain) return plain;
  if (root.attachments?.length) return "Attachment";
  return root.user_name ?? "Thread";
}

function threadPreview(latest: ThreadMessage | null): string {
  if (!latest) return "There are no recent messages in this thread.";

  const plain = tiptapToPlainText(latest.body).trim();
  if (plain) return plain;
  if (latest.attachments?.length) return "Sent an attachment";
  return "There are no recent messages in this thread.";
}

export default function ThreadReplySummary({
  root,
  replies,
  replyCount,
  onClick,
  className,
  indentClassName = "ml-12",
  avatarClassName = "rounded-sm",
}: {
  root: ThreadMessage;
  replies: ThreadMessage[];
  replyCount?: number;
  onClick: () => void;
  className?: string;
  indentClassName?: string;
  avatarClassName?: string;
}) {
  const count = replyCount ?? replies.length;
  const totalMessages = count + 1;
  const participants = threadParticipants(root, replies);
  const latest = lastReplyMessage(replies);
  const title = threadTitle(root);
  const preview = threadPreview(latest);
  const messageLabel = `${totalMessages} ${totalMessages === 1 ? "Message" : "Messages"}`;

  return (
    <div className={cn("relative mb-2", indentClassName, className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute -left-6 top-0 h-5 w-6 rounded-bl-md border-b border-l"
        style={{ borderColor: "var(--border)" }}
      />

      <button
        type="button"
        onClick={onClick}
        className="group flex w-full max-w-sm items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-white/4"
        style={{
          borderColor: "var(--border)",
          background: "var(--surface2)",
        }}>
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-baseline gap-2">
            <span className="min-w-0 truncate text-sm font-semibold text-(--text)">
              {title}
            </span>
            <span className="shrink-0 text-sm font-medium text-sky-400 group-hover:text-sky-300 group-hover:underline">
              {messageLabel}
              <span aria-hidden className="ml-0.5">
                ›
              </span>
            </span>
          </span>
          <span className="mt-1 block truncate text-xs leading-snug text-muted-foreground">
            {preview}
          </span>
        </span>

        {participants.length > 0 ? (
          <span className="flex shrink-0 items-center pt-0.5">
            {participants.map((p, i) => (
              <Avatar
                key={p.user_id}
                className={cn(
                  "h-5 w-5 border-2 border-(--bg)",
                  avatarClassName,
                )}
                style={{
                  marginLeft: i === 0 ? 0 : -6,
                  zIndex: participants.length - i,
                }}>
                <AvatarImage src={p.user_avatar_url} />
                <AvatarFallback className={cn("text-[8px]", avatarClassName)}>
                  {initials(p.user_name)}
                </AvatarFallback>
              </Avatar>
            ))}
          </span>
        ) : null}
      </button>
    </div>
  );
}
