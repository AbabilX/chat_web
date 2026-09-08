"use client";

import type { ChatUserSummary } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { chatInitials } from "../chat-utils";

export default function ConnectionUserRow({
  user,
  onMessage,
}: {
  user: ChatUserSummary;
  onMessage: (userId: string) => void;
}) {
  // One action for everyone. There is no "connect first" state left: the DM
  // opens, and a stranger answers the message request inside the thread.
  // Blocked pairs never reach discovery at all.
  const canMessage = user.can_message;

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--surface2)]">
      <Avatar className="h-8 w-8 rounded-md">
        <AvatarImage src={user.avatar_url} alt="" />
        <AvatarFallback className="rounded-md text-[10px]">
          {chatInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--text)]">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {user.username ? `@${user.username}` : ""}
          {user.shared_workspace ? (user.username ? " · " : "") + "Shared workspace" : ""}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        disabled={!canMessage}
        onClick={() => onMessage(user.user_id)}
      >
        Message
      </Button>
    </div>
  );
}
