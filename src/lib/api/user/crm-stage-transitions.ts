import { apiFetch, jsonHeaders } from "../core";
import type {
  CRMStageTransitionInput,
  CRMStageTransitionResult,
  CRMStageUploadPresign,
} from "../types/crm-stage-transitions";

export function presignCRMStageUpload(
  leadId: string,
  targetStageId: string,
  file: File,
) {
  return apiFetch<CRMStageUploadPresign>(
    `/api/teams/crm/leads/${leadId}/stage-uploads/presign`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        target_stage_id: targetStageId,
        content_type: file.type || "application/octet-stream",
        file_name: file.name,
        size_bytes: file.size,
      }),
    },
  );
}

export async function uploadCRMStageFile(
  leadId: string,
  targetStageId: string,
  file: File,
) {
  const draft = await presignCRMStageUpload(leadId, targetStageId, file);
  const response = await fetch(draft.upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  if (!response.ok) {
    void discardCRMStageUpload(draft.upload_id).catch(() => undefined);
    throw new Error(`Failed to upload ${file.name}`);
  }
  return draft;
}

export function discardCRMStageUpload(uploadId: string) {
  return apiFetch<{ discarded: boolean }>(
    `/api/teams/crm/stage-uploads/${uploadId}`,
    { method: "DELETE" },
  );
}

export function commitCRMLeadStageTransition(
  leadId: string,
  body: CRMStageTransitionInput,
) {
  return apiFetch<CRMStageTransitionResult>(
    `/api/teams/crm/leads/${leadId}/stage`,
    {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    },
  );
}
