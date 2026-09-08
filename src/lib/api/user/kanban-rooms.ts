import { apiFetch, jsonHeaders } from "../core";
import type {
  KanbanReactionGroup,
  KanbanRoom,
  KanbanRoomMessage,
  KanbanRoomMessageInput,
  KanbanRoomMessagesPage,
  KanbanRoomNotify,
  KanbanStatus,
} from "../types";

export function listKanbanRooms(boardId: string) {
  return apiFetch<KanbanRoom[]>(`/api/teams/kanban/boards/${boardId}/rooms`);
}

export function createKanbanRoom(boardId: string, topic: string) {
  return apiFetch<KanbanRoom>(`/api/teams/kanban/boards/${boardId}/rooms`, {
    method: "POST",
    body: JSON.stringify({ topic }),
    headers: jsonHeaders,
  });
}

export function patchKanbanRoom(
  roomId: string,
  patch: { topic?: string; archived?: boolean },
) {
  return apiFetch<KanbanRoom>(`/api/teams/kanban/rooms/${roomId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
    headers: jsonHeaders,
  });
}

export function moveKanbanRoom(
  roomId: string,
  status: KanbanStatus,
  position: number,
) {
  return apiFetch<KanbanRoom>(`/api/teams/kanban/rooms/${roomId}/move`, {
    method: "PATCH",
    body: JSON.stringify({ status, position }),
    headers: jsonHeaders,
  });
}

export function deleteKanbanRoom(roomId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/kanban/rooms/${roomId}`, {
    method: "DELETE",
  });
}

export function listKanbanRoomMessages(
  roomId: string,
  params: { before?: string; threadRootId?: string; limit?: number } = {},
) {
  const query = new URLSearchParams();
  if (params.before) query.set("before", params.before);
  if (params.threadRootId) query.set("thread_root_id", params.threadRootId);
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<KanbanRoomMessagesPage>(
    `/api/teams/kanban/rooms/${roomId}/messages${qs ? `?${qs}` : ""}`,
  );
}

export function sendKanbanRoomMessage(
  roomId: string,
  input: KanbanRoomMessageInput,
) {
  return apiFetch<KanbanRoomMessage>(
    `/api/teams/kanban/rooms/${roomId}/messages`,
    {
      method: "POST",
      body: JSON.stringify(input),
      headers: jsonHeaders,
    },
  );
}

export function editKanbanRoomMessage(messageId: string, body: string) {
  return apiFetch<KanbanRoomMessage>(
    `/api/teams/kanban/room-messages/${messageId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ body }),
      headers: jsonHeaders,
    },
  );
}

export function deleteKanbanRoomMessage(messageId: string) {
  return apiFetch<{ ok: boolean }>(
    `/api/teams/kanban/room-messages/${messageId}`,
    { method: "DELETE" },
  );
}

/** Toggling ✅ can also pin the message as the room answer (answer_changed). */
export function toggleKanbanRoomReaction(messageId: string, emoji: string) {
  return apiFetch<{
    reactions: KanbanReactionGroup[];
    answer_changed: boolean;
  }>(`/api/teams/kanban/room-messages/${messageId}/reactions`, {
    method: "POST",
    body: JSON.stringify({ emoji }),
    headers: jsonHeaders,
  });
}

export function markKanbanRoomRead(roomId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/kanban/rooms/${roomId}/read`, {
    method: "POST",
  });
}

export function pingKanbanRoomTyping(roomId: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/kanban/rooms/${roomId}/typing`, {
    method: "POST",
  });
}

/** Announce that the caller is inside (or leaving) a room, for live presence. */
export function pingKanbanRoomPresence(
  roomId: string,
  state: "join" | "leave",
) {
  return apiFetch<{ ok: boolean }>(
    `/api/teams/kanban/rooms/${roomId}/presence`,
    {
      method: "POST",
      body: JSON.stringify({ state }),
      headers: jsonHeaders,
    },
  );
}

export function setKanbanRoomNotify(roomId: string, notify: KanbanRoomNotify) {
  return apiFetch<{ notify: KanbanRoomNotify }>(
    `/api/teams/kanban/rooms/${roomId}/prefs`,
    {
      method: "PUT",
      body: JSON.stringify({ notify }),
      headers: jsonHeaders,
    },
  );
}
