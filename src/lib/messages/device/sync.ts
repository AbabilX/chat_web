import { api, ApiError } from "@/lib/api";
import type { MessageReceiptStatus } from "@/lib/api/types/messaging";
import {
  addLocalMessagingDevice,
  readLocalMessagingDevice,
  saveLocalMessagingDevice,
} from "./db";
import { generateLocalMessagingDevice, samePublicKey } from "./keys";
import type { LocalMessagingDevice } from "./types";

const ROTATE_AFTER_MS = 90 * 24 * 60 * 60 * 1000;
let devicePromise: Promise<LocalMessagingDevice> | null = null;
let deviceUserId = "";

async function loadOrCreateDevice(userId: string) {
  const saved = await readLocalMessagingDevice(userId);
  if (saved) return saved;
  return addLocalMessagingDevice(await generateLocalMessagingDevice(userId));
}

async function registerOrRecover(device: LocalMessagingDevice) {
  try {
    return await api.registerMessagingDevice({
      device_id: device.deviceId,
      platform: "web",
      public_key: device.publicKey,
    });
  } catch (error) {
    if (
      !(error instanceof ApiError) ||
      error.message !== "device_key_conflict"
    ) {
      throw error;
    }
    const current = Number(error.data.current_key_version);
    if (!Number.isInteger(current) || current < 1) throw error;
    return api.rotateMessagingDeviceKey(
      device.deviceId,
      current,
      device.publicKey,
    );
  }
}

async function syncDevice(userId: string) {
  let local = await loadOrCreateDevice(userId);
  const server = await registerOrRecover(local);
  local = { ...local, keyVersion: server.key_version };
  if (!samePublicKey(local.publicKey, server.public_key)) {
    throw new Error("messaging device public key mismatch");
  }
  if (Date.now() - local.rotatedAt >= ROTATE_AFTER_MS) {
    const candidate = await generateLocalMessagingDevice(
      local.id,
      local.deviceId,
    );
    const rotated = await api.rotateMessagingDeviceKey(
      local.deviceId,
      server.key_version,
      candidate.publicKey,
    );
    local = {
      ...candidate,
      createdAt: local.createdAt,
      keyVersion: rotated.key_version,
    };
  }
  await saveLocalMessagingDevice(local);
  return local;
}

export function ensureMessagingDevice(userId?: string) {
  if (userId && userId !== deviceUserId) {
    deviceUserId = userId;
    devicePromise = null;
  }
  if (!deviceUserId) {
    return Promise.reject(new Error("messaging device user unavailable"));
  }
  devicePromise ??= syncDevice(deviceUserId).catch((error) => {
    devicePromise = null;
    throw error;
  });
  return devicePromise;
}

if (typeof window !== "undefined") {
  window.addEventListener("ababilx:logout", () => {
    devicePromise = null;
    deviceUserId = "";
  });
}

export async function acknowledgeMessages(
  status: MessageReceiptStatus,
  messageIds: string[],
) {
  const ids = [...new Set(messageIds.filter(Boolean))];
  if (ids.length === 0) return;
  const device = await ensureMessagingDevice();
  for (let offset = 0; offset < ids.length; offset += 200) {
    await api.acknowledgeMessagingMessages({
      device_id: device.deviceId,
      status,
      message_ids: ids.slice(offset, offset + 200),
    });
  }
}
