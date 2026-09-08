import type { LocalMessagingDevice } from "./types";

const DB_NAME = "ababilx-messaging-device";
const STORE_NAME = "identity";

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function request<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDB();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const result = operation(transaction.objectStore(STORE_NAME));
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    });
  } finally {
    db.close();
  }
}

export function readLocalMessagingDevice(userId: string) {
  return request<LocalMessagingDevice | undefined>("readonly", (store) =>
    store.get(userId),
  );
}

export function saveLocalMessagingDevice(device: LocalMessagingDevice) {
  return request<IDBValidKey>("readwrite", (store) => store.put(device));
}

export async function addLocalMessagingDevice(device: LocalMessagingDevice) {
  try {
    await request<IDBValidKey>("readwrite", (store) => store.add(device));
    return device;
  } catch {
    const winner = await readLocalMessagingDevice(device.id);
    if (!winner) throw new Error("messaging device identity unavailable");
    return winner;
  }
}
