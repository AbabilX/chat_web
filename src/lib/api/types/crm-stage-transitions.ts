import type { CRMDocument } from "./crm-documents";
import type { CRMLead, CRMLeadPaymentInput, CRMTimelineEvent } from "./crm";

export type CRMStageUploadPresign = {
  upload_id: string;
  upload_url: string;
  expires_at: string;
};

export type CRMStageTransitionInput = {
  stage_id: string;
  pipeline_id: string;
  description?: string;
  note?: string;
  occurred_at: string;
  upload_ids?: string[];
  contact_ids?: string[];
  deal_value?: number;
  payment_due_date?: string;
  payment?: CRMLeadPaymentInput;
};

export type CRMStageTransitionResult = {
  lead: CRMLead;
  event: CRMTimelineEvent;
};

export type CRMStageTransitionAttachment = CRMDocument;
