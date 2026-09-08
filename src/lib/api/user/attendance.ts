import { apiFetch, jsonHeaders } from "../core";
import type {
  AttendanceSettings,
  AttendanceOffDay,
  AttendanceStatusResponse,
  AttendanceDailyRecord,
  AttendanceLiveResponse,
  AttendanceTeamTimelineResponse,
  AttendanceHistoryResponse,
  AttendanceTeamSummaryResponse,
  AttendanceWorkLog,
  AttendanceWorkLogResponse,
  AttendanceFocusSession,
  AttendanceFocusSessionsResponse,
} from "../types/attendance";

export function getAttendanceSettings() {
  return apiFetch<AttendanceSettings>("/api/attendance/settings");
}

export function putAttendanceSettings(body: Partial<AttendanceSettings>) {
  return apiFetch<AttendanceSettings>("/api/attendance/settings", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function getAttendanceOffDays(month?: string) {
  const qs = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiFetch<AttendanceOffDay[]>(`/api/attendance/off-days${qs}`);
}

export function postAttendanceOffDay(date: string, note?: string) {
  return apiFetch<AttendanceOffDay>("/api/attendance/off-days", {
    method: "POST",
    body: JSON.stringify({ date, note: note ?? "" }),
    headers: jsonHeaders,
  });
}

export function deleteAttendanceOffDay(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/attendance/off-days/${id}`, {
    method: "DELETE",
  });
}

// Opens today's clock after the member answers the start-of-day prompt. Idempotent:
// starting an already-running day returns the current status rather than failing.
export function startAttendanceDay() {
  return apiFetch<AttendanceStatusResponse>("/api/attendance/start", {
    method: "POST",
  });
}

export function getAttendanceStatus() {
  return apiFetch<AttendanceStatusResponse>("/api/attendance/status");
}

// Combined endpoint: accumulates time when clocked in AND returns the full status,
// so a single loop replaces separate heartbeat + status polls.
export function pingAttendanceHeartbeat() {
  return apiFetch<AttendanceStatusResponse>("/api/attendance/heartbeat", {
    method: "POST",
  });
}

export function extendAttendanceClock(minutes: number) {
  return apiFetch<AttendanceDailyRecord>("/api/attendance/extend", {
    method: "POST",
    body: JSON.stringify({ minutes }),
    headers: jsonHeaders,
  });
}

export function getAttendanceLive() {
  return apiFetch<AttendanceLiveResponse>("/api/attendance/live");
}

export function getAttendanceTeamTimeline() {
  return apiFetch<AttendanceTeamTimelineResponse>("/api/attendance/team-timeline");
}

export function getAttendanceHistory(month?: string) {
  const qs = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiFetch<AttendanceHistoryResponse>(`/api/attendance/history${qs}`);
}

export function getAttendanceTeamSummary(month?: string) {
  const qs = month ? `?month=${encodeURIComponent(month)}` : "";
  return apiFetch<AttendanceTeamSummaryResponse>(
    `/api/attendance/team-summary${qs}`,
  );
}

// Work log: timeline of what a member worked on during a day. Leaders may pass a
// userId to view/edit any team member's log.
export function getAttendanceWorkLog(date?: string, userId?: string) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (userId) params.set("user_id", userId);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<AttendanceWorkLogResponse>(`/api/attendance/work-log${qs}`);
}

export function createAttendanceWorkLog(
  title: string,
  description: string,
  endedAt: string,
  userId?: string,
  date?: string,
) {
  return apiFetch<AttendanceWorkLog>("/api/attendance/work-log", {
    method: "POST",
    body: JSON.stringify({ title, description, ended_at: endedAt, user_id: userId, date }),
    headers: jsonHeaders,
  });
}

export function updateAttendanceWorkLog(
  id: string,
  title: string,
  description: string,
  endedAt: string,
  startedAt?: string,
) {
  return apiFetch<AttendanceWorkLog>(`/api/attendance/work-log/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      title,
      description,
      ended_at: endedAt,
      ...(startedAt ? { started_at: startedAt } : {}),
    }),
    headers: jsonHeaders,
  });
}

export function deleteAttendanceWorkLog(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/attendance/work-log/${id}`, {
    method: "DELETE",
  });
}

export function getAttendanceFocusSessions() {
  return apiFetch<AttendanceFocusSessionsResponse>("/api/attendance/focus-sessions");
}

export function startAttendanceFocusSession(body: {
  title: string;
  planned_minutes: number;
  proof_url?: string;
  proof_file_name?: string;
  proof_mime_type?: string;
  proof_size_bytes?: number;
}) {
  return apiFetch<AttendanceFocusSession>("/api/attendance/focus-sessions", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function stopAttendanceFocusSession(id: string) {
  return apiFetch<AttendanceFocusSession>(`/api/attendance/focus-sessions/${id}/stop`, {
    method: "POST",
  });
}

export async function uploadAttendanceProof(file: File) {
  const presign = await apiFetch<{ upload_url: string; public_url: string }>(
    "/api/attendance/focus-sessions/proof/presign",
    {
      method: "POST",
      body: JSON.stringify({ content_type: file.type, size_bytes: file.size }),
      headers: jsonHeaders,
    },
  );
  const upload = await fetch(presign.upload_url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!upload.ok) throw new Error("Failed to upload proof image");
  return presign.public_url;
}
