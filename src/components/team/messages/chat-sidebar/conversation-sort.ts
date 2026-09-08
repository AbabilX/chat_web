import type { ChatConversation } from "@/lib/api";

/** Groups + DMs in one WhatsApp-style order: unread first, then most recent. */
export function sortConversations(items: ChatConversation[]) {
  return [...items].sort((a, b) => {
    const aUnread = a.unread_count > 0 ? 1 : 0;
    const bUnread = b.unread_count > 0 ? 1 : 0;
    if (aUnread !== bUnread) return bUnread - aUnread;
    const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
    const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
    return tb - ta;
  });
}
