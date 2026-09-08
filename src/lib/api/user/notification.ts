import { apiFetch, jsonHeaders } from "../core";
import type { NotificationsResponse } from "../types/notification";

export function getNotifications() {
  return apiFetch<NotificationsResponse>("/api/notifications");
}

export function markNotificationRead(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/notifications/${id}/read`, {
    method: "POST",
    headers: jsonHeaders,
  });
}

export function markAllNotificationsRead() {
  return apiFetch<{ ok: boolean }>("/api/notifications/read-all", {
    method: "POST",
    headers: jsonHeaders,
  });
}

/** Mark unread inbox notifications for a conversation or task the user just opened. */
export function markNotificationsMatching(body: {
  conversation_id?: string;
  task_id?: string;
}) {
  return apiFetch<{ ok: boolean; ids?: string[] }>(
    "/api/notifications/read-matching",
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  );
}
