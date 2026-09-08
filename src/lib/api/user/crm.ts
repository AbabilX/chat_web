import { apiFetch, jsonHeaders } from "../core";
import { discardCRMDocumentUpload } from "./crm-documents";
import type {
  CRMActivity,
  CRMActivityType,
  CRMConfig,
  CRMContact,
  CRMContactInput,
  CRMDashboard,
  CRMFieldDef,
  CRMFieldType,
  CRMFollowup,
  CRMFollowupInput,
  CRMFollowupPatch,
  CRMBulkInput,
  CRMLead,
  CRMLeadInput,
  CRMNote,
  CRMSearchHit,
  CRMPipeline,
  CRMSettings,
  CRMSettingsPatch,
  CRMStage,
  CRMTimelineEvent,
  ModulePermissionsResponse,
  CRMMemberAccessResponse,
  CRMOrganization,
  CRMOrganizationInput,
  CRMOrganizationDocument,
  CRMLeadPayment,
  CRMLeadPaymentInput,
} from "../types/crm";
import type { ModuleActions } from "../types/team";

// ---- Dashboard ----
export function getCRMDashboard() {
  return apiFetch<CRMDashboard>("/api/teams/crm/dashboard");
}

// ---- Config ----
export function getCRMConfig() {
  return apiFetch<CRMConfig>("/api/teams/crm/config");
}

export function updateCRMSettings(body: CRMSettingsPatch) {
  return apiFetch<CRMSettings>("/api/teams/crm/settings", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function createCRMPipeline(body: { name: string; position?: number }) {
  return apiFetch<CRMPipeline>("/api/teams/crm/pipelines", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMPipeline(id: string, body: { name: string; position?: number }) {
  return apiFetch<{ updated: boolean }>(`/api/teams/crm/pipelines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMPipeline(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/pipelines/${id}`, { method: "DELETE" });
}
export function applyCRMPipelineTemplate(key: "sales" | "marketing" | "vendor") {
  return apiFetch<{ pipeline_id: string }>("/api/teams/crm/pipelines/from-template", {
    method: "POST",
    body: JSON.stringify({ key }),
    headers: jsonHeaders,
  });
}

export function createCRMStage(body: {
  pipeline_id: string;
  name: string;
  color?: string;
  position?: number;
  is_won?: boolean;
  is_lost?: boolean;
  is_payment?: boolean;
}) {
  return apiFetch<CRMStage>("/api/teams/crm/stages", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMStage(
  id: string,
  body: { name: string; color?: string; position?: number; is_won?: boolean; is_lost?: boolean; is_payment?: boolean },
) {
  return apiFetch<{ updated: boolean }>(`/api/teams/crm/stages/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMStage(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/stages/${id}`, { method: "DELETE" });
}

export function createCRMActivityType(body: {
  name: string;
  icon?: string;
  color?: string;
  position?: number;
}) {
  return apiFetch<CRMActivityType>("/api/teams/crm/activity-types", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMActivityType(
  id: string,
  body: { name: string; icon?: string; color?: string; position?: number; is_active?: boolean },
) {
  return apiFetch<{ updated: boolean }>(`/api/teams/crm/activity-types/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMActivityType(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/activity-types/${id}`, { method: "DELETE" });
}

export function createCRMField(body: {
  key: string;
  label: string;
  type: CRMFieldType;
  options?: string[];
  required?: boolean;
  position?: number;
}) {
  return apiFetch<CRMFieldDef>("/api/teams/crm/fields", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMField(
  id: string,
  body: { label: string; type: CRMFieldType; options?: string[]; required?: boolean; position?: number },
) {
  return apiFetch<{ updated: boolean }>(`/api/teams/crm/fields/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMField(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/fields/${id}`, { method: "DELETE" });
}

// ---- Organizations (optional account/company layer) ----
export function listCRMOrganizations(params?: {
  q?: string;
  include_archived?: boolean;
  limit?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.include_archived) qs.set("include_archived", "true");
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return apiFetch<CRMOrganization[]>(`/api/teams/crm/organizations${query ? `?${query}` : ""}`);
}
export function getCRMOrganization(id: string) {
  return apiFetch<CRMOrganization>(`/api/teams/crm/organizations/${id}`);
}
export function getCRMOrganizationTimeline(id: string, limit = 100) {
  return apiFetch<CRMTimelineEvent[]>(`/api/teams/crm/organizations/${id}/timeline?limit=${limit}`);
}
export function createCRMOrganization(body: CRMOrganizationInput) {
  return apiFetch<CRMOrganization>("/api/teams/crm/organizations", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMOrganization(id: string, body: CRMOrganizationInput) {
  return apiFetch<CRMOrganization>(`/api/teams/crm/organizations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function removeCRMOrganization(id: string, mode: "archive" | "detach" | "cascade") {
  return apiFetch<CRMOrganization>(`/api/teams/crm/organizations/${id}/remove`, {
    method: "POST",
    body: JSON.stringify({ mode }),
    headers: jsonHeaders,
  });
}
export function restoreCRMOrganization(id: string) {
  return apiFetch<CRMOrganization>(`/api/teams/crm/organizations/${id}/restore`, {
    method: "POST",
    headers: jsonHeaders,
  });
}
export function listCRMOrganizationDocuments(id: string) {
  return apiFetch<CRMOrganizationDocument[]>(`/api/teams/crm/organizations/${id}/documents`);
}
export function saveCRMOrganizationDocument(
  id: string,
  body: {
    title?: string;
    description?: string;
    file_url?: string;
    external_url?: string;
    file_name?: string;
    mime_type?: string;
    size_bytes?: number;
  },
) {
  return apiFetch<CRMOrganizationDocument>(`/api/teams/crm/organizations/${id}/documents`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function presignCRMOrganizationDocument(
  id: string,
  file: Pick<File, "name" | "type" | "size">,
) {
  return apiFetch<{ upload_url: string; public_url: string; object_key: string }>(
    `/api/teams/crm/organizations/${id}/documents/presign`,
    {
      method: "POST",
      body: JSON.stringify({
        file_name: file.name,
        content_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      }),
      headers: jsonHeaders,
    },
  );
}
export async function uploadCRMOrganizationDocument(
  id: string,
  file: File,
  meta?: { title?: string; description?: string },
) {
  const presign = await presignCRMOrganizationDocument(id, file);
  const response = await fetch(presign.upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!response.ok) {
    void discardCRMDocumentUpload(presign.public_url).catch(() => undefined);
    throw new Error("Upload failed");
  }
  try {
    return await saveCRMOrganizationDocument(id, {
      title: meta?.title || file.name,
      description: meta?.description,
      file_url: presign.public_url,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    });
  } catch (error) {
    void discardCRMDocumentUpload(presign.public_url).catch(() => undefined);
    throw error;
  }
}
export function deleteCRMOrganizationDocument(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/organization-documents/${id}`, {
    method: "DELETE",
  });
}

// ---- Contacts (people; organization is optional) ----
export function listCRMContacts(params?: { owner_id?: string; organization_id?: string; q?: string }) {
  const qs = new URLSearchParams();
  if (params?.owner_id) qs.set("owner_id", params.owner_id);
  if (params?.organization_id) qs.set("organization_id", params.organization_id);
  if (params?.q) qs.set("q", params.q);
  const s = qs.toString();
  return apiFetch<CRMContact[]>(`/api/teams/crm/contacts${s ? `?${s}` : ""}`);
}
export function getCRMContact(id: string) {
  return apiFetch<CRMContact>(`/api/teams/crm/contacts/${id}`);
}
export function createCRMContact(body: CRMContactInput) {
  return apiFetch<CRMContact>("/api/teams/crm/contacts", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMContact(id: string, body: CRMContactInput) {
  return apiFetch<CRMContact>(`/api/teams/crm/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMContact(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/contacts/${id}`, { method: "DELETE" });
}
export function getCRMContactTimeline(id: string) {
  return apiFetch<CRMTimelineEvent[]>(`/api/teams/crm/contacts/${id}/timeline`);
}
export function listCRMTimeline(limit = 100) {
  return apiFetch<CRMTimelineEvent[]>(`/api/teams/crm/timeline?limit=${limit}`);
}

// ---- Leads (the deal layer — a contact can have many) ----
export function listCRMLeads(params?: {
  contact_id?: string;
  pipeline_id?: string;
  stage_id?: string;
  owner_id?: string;
  organization_id?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.contact_id) qs.set("contact_id", params.contact_id);
  if (params?.pipeline_id) qs.set("pipeline_id", params.pipeline_id);
  if (params?.stage_id) qs.set("stage_id", params.stage_id);
  if (params?.owner_id) qs.set("owner_id", params.owner_id);
  if (params?.organization_id) qs.set("organization_id", params.organization_id);
  if (params?.q) qs.set("q", params.q);
  const s = qs.toString();
  return apiFetch<CRMLead[]>(`/api/teams/crm/leads${s ? `?${s}` : ""}`);
}
export function listCRMContactLeads(contactId: string) {
  return apiFetch<CRMLead[]>(`/api/teams/crm/contacts/${contactId}/leads`);
}
export function getCRMLead(id: string) {
  return apiFetch<CRMLead>(`/api/teams/crm/leads/${id}`);
}
export function createCRMLead(organizationId: string, body: CRMLeadInput) {
  return apiFetch<CRMLead>(`/api/teams/crm/organizations/${organizationId}/leads`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMLead(id: string, body: CRMLeadInput) {
  return apiFetch<CRMLead>(`/api/teams/crm/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMLead(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/leads/${id}`, { method: "DELETE" });
}
export function getCRMLeadTimeline(id: string) {
  return apiFetch<CRMTimelineEvent[]>(`/api/teams/crm/leads/${id}/timeline`);
}

export function listCRMLeadPayments(id: string) {
  return apiFetch<CRMLeadPayment[]>(`/api/teams/crm/leads/${id}/payments`);
}
export function createCRMLeadPayment(id: string, body: CRMLeadPaymentInput) {
  return apiFetch<CRMLeadPayment>(`/api/teams/crm/leads/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMLeadPayment(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/payments/${id}`, {
    method: "DELETE",
  });
}

// ---- Notes (lead-scoped) ----
export function listCRMNotes(leadId: string) {
  return apiFetch<CRMNote[]>(`/api/teams/crm/leads/${leadId}/notes`);
}
export function createCRMNote(leadId: string, body: string) {
  return apiFetch<CRMNote>(`/api/teams/crm/leads/${leadId}/notes`, {
    method: "POST",
    body: JSON.stringify({ body }),
    headers: jsonHeaders,
  });
}
export function updateCRMNote(noteId: string, body: string) {
  return apiFetch<{ updated: boolean }>(`/api/teams/crm/notes/${noteId}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
    headers: jsonHeaders,
  });
}
export function deleteCRMNote(noteId: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/notes/${noteId}`, { method: "DELETE" });
}

// ---- Activities (lead-scoped) ----
export function listCRMActivities(leadId: string) {
  return apiFetch<CRMActivity[]>(`/api/teams/crm/leads/${leadId}/activities`);
}
export function createCRMActivity(
  leadId: string,
  body: { activity_type_id?: string | null; subject?: string; body?: string; occurred_at?: string },
) {
  return apiFetch<CRMActivity>(`/api/teams/crm/leads/${leadId}/activities`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

// ---- Follow-ups (lead-scoped) ----
export function listCRMFollowups(params?: {
  status?: string;
  assignee_id?: string;
  contact_id?: string;
  lead_id?: string;
  stage_id?: string;
  from?: string;
  to?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.assignee_id) qs.set("assignee_id", params.assignee_id);
  if (params?.contact_id) qs.set("contact_id", params.contact_id);
  if (params?.lead_id) qs.set("lead_id", params.lead_id);
  if (params?.stage_id) qs.set("stage_id", params.stage_id);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);
  const s = qs.toString();
  return apiFetch<CRMFollowup[]>(`/api/teams/crm/followups${s ? `?${s}` : ""}`);
}
export function createCRMFollowup(body: CRMFollowupInput) {
  return apiFetch<CRMFollowup>("/api/teams/crm/followups", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function updateCRMFollowup(id: string, body: CRMFollowupPatch) {
  return apiFetch<CRMFollowup>(`/api/teams/crm/followups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}
export function deleteCRMFollowup(id: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/followups/${id}`, { method: "DELETE" });
}

export function bulkCRMFollowups(body: CRMBulkInput) {
  return apiFetch<{ affected: number }>("/api/teams/crm/followups/bulk", {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

// ---- Module permissions (leader-only) ----
export function getModulePermissions() {
  return apiFetch<ModulePermissionsResponse>("/api/teams/module-permissions");
}
export function setModulePermission(
  body: { role: "manager" | "member"; module: string } & ModuleActions,
) {
  return apiFetch<{ updated: boolean }>("/api/teams/module-permissions", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

// ---- Per-member CRM access (leader + manager) ----
export function getCRMMemberAccess() {
  return apiFetch<CRMMemberAccessResponse>("/api/teams/crm/member-access");
}
export function setCRMMemberAccess(body: { user_id: string; granted: boolean }) {
  return apiFetch<{ updated: boolean }>("/api/teams/crm/member-access", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

// ---- Deep search ----
export function searchCRM(q: string, limit = 20) {
  return apiFetch<CRMSearchHit[]>(
    `/api/teams/crm/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
}
