"use client";

import type { ChatMessage } from "@/lib/api/types/chat";

/**
 * "You added Alice", "Bob changed the group photo" — the quiet centered lines
 * between real messages when the group itself changes.
 *
 * The sentence is built here rather than taken from the server's `body`
 * because only this side knows who is reading: the same event reads as "You
 * added Alice" to one member and "Bob added Alice" to another. The body is the
 * fallback for events this build does not recognise, so an older tab still
 * shows something true rather than nothing.
 */
export default function GroupEventRow({
  message,
  currentUserId,
}: {
  message: ChatMessage;
  currentUserId: string;
}) {
  return (
    <div className="py-2 text-center text-xs italic text-muted-foreground">
      {sentence(message, currentUserId)}
    </div>
  );
}

function sentence(message: ChatMessage, currentUserId: string): string {
  const meta = message.meta;
  if (!meta?.event) return message.body;

  const actor = meta.actor_id === currentUserId ? "You" : name(meta.actor_name);
  const target = meta.target_id === currentUserId ? "you" : name(meta.target_name);
  const value = meta.value ?? "";

  switch (meta.event) {
    case "group_created":
      return `${actor} created the group`;
    case "name_changed":
      return `${actor} changed the group name to "${value}"`;
    case "description_changed":
      return value
        ? `${actor} changed the group description`
        : `${actor} removed the group description`;
    case "avatar_changed":
      return value
        ? `${actor} changed the group photo`
        : `${actor} removed the group photo`;
    case "member_added":
      return `${actor} added ${target}`;
    case "member_removed":
      return `${actor} removed ${target}`;
    case "member_left":
      return `${actor} left the group`;
    case "role_changed":
      // Never reads as "You made you an admin": the server refuses a self role
      // change, so actor and target always differ here.
      return value === "admin"
        ? `${actor} made ${target} an admin`
        : `${actor} removed ${target} as an admin`;
    case "permissions_changed":
      return `${actor} changed the group permissions`;
    default:
      return message.body;
  }
}

function name(raw?: string): string {
  const trimmed = raw?.trim() ?? "";
  return trimmed || "Someone";
}
