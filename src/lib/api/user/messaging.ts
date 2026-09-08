import { apiFetch, jsonHeaders } from "../core";
import type { MessageReceiptStatus, MessagingDevice } from "../types/messaging";

export function registerMessagingDevice(body: {
  device_id: string;
  platform: string;
  public_key: JsonWebKey;
}) {
  return apiFetch<MessagingDevice>("/api/messaging/devices", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
}

export function rotateMessagingDeviceKey(
  deviceId: string,
  expectedKeyVersion: number,
  publicKey: JsonWebKey,
) {
  return apiFetch<MessagingDevice>(
    `/api/messaging/devices/${encodeURIComponent(deviceId)}/key`,
    {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({
        expected_key_version: expectedKeyVersion,
        public_key: publicKey,
      }),
    },
  );
}

export function acknowledgeMessagingMessages(body: {
  device_id: string;
  status: MessageReceiptStatus;
  message_ids: string[];
}) {
  return apiFetch<{ updated: number }>("/api/messaging/receipts", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
}
