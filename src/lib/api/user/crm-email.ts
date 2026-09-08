import { apiFetch, jsonHeaders } from "../core";
import type {
  CRMEmailLog,
  CRMEmailPlaceholder,
  CRMEmailSenderInput,
  CRMEmailSenderStatus,
  CRMEmailSuppression,
  CRMEmailTemplate,
  CRMEmailTemplateInput,
  CRMSendEmailInput,
} from "../types/crm-email";

/** Insert chips for the composer. Mirrors KnownPlaceholders() on the server. */
export const CRM_EMAIL_PLACEHOLDERS: readonly CRMEmailPlaceholder[] = [
  "contact_name",
  "lead_title",
  "deal_value",
  "paid_amount",
  "due_amount",
  "due_date",
  "team_name",
  "sender_name",
  "currency",
];

// ---- Sending + history (the log lives under the lead) ----

export function sendCRMLeadEmail(leadId: string, body: CRMSendEmailInput) {
  return apiFetch<CRMEmailLog>(`/api/teams/crm/leads/${leadId}/emails`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function listCRMLeadEmails(leadId: string) {
  return apiFetch<CRMEmailLog[]>(`/api/teams/crm/leads/${leadId}/emails`);
}

export function listCRMContactEmails(contactId: string) {
  return apiFetch<CRMEmailLog[]>(`/api/teams/crm/contacts/${contactId}/emails`);
}

// ---- Templates ----

export function listCRMEmailTemplates(includeInactive = false) {
  const q = includeInactive ? "?include_inactive=true" : "";
  return apiFetch<CRMEmailTemplate[]>(`/api/teams/crm/email-templates${q}`);
}

export function createCRMEmailTemplate(body: CRMEmailTemplateInput) {
  return apiFetch<CRMEmailTemplate>(`/api/teams/crm/email-templates`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function updateCRMEmailTemplate(id: string, body: CRMEmailTemplateInput) {
  return apiFetch<CRMEmailTemplate>(`/api/teams/crm/email-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function deleteCRMEmailTemplate(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/email-templates/${id}`, {
    method: "DELETE",
  });
}

// ---- Sender identities ----
//
// The password travels one way only: these calls send it, nothing returns it.

export function getCRMEmailSender() {
  return apiFetch<CRMEmailSenderStatus>(`/api/teams/crm/email-sender`);
}

export function connectCRMEmailSender(body: CRMEmailSenderInput) {
  return apiFetch<CRMEmailSenderStatus>(`/api/teams/crm/email-sender`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function disconnectCRMEmailSender() {
  return apiFetch<{ success: boolean }>(`/api/teams/crm/email-sender`, {
    method: "DELETE",
  });
}

export function getCRMTeamEmailSender() {
  return apiFetch<CRMEmailSenderStatus>(`/api/teams/crm/email-sender/team`);
}

export function connectCRMTeamEmailSender(body: CRMEmailSenderInput) {
  return apiFetch<CRMEmailSenderStatus>(`/api/teams/crm/email-sender/team`, {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function disconnectCRMTeamEmailSender() {
  return apiFetch<{ success: boolean }>(`/api/teams/crm/email-sender/team`, {
    method: "DELETE",
  });
}

// ---- Suppressions ----

export function listCRMEmailSuppressions() {
  return apiFetch<CRMEmailSuppression[]>(`/api/teams/crm/email-suppressions`);
}

export function removeCRMEmailSuppression(email: string) {
  return apiFetch<{ success: boolean }>(
    `/api/teams/crm/email-suppressions?email=${encodeURIComponent(email)}`,
    { method: "DELETE" },
  );
}
