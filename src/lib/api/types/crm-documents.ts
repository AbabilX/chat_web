// CRM contact documents (files uploaded to R2 via presigned URLs).

export type CRMDocument = {
  id: string;
  team_id: string;
  lead_id: string;
  contact_id: string;
  uploaded_by?: string;
  label: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  uploader_name?: string;
  followup_id?: string | null;
  /** True when the workspace's files are locked: file_url is withheld until upgrade. */
  locked?: boolean;
};

export type CRMDocumentPresign = {
  upload_url: string;
  public_url: string;
  object_key: string;
};

export type CRMDocumentSaveInput = {
  label?: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  followup_id?: string;
};
