import type { ChatMessage } from "@/lib/api";

export type TimelineContentProps = {
  messages: ChatMessage[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  currentUserId: string;
  activeThreadRootId?: string | null;
  threadRepliesByRoot: Record<string, ChatMessage[]>;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onOpenThread?: (messageId: string) => void;
  onEditMessage?: (messageId: string, body: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onForwardMessage?: (message: ChatMessage) => void;
  onOpenProfile?: (userId: string) => void;
  highlightMessageId?: string | null;
  emptyLabel: string;
};
