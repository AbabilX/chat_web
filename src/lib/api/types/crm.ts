import type { ModuleActions } from "./team";

export type CRMSettings = {
  team_id: string;
  contact_label_singular: string;
  contact_label_plural: string;
  /** 0=Sunday .. 6=Saturday — start of the CRM week for "This Week" buckets. */
  week_start_day: number;
  /** 'HH:MM' 24h local time; empty string disables the daily overdue digest. */
  overdue_digest_time: string;
  timezone: string;
  /** Team currency code (e.g. 'BDT') used for all deal values. */
  currency: string;
};

export type CRMSettingsPatch = Partial<Omit<CRMSettings, "team_id">>;

export type CRMBulkAction = "complete" | "delete" | "reassign";

export type CRMBulkInput = {
  ids: string[];
  action: CRMBulkAction;
  assigned_user_id?: string;
};

export type CRMStage = {
  id: string;
  team_id: string;
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
  is_won: boolean;
  is_lost: boolean;
  is_payment: boolean;
};

export type CRMPipeline = {
  id: string;
  team_id: string;
  name: string;
  is_default: boolean;
  position: number;
  stages?: CRMStage[];
  created_at: string;
};

export type CRMActivityType = {
  id: string;
  team_id: string;
  name: string;
  icon: string;
  color: string;
  position: number;
  is_active: boolean;
};

export type CRMFieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiselect"
  | "checkbox"
  | "url"
  | "phone"
  | "email";

export type CRMFieldDef = {
  id: string;
  team_id: string;
  entity: string;
  key: string;
  label: string;
  type: CRMFieldType;
  options: string[];
  required: boolean;
  position: number;
};

export type CRMConfig = {
  settings: CRMSettings;
  pipelines: CRMPipeline[];
  activity_types: CRMActivityType[];
  fields: CRMFieldDef[];
};

export type CRMOrganizationStatus = "prospect" | "active" | "customer" | "archived" | "deleting";

export type CRMOrganization = {
  id: string;
  team_id: string;
  owner_user_id: string | null;
  name: string;
  logo_url: string;
  website: string;
  industry: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  description: string;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_by: string;
  archived_at: string | null;
  deletion_mode: "archive" | "detached" | "cascade" | null;
  deletion_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  status: CRMOrganizationStatus;
  contact_count: number;
  lead_count: number;
  pipeline_value: number;
  won_value: number;
  paid_value: number;
};

export type CRMOrganizationInput = {
  owner_user_id?: string | null;
  name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  phone?: string;
  email?: string;
  address?: string;
  source?: string;
  description?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
};

export type CRMOrganizationDocument = {
  id: string;
  team_id: string;
  organization_id: string;
  uploaded_by?: string | null;
  title: string;
  description: string;
  file_url: string;
  external_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  uploader_name?: string;
  /** True when the workspace's files are locked: file_url is withheld (links still work). */
  locked?: boolean;
};

// A Contact is a person and may optionally belong to one organization.
export type CRMContact = {
  id: string;
  team_id: string;
  organization_id: string | null;
  owner_user_id: string | null;
  name: string;
  email: string;
  phone: string;
  company: string;
  contact_type: CRMContactType;
  designation: string;
  organization_role: string;
  is_primary_contact: boolean;
  image_url: string;
  source: string;
  tags: string[];
  custom_fields: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
  owner_name?: string;
  organization_name?: string;
  /** Number of leads under this contact. */
  lead_count: number;
  /** Sum of deal_value across this contact's open (non-won, non-lost) leads. */
  total_value: number;
};

export type CRMContactType = "contact" | "organization" | "prospect";

export type CRMContactInput = {
  organization_id?: string | null;
  owner_user_id?: string | null;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contact_type?: CRMContactType;
  designation?: string;
  organization_role?: string;
  is_primary_contact?: boolean;
  image_url?: string;
  source?: string;
  tags?: string[];
  custom_fields?: Record<string, unknown>;
};

// A Lead is a deal/opportunity for a contact — the pipeline stage, money, and
// every deal sub-record (follow-ups, notes, activities, documents, timeline)
// live here.
export type CRMLead = {
  id: string;
  team_id: string;
  contact_id: string;
  organization_id: string | null;
  pipeline_id: string | null;
  stage_id: string | null;
  owner_user_id: string | null;
  title: string;
  deal_value: number;
  payment_due_date: string | null;
  source: string;
  custom_fields: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  contact_company?: string;
  organization_name?: string;
  contact_phone?: string;
  contact_email?: string;
  pipeline_name?: string;
  stage_name?: string;
  stage_color?: string;
  owner_name?: string;
  is_won: boolean;
  is_lost: boolean;
  paid_value: number;
  payment_status: "unpaid" | "partially_paid" | "paid" | "overdue" | "refunded";
  contacts: CRMContact[];
};

export type CRMLeadInput = {
  organization_id?: string;
  contact_ids?: string[];
  pipeline_id?: string | null;
  stage_id?: string | null;
  owner_user_id?: string | null;
  title?: string;
  deal_value?: number;
  source?: string;
  custom_fields?: Record<string, unknown>;
};

export type CRMLeadPayment = {
  id: string;
  team_id: string;
  organization_id: string | null;
  contact_id: string;
  lead_id: string;
  kind: "payment" | "refund";
  amount: number;
  paid_at: string;
  method: string;
  reference: string;
  invoice_reference: string;
  note: string;
  receipt_document_id: string | null;
  created_by: string;
  created_at: string;
  creator_name?: string;
};

export type CRMLeadPaymentInput = {
  kind?: "payment" | "refund";
  amount: number;
  paid_at: string;
  method?: string;
  reference?: string;
  invoice_reference?: string;
  note?: string;
  receipt_document_id?: string | null;
};

export type CRMFollowupPriority = "low" | "medium" | "high";
export type CRMFollowupStatus = "pending" | "done" | "cancelled";

export type CRMFollowup = {
  id: string;
  team_id: string;
  lead_id: string;
  contact_id: string;
  stage_id: string | null;
  assigned_user_id: string | null;
  activity_type_id: string | null;
  scheduled_at: string;
  priority: CRMFollowupPriority;
  status: CRMFollowupStatus;
  outcome: string;
  notes: string;
  created_by: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  contact_name?: string;
  assignee_name?: string;
  activity_type_name?: string;
  stage_name?: string;
  stage_color?: string;
  contact_company?: string;
  contact_phone?: string;
  assignee_avatar_url?: string;
  contacts: CRMContact[];
  attachments: import("./crm-documents").CRMDocument[];
  /** "manual" (default) or "email". Absent on older servers — treat as manual. */
  channel?: CRMFollowupChannel;
  email_subject?: string;
  email_body?: string;
  email_template_id?: string;
  /** False = remind a human to press Send. True = the scheduler sends it. */
  email_auto_send?: boolean;
  email_log_id?: string;
};

export type CRMFollowupChannel = "manual" | "email";

export type CRMFollowupInput = {
  lead_id: string;
  contact_ids?: string[];
  assigned_user_id?: string | null;
  activity_type_id?: string | null;
  scheduled_at: string;
  priority?: CRMFollowupPriority;
  notes?: string;
  channel?: CRMFollowupChannel;
  email_subject?: string;
  email_body?: string;
  email_template_id?: string;
  email_auto_send?: boolean;
};

export type CRMFollowupPatch = {
  assigned_user_id?: string | null;
  activity_type_id?: string | null;
  scheduled_at?: string;
  priority?: CRMFollowupPriority;
  status?: CRMFollowupStatus;
  outcome?: string;
  notes?: string;
  channel?: CRMFollowupChannel;
  email_subject?: string;
  email_body?: string;
  email_template_id?: string;
  email_auto_send?: boolean;
};

export type CRMNote = {
  id: string;
  team_id: string;
  lead_id: string;
  contact_id: string;
  author_user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
};

export type CRMActivity = {
  id: string;
  team_id: string;
  lead_id: string;
  contact_id: string;
  activity_type_id: string | null;
  actor_user_id: string;
  subject: string;
  body: string;
  occurred_at: string;
  created_at: string;
  actor_name?: string;
  activity_type_name?: string;
};

export type CRMTimelineEvent = {
  id: string;
  team_id: string;
  lead_id: string;
  contact_id: string;
  kind: string;
  ref_id?: string;
  actor_user_id: string;
  summary: string;
  /** Structured event payload; stage_changed events carry `to_stage_id`. */
  meta?: {
    to_stage_id?: string;
    contacts?: Array<{ id: string; name: string }>;
    scheduled_at?: string;
    priority?: string;
    status?: string;
    activity?: string;
    assignee?: string;
  } | null;
  description?: string;
  note?: string;
  occurred_at: string;
  created_at: string;
  actor_name?: string;
  contact_name?: string;
  attachments?: import("./crm-documents").CRMDocument[];
};

export type CRMStageCount = {
  stage_id: string;
  name: string;
  color: string;
  count: number;
  /** Sum of deal_value for contacts currently in this stage. */
  value: number;
};

export type CRMDashboard = {
  total_contacts: number;
  /** Sum of deal_value across open (non-won, non-lost) stages. */
  pipeline_value: number;
  /** Sum of deal_value across won stages. */
  won_value: number;
  stage_counts: CRMStageCount[];
  followups_due: number;
  followups_overdue: number;
  followups_today: CRMFollowup[];
  recent_timeline: CRMTimelineEvent[];
};

export type ModulePermissionRow = {
  role: "manager" | "member";
  module: string;
} & ModuleActions;

export type ModulePermissionsResponse = {
  modules: string[];
  permissions: ModulePermissionRow[];
};

export type CRMMemberAccessRow = {
  user_id: string;
  name: string;
  username: string;
  avatar_url: string;
  role: "leader" | "manager" | "member";
  granted: boolean;
  implicit: boolean; // leader/manager — always granted, not toggleable
};

export type CRMMemberAccessResponse = {
  members: CRMMemberAccessRow[];
};

export type CRMSearchHitKind = "organization";

export type CRMSearchHit = {
  kind: CRMSearchHitKind;
  id: string;
  organization_id: string;
  contact_id: string;
  contact_name: string;
  title: string;
  snippet: string;
  created_at: string;
};
