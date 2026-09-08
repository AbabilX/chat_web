import type { ChatConversation } from "./chat";

export type ChatWebhook = {
  id: string;
  conversation_id: string;
  name: string;
  avatar_url?: string;
  created_by?: string;
  created_at: string;
  last_used_at?: string | null;
};

export type ChatWebhookCreated = {
  conversation: ChatConversation;
  webhook: ChatWebhook;
  url: string;
  token: string;
};
