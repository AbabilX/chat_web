import type { ChatMessage } from "@/lib/api/types/chat";
import type { ThreadMessage } from "@/components/team/board/comments/thread-types";

export function chatToThreadMessage(message: ChatMessage): ThreadMessage {
  return {
    id: message.id,
    user_id: message.user_id,
    parent_id: message.parent_id,
    body: message.deleted_at ? "" : message.body,
    created_at: message.created_at,
    user_name: message.user_name,
    user_avatar_url: message.user_avatar_url,
    attachments: (message.attachments ?? []).map((a) => ({
      id: a.id,
      file_name: a.file_name,
      file_url: a.file_url,
      content_type: a.content_type,
      size_bytes: a.size_bytes,
      // Carried through so the thread renderer can show the lock badge.
      locked: a.locked,
    })),
    reactions: message.reactions,
    via_ababilx: message.via_ababilx,
    forwarded_from_name: message.forwarded_from_name,
    forwarded_from_source: message.forwarded_from_source,
  };
}
