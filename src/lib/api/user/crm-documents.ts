import { apiFetch, jsonHeaders } from "../core";
import type {
  CRMDocument,
  CRMDocumentPresign,
  CRMDocumentSaveInput,
} from "../types/crm-documents";

export function listCRMDocuments(leadId: string) {
  return apiFetch<CRMDocument[]>(`/api/teams/crm/leads/${leadId}/documents`);
}

export function presignCRMDocument(
  leadId: string,
  contentType: string,
  fileName: string,
  sizeBytes: number,
) {
  return apiFetch<CRMDocumentPresign>(
    `/api/teams/crm/leads/${leadId}/documents/presign`,
    {
      method: "POST",
      body: JSON.stringify({
        content_type: contentType,
        file_name: fileName,
        size_bytes: sizeBytes,
      }),
      headers: jsonHeaders,
    },
  );
}

export function saveCRMDocument(leadId: string, body: CRMDocumentSaveInput) {
  return apiFetch<CRMDocument>(`/api/teams/crm/leads/${leadId}/documents`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function discardCRMDocumentUpload(fileUrl: string) {
  return apiFetch<{ ok: boolean }>(`/api/teams/crm/documents/discard`, {
    method: "POST",
    body: JSON.stringify({ file_url: fileUrl }),
    headers: jsonHeaders,
  });
}

export function deleteCRMDocument(docId: string) {
  return apiFetch<{ deleted: boolean }>(`/api/teams/crm/documents/${docId}`, {
    method: "DELETE",
  });
}

/** Presign → PUT to R2 → save row. Discards the object if the PUT or save fails. */
export async function uploadCRMDocument(
  leadId: string,
  file: File,
  label?: string,
  followupId?: string,
): Promise<CRMDocument> {
  const { upload_url, public_url } = await presignCRMDocument(
    leadId,
    file.type || "application/octet-stream",
    file.name,
    file.size,
  );
  const putRes = await fetch(upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!putRes.ok) {
    void discardCRMDocumentUpload(public_url).catch(() => undefined);
    throw new Error("Upload failed");
  }
  try {
    return await saveCRMDocument(leadId, {
      label: label?.trim() || undefined,
      file_url: public_url,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      followup_id: followupId,
    });
  } catch (e) {
    void discardCRMDocumentUpload(public_url).catch(() => undefined);
    throw e;
  }
}
