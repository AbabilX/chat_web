import type { KanbanReactionGroup, KanbanStatus } from "./kanban";

export type KanbanRoomNotify = "follow" | "normal" | "mute";

export type KanbanRoomMember = {
  user_id: string;
  name?: string;
  avatar_url?: string;
};

/** A discussion card on a board: a topic plus a message stream, no assignee. */
export type KanbanRoom = {
  id: string;
  board_id: string;
  team_id: string;
  topic: string;
  status: KanbanStatus;
  position: number;
  message_count: number;
  last_message_at?: string;
  last_message_body?: string;
  last_sender_name?: string;
  last_message_id?: string;
  answer_message_id?: string;
  answer_body?: string;
  answered_at?: string;
  archived_at?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  unread_count: number;
  notify?: KanbanRoomNotify;
  participants?: KanbanRoomMember[];
};

export type KanbanRoomMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name?: string;
  sender_avatar_url?: string;
  body: string;
  thread_root_id?: string;
  reply_count: number;
  kind: "text" | "poll" | "system";
  meta?: Record<string, unknown>;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  is_answer?: boolean;
  reactions?: KanbanReactionGroup[];
  /** Members whose read position sits on this message. */
  read_by?: KanbanRoomMember[];
};

export type KanbanRoomMessagesPage = {
  room: KanbanRoom;
  messages: KanbanRoomMessage[];
};

export type KanbanRoomMessageInput = {
  body: string;
  thread_root_id?: string;
  kind?: KanbanRoomMessage["kind"];
  meta?: Record<string, unknown>;
  mention_ids?: string[];
};
