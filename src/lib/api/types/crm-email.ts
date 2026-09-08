/** CRM outbound email: sender identities, templates, and the per-lead send log. */

export type CRMEmailSenderKind = "ababilx" | "user_gmail" | "team_gmail";

export type CRMEmailStatus =
  | "queued"
  | "sent"
  | "failed"
  | "bounced"
  | "complained";

/**
 * Sender status as the settings screens see it. There is deliberately no field
 * for the credential — the server never returns one, and this type must not
 * suggest otherwise.
 */
export type CRMEmailSenderStatus = {
  configured: boolean;
  kind: CRMEmailSenderKind;
  from_email?: string;
  from_name?: string;
  provider?: string;
  is_active: boolean;
  last_verified_at?: string | null;
  last_error?: string;
  daily_sent_count: number;
  daily_limit: number;
  /** False when the server has no encryption key: do not offer to store a password. */
  encryption_ready: boolean;
};

/** Write-only payload. Never echoed back by any endpoint. */
export type CRMEmailSenderInput = {
  from_email: string;
  from_name?: string;
  app_password: string;
  host?: string;
  port?: number;
  username?: string;
};

export type CRMEmailTemplate = {
  id: string;
  team_id: string;
  name: string;
  subject: string;
  body: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CRMEmailTemplateInput = {
  name: string;
  subject?: string;
  body?: string;
  is_active?: boolean;
};

/**
 * One send, stored under the lead. `body` and `due_amount_at_send` are frozen
 * at send time: the template may be edited and the balance may be paid off, but
 * what the customer was actually told must not change.
 */
export type CRMEmailLog = {
  id: string;
  team_id: string;
  contact_id: string;
  lead_id?: string;
  followup_id?: string;
  to_email: string;
  subject: string;
  body: string;
  template_id?: string;
  template_name?: string;
  sender_kind: CRMEmailSenderKind;
  sender_email: string;
  due_amount_at_send?: number;
  status: CRMEmailStatus;
  provider_msg_id?: string;
  error?: string;
  sent_by: string;
  sent_at?: string | null;
  created_at: string;
  sent_by_name?: string;
  contact_name?: string;
};

export type CRMSendEmailInput = {
  to?: string;
  subject?: string;
  body?: string;
  template_id?: string;
  followup_id?: string;
  /** Bypasses the same-lead-same-template duplicate guard. Never the suppression list. */
  force?: boolean;
};

export type CRMEmailSuppression = {
  email: string;
  reason: string;
  created_at: string;
};

/**
 * Placeholder keys the composer offers. Kept in sync with the server's
 * KnownPlaceholders() in services/crm/render.go — the runtime array lives in
 * ../user/crm-email.ts because this module is re-exported with `export type *`.
 */
export type CRMEmailPlaceholder =
  | "contact_name"
  | "lead_title"
  | "deal_value"
  | "paid_amount"
  | "due_amount"
  | "due_date"
  | "team_name"
  | "sender_name"
  | "currency";
