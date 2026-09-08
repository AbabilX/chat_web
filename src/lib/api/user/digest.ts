import { apiFetch, jsonHeaders } from "../core";
import type {
  DigestConfigInput,
  DigestConfigResponse,
  WeeklyDigest,
  WeeklyDigestConfig,
} from "../types/digest";

export function getDigestConfig() {
  return apiFetch<DigestConfigResponse>("/api/digest/config");
}

export function upsertDigestConfig(body: DigestConfigInput) {
  return apiFetch<WeeklyDigestConfig>("/api/digest/config", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: jsonHeaders,
  });
}

export function getDigests() {
  return apiFetch<WeeklyDigest[]>("/api/digest");
}

export function generateDigestNow(fromDate?: string, toDate?: string) {
  return apiFetch<WeeklyDigest>("/api/digest/generate", {
    method: "POST",
    body: JSON.stringify({ from_date: fromDate ?? "", to_date: toDate ?? "" }),
    headers: jsonHeaders,
  });
}
