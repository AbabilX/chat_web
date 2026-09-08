/**
 * Remembers the fingerprint each peer had the last time we looked, so a key
 * that gets substituted later is noticed without anyone re-comparing digits by
 * hand. Nobody compares safety numbers twice; a server that swaps a key after
 * the first conversation would otherwise never be caught.
 *
 * This is not secret — a fingerprint is public by construction — so it lives in
 * localStorage rather than the encrypted device record. It is per-browser on
 * purpose: it records what THIS device has seen, and a fresh browser has seen
 * nothing and says nothing.
 */

const KEY_PREFIX = "ababilx_peer_fingerprint_v1:";

export type PeerTrust = "first-seen" | "unchanged" | "changed";

function storageKey(ownerUserId: string, peerUserId: string) {
  return `${KEY_PREFIX}${ownerUserId}:${peerUserId}`;
}

function readStored(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    // Private mode, disabled storage: this device simply remembers nothing,
    // which must degrade to "first seen", never to a false alarm.
    return null;
  }
}

/**
 * Compares a peer's current fingerprint with the remembered one WITHOUT
 * recording it. A change is only cleared once the user acknowledges it, so a
 * warning cannot be silently swallowed by the next page load.
 */
export function checkPeerFingerprint(
  ownerUserId: string,
  peerUserId: string,
  fingerprint: string,
): PeerTrust {
  const stored = readStored(storageKey(ownerUserId, peerUserId));
  if (!stored) return "first-seen";
  return stored === fingerprint ? "unchanged" : "changed";
}

/** Records a fingerprint as the one this device now expects. */
export function rememberPeerFingerprint(
  ownerUserId: string,
  peerUserId: string,
  fingerprint: string,
) {
  try {
    localStorage.setItem(storageKey(ownerUserId, peerUserId), fingerprint);
  } catch {
    // Not being able to remember costs a repeated "first seen", nothing worse.
  }
}

/** Drops every remembered fingerprint — used when the account signs out. */
export function forgetPeerFingerprints() {
  try {
    const doomed: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key?.startsWith(KEY_PREFIX)) doomed.push(key);
    }
    for (const key of doomed) localStorage.removeItem(key);
  } catch {
    // Nothing to clean up if storage is unavailable in the first place.
  }
}
