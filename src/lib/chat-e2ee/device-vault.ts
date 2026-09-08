import {
  base64UrlToBytes,
  bytesToBase64Url,
  e2eeDecoder,
  e2eeEncoder,
  randomBytes,
} from "./primitives";

const DB_NAME = "ababilx-secure-messages";
const STORE_NAME = "device-keys";
const RECORD_ID = "message-identity-v1";
const DEVICE_AAD = e2eeEncoder.encode("ababilx-trusted-message-device-v1");

type TrustedIdentityRecord = {
  id: string;
  deviceKey: CryptoKey;
  ciphertext: string;
  nonce: string;
  publicKey: JsonWebKey;
};

function openDeviceDB() {
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

async function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
) {
  const db = await openDeviceDB();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export function samePublicIdentity(left: JsonWebKey, right: JsonWebKey) {
  return left.kty === right.kty && left.crv === right.crv &&
    left.x === right.x && left.y === right.y;
}

export async function saveTrustedIdentity(
  privateKey: JsonWebKey,
  publicKey: JsonWebKey,
) {
  const deviceKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  const nonce = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, additionalData: DEVICE_AAD },
    deviceKey,
    e2eeEncoder.encode(JSON.stringify(privateKey)),
  );
  await withStore("readwrite", (store) => store.put({
    id: RECORD_ID,
    deviceKey,
    ciphertext: bytesToBase64Url(new Uint8Array(ciphertext)),
    nonce: bytesToBase64Url(nonce),
    publicKey,
  } satisfies TrustedIdentityRecord));
}

export async function loadTrustedIdentity(publicKey: JsonWebKey) {
  const record = await withStore<TrustedIdentityRecord | undefined>(
    "readonly",
    (store) => store.get(RECORD_ID),
  );
  if (!record || !samePublicIdentity(record.publicKey, publicKey)) return null;
  try {
    const plaintext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: base64UrlToBytes(record.nonce),
        additionalData: DEVICE_AAD,
      },
      record.deviceKey,
      base64UrlToBytes(record.ciphertext),
    );
    return JSON.parse(e2eeDecoder.decode(plaintext)) as JsonWebKey;
  } catch {
    return null;
  }
}

export async function clearTrustedIdentity() {
  try {
    await withStore("readwrite", (store) => store.delete(RECORD_ID));
  } catch {
    // A missing/blocked IndexedDB already means this device cannot auto-unlock.
  }
}
