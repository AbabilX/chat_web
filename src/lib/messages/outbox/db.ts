import { decryptChatOutboxPayload, encryptChatOutboxEntry } from "./codec";
import type {
  ChatOutboxEntry,
  EncryptedChatOutboxRecord,
} from "./types";

const DB_NAME = "ababilx-chat-outbox";
const DB_VERSION = 1;
const KEY_STORE = "keys";
const OUTBOX_STORE = "outbox";
const DEVICE_KEY = "device-key-v1";

let databasePromise: Promise<IDBDatabase> | null = null;
let deviceKeyPromise: Promise<CryptoKey> | null = null;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB aborted"));
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB failed"));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Durable browser storage is unavailable"));
  }
  databasePromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KEY_STORE)) db.createObjectStore(KEY_STORE);
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = db.createObjectStore(OUTBOX_STORE, {
          keyPath: "clientMessageId",
        });
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
  return databasePromise;
}

async function deviceKey(): Promise<CryptoKey> {
  deviceKeyPromise ??= (async () => {
    const db = await openDatabase();
    const readKey = () => {
      const read = db.transaction(KEY_STORE, "readonly");
      return requestResult(
        read.objectStore(KEY_STORE).get(DEVICE_KEY) as IDBRequest<
          CryptoKey | undefined
        >,
      );
    };
    const existing = await readKey();
    if (existing) return existing;

    const generated = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
    const write = db.transaction(KEY_STORE, "readwrite");
    write.objectStore(KEY_STORE).add(generated, DEVICE_KEY);
    try {
      await transactionDone(write);
      return generated;
    } catch {
      const winner = await readKey();
      if (winner) return winner;
      throw new Error("Unable to persist the chat outbox key");
    }
  })();
  return deviceKeyPromise;
}

export async function saveChatOutboxEntry(entry: ChatOutboxEntry) {
  const [db, key] = await Promise.all([openDatabase(), deviceKey()]);
  const encrypted = await encryptChatOutboxEntry(key, entry);
  const record: EncryptedChatOutboxRecord = {
    clientMessageId: entry.clientMessageId,
    userId: entry.userId,
    conversationId: entry.conversationId,
    createdAt: entry.createdAt,
    ...encrypted,
  };
  const transaction = db.transaction(OUTBOX_STORE, "readwrite");
  transaction.objectStore(OUTBOX_STORE).put(record);
  await transactionDone(transaction);
}

export async function readChatOutbox(): Promise<ChatOutboxEntry[]> {
  const [db, key] = await Promise.all([openDatabase(), deviceKey()]);
  const transaction = db.transaction(OUTBOX_STORE, "readonly");
  const records = await requestResult(
    transaction.objectStore(OUTBOX_STORE).index("createdAt").getAll() as IDBRequest<
      EncryptedChatOutboxRecord[]
    >,
  );
  return Promise.all(
    records.map(async (record) => ({
      clientMessageId: record.clientMessageId,
      userId: record.userId,
      conversationId: record.conversationId,
      createdAt: record.createdAt,
      payload: await decryptChatOutboxPayload(key, record.ciphertext, record.nonce),
    })),
  );
}

export async function removeChatOutboxEntry(clientMessageId: string) {
  const db = await openDatabase();
  const transaction = db.transaction(OUTBOX_STORE, "readwrite");
  transaction.objectStore(OUTBOX_STORE).delete(clientMessageId);
  await transactionDone(transaction);
}

export async function requestPersistentChatStorage() {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
  try {
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
