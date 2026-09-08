import { apiFetch, jsonHeaders } from "../core";
import type {
  ChatConnection,
  ChatConversation,
  ChatDiscoverySettings,
  ChatScope,
  ChatSidebar,
  ChatUserSearchResult,
} from "../types/chat";

/**
 * The independent conversation list: everything the user belongs to, personal
 * and workspace alike. `scope` narrows it to one side of the filter tabs.
 */
export function listAllChatConversations(scope?: ChatScope, teamId?: string) {
  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);
  if (teamId) params.set("team_id", teamId);
  const query = params.toString();
  return apiFetch<ChatSidebar>(
    `/api/chat/conversations${query ? `?${query}` : ""}`,
  );
}

/** Create a team-less group with people you can already message. */
export function createPersonalGroup(name: string, memberIds: string[]) {
  return apiFetch<ChatConversation>("/api/chat/groups", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ name, member_ids: memberIds }),
  });
}

/**
 * Find people by username (prefix), exact email or exact phone. The server
 * decides which one the query is — the caller never says.
 */
export function searchChatUsers(query: string, limit = 20) {
  const params = new URLSearchParams({ query, limit: String(limit) });
  return apiFetch<ChatUserSearchResult>(
    `/api/chat/users/search?${params.toString()}`,
  );
}

export function listChatConnections() {
  return apiFetch<{ connections: ChatConnection[] }>("/api/chat/connections");
}

export function listChatConnectionRequests() {
  return apiFetch<{ requests: ChatConnection[]; sent: ChatConnection[] }>(
    "/api/chat/connections/requests",
  );
}

export function sendChatConnectionRequest(userId: string) {
  return apiFetch<ChatConnection>("/api/chat/connections/requests", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ user_id: userId }),
  });
}

export function acceptChatConnectionRequest(requestId: string) {
  return apiFetch<ChatConnection>(
    `/api/chat/connections/requests/${requestId}/accept`,
    { method: "POST" },
  );
}

export function rejectChatConnectionRequest(requestId: string) {
  return apiFetch<ChatConnection>(
    `/api/chat/connections/requests/${requestId}/reject`,
    { method: "POST" },
  );
}

export function listBlockedChatUsers() {
  return apiFetch<{ blocked: ChatConnection[] }>(
    "/api/chat/connections/blocked",
  );
}

export function blockChatUser(userId: string) {
  return apiFetch<ChatConnection>(`/api/chat/connections/${userId}/block`, {
    method: "POST",
  });
}

/** Disconnect, or lift a block you placed. Message history is untouched. */
export function removeChatConnection(userId: string) {
  return apiFetch<void>(`/api/chat/connections/${userId}`, { method: "DELETE" });
}

export function getChatDiscoverySettings() {
  return apiFetch<ChatDiscoverySettings>("/api/me/discovery");
}

export function updateChatDiscoverySettings(
  body: Partial<ChatDiscoverySettings>,
) {
  return apiFetch<ChatDiscoverySettings>("/api/me/discovery", {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
}

/**
 * Answers an incoming message request from inside the thread, for someone who
 * wants to clear the bar without replying yet. Replying accepts on its own.
 */
export function acceptChatMessageRequest(conversationId: string) {
  return apiFetch<{ request_state: string }>(
    `/api/chat/conversations/${conversationId}/accept`,
    { method: "POST" },
  );
}

/**
 * "Delete for me" on a personal DM — clears the thread from this account's
 * list without blocking. A later message from the same person brings it back
 * as a fresh request, which is exactly what Delete is supposed to mean.
 */
export function hideChatDM(conversationId: string) {
  return apiFetch<void>(`/api/chat/conversations/${conversationId}/hide`, {
    method: "POST",
  });
}

/**
 * Personal-group identity. Every field is optional and an omitted one is left
 * alone — renaming a group must not wipe its description — so `undefined`
 * means "not supplied" and an empty string means "clear it".
 */
export function updateChatGroupInfo(
  conversationId: string,
  patch: {
    name?: string;
    description?: string;
    avatar_url?: string;
    banner_url?: string;
  },
) {
  return apiFetch<ChatConversation>(
    `/api/chat/conversations/${conversationId}/info`,
    { method: "PATCH", headers: jsonHeaders, body: JSON.stringify(patch) },
  );
}

/**
 * Both permission switches go up together: they live on one screen, so a
 * client changing one always knows the other.
 */
export function updateChatGroupPermissions(
  conversationId: string,
  editInfoRole: "admin" | "member",
  addMembersRole: "admin" | "member",
) {
  return apiFetch<ChatConversation>(
    `/api/chat/conversations/${conversationId}/permissions`,
    {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({
        edit_info_role: editInfoRole,
        add_members_role: addMembersRole,
      }),
    },
  );
}

/** Promote a member to admin, or demote them back. */
export function setChatGroupMemberRole(
  conversationId: string,
  userId: string,
  role: "admin" | "member",
) {
  return apiFetch<void>(
    `/api/chat/conversations/${conversationId}/members/${userId}/role`,
    { method: "PUT", headers: jsonHeaders, body: JSON.stringify({ role }) },
  );
}

/**
 * Eject a member. Removing yourself is `leave`, not this, and the server
 * refuses to remove an admin until they have been demoted — that extra step is
 * what stops one admin quietly clearing out the others.
 */
export function removeChatGroupMember(conversationId: string, userId: string) {
  return apiFetch<void>(
    `/api/chat/conversations/${conversationId}/members/${userId}`,
    { method: "DELETE" },
  );
}
