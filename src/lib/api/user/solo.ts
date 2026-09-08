import { apiFetch, jsonHeaders } from "../core";
import type {
  AdminSoloPaymentList,
  SoloPaymentRequest,
  SoloPaymentStatusResponse,
} from "../types/solo";

/** Latest solo payment request for the caller + bKash pricing meta + premium state. */
export function getSoloPaymentStatus() {
  return apiFetch<SoloPaymentStatusResponse>("/api/solo/payments");
}

export type SoloPaymentSubmitInput = {
  sender_number: string;
  trx_id: string;
  months: number;
};

/** Submit a new bKash payment for solo premium. */
export function submitSoloPayment(body: SoloPaymentSubmitInput) {
  return apiFetch<{ request: SoloPaymentRequest }>("/api/solo/payments", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

/** Edit an on-hold solo request and resend it for review. */
export function resubmitSoloPayment(id: string, body: SoloPaymentSubmitInput) {
  return apiFetch<{ request: SoloPaymentRequest }>(`/api/solo/payments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

/** Admin: list solo payment requests, optionally filtered by status. */
export function adminListSoloPayments(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<AdminSoloPaymentList>(`/api/admin/solo-payments${qs}`);
}

/** Admin: approve (grant premium to buyer), hold (with message), or reject. */
export function adminReviewSoloPayment(
  id: string,
  body: { action: "approve" | "hold" | "reject"; message?: string; months?: number },
) {
  return apiFetch<{ request: SoloPaymentRequest }>(`/api/admin/solo-payments/${id}/review`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
