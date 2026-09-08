// The conversation-key lifecycle: fetch, mint, rotate. Message text never
// passes through here — see crypto.ts for that half.
//
// "DM" in these names is historical. A personal group uses exactly the same
// key, the same envelopes and the same rotation; only the roster is bigger.
import { api, type ChatE2EEKeyEnvelope } from "@/lib/api";
import { unwrapDMKey, wrapDMKey } from "./dm-key-envelope";
import { backfillConversationKeys } from "./key-backfill";
import { dmKeys, getIdentityPrivateKey, getIdentityPublicKey } from "./identity-state";

// A conversation with no readable key caches nothing, so a screenful of
// messages would otherwise fire one identical GET each. Callers share the
// in-flight request instead.
const loadsInFlight = new Map<string, Promise<{ version: number; key: CryptoKey; stale: boolean } | null>>();

async function fetchDMKey(conversationID: string, userID: string) {
  const status = await api.getChatE2EEConversationKey(conversationID);
  if (!status.exists) return null;
  // An envelope that will not open is indistinguishable from having none:
  // unwrapping is pure computation, so this is a corrupt or hostile row, not a
  // network blip. Reporting "no key" lets the next send mint a fresh version
  // instead of leaving the conversation unable to send at all.
  let key: CryptoKey;
  try {
    key = await unwrapDMKey(status.key.envelope, userID);
  } catch {
    return null;
  }
  // Hand the surviving key to anyone who lost theirs BEFORE deciding the key is
  // stale: a filled gap restores their history and leaves nothing to rotate.
  const repaired = await backfillConversationKeys(
    conversationID,
    userID,
    status.gaps ?? [],
  );
  // rekey_required is the server's own verdict and covers what the roster
  // cannot show: a key retired because somebody was REMOVED leaves everyone
  // still here holding a good envelope. Fall back to the roster gap for a
  // server that predates the field.
  const stale =
    status.rekey_required ?? (status.missing_member_ids ?? []).length > 0;
  const result = { version: status.key.key_version, key, stale: !repaired && stale };
  dmKeys.set(conversationID, result);
  return result;
}

export async function loadDMKey(conversationID: string, userID: string, refresh = false) {
  const cached = dmKeys.get(conversationID);
  if (cached && !refresh) return cached;
  const pending = loadsInFlight.get(conversationID);
  if (pending && !refresh) return pending;
  const load = fetchDMKey(conversationID, userID);
  loadsInFlight.set(conversationID, load);
  try {
    return await load;
  } finally {
    if (loadsInFlight.get(conversationID) === load) {
      loadsInFlight.delete(conversationID);
    }
  }
}

/**
 * Mints a conversation key and wraps it for every member's current public key.
 *
 * The roster comes from the server rather than the caller, which is what makes
 * this work for a group: a DM caller knew both ids, a group caller does not,
 * and the set moves under it whenever somebody joins or leaves. The server
 * rotates to a new version whenever the current one is spent, so this is the
 * first-key path, the re-key path after a member started a fresh identity, and
 * the re-key path after a removal alike.
 *
 * Own key is taken from this device, never from the response — the server is
 * the only source for everybody else's, which is the substitution that safety
 * numbers exist to catch, and there is no reason to extend it to our own.
 */
async function createDMKey(conversationID: string, currentUserID: string) {
  const identityPublicKey = getIdentityPublicKey();
  if (!getIdentityPrivateKey() || !identityPublicKey)
    throw new Error("Secure messages are not ready on this device yet");
  const roster = await api.getChatE2EEConversationMembers(conversationID);
  // A key cannot be sealed to somebody with no identity, and one that skipped
  // them would lock them out of their own conversation. Refusing here is what
  // keeps that a sentence the sender can act on rather than a rotation loop.
  if ((roster.unready_member_ids ?? []).length > 0) {
    throw new Error(
      roster.unready_member_ids!.length === 1 && roster.members.length <= 1
        ? "This person must set up secure messages before you can send a DM"
        : "Everyone here must open AbabilX once before this chat can be encrypted",
    );
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const envelopes: Record<string, ChatE2EEKeyEnvelope> = {};
  await Promise.all(roster.members.map(async ({ user_id, public_key }) => {
    envelopes[user_id] = await wrapDMKey(
      key,
      user_id,
      user_id === currentUserID ? identityPublicKey : public_key,
    );
  }));
  const saved = await api.createChatE2EEConversationKey(conversationID, envelopes);
  const winningKey = await unwrapDMKey(saved.envelope, currentUserID);
  const result = { version: saved.key_version, key: winningKey, stale: false };
  dmKeys.set(conversationID, result);
  return result;
}

export async function ensureDMKey(conversationID: string, currentUserID: string) {
  const existing = await loadDMKey(conversationID, currentUserID);
  if (existing && !existing.stale) return existing;
  return createDMKey(conversationID, currentUserID);
}

/**
 * Forces a re-key, for the moment the server refuses a send because the key it
 * was sealed with is unreadable to the other side. Drops the cache first so a
 * key that went stale mid-session cannot be handed back.
 */
export async function rotateDMKey(conversationID: string, currentUserID: string) {
  dmKeys.delete(conversationID);
  return createDMKey(conversationID, currentUserID);
}
