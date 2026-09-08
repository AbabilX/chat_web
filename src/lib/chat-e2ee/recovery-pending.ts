/**
 * A recovery code that has been generated but not yet shown to its owner.
 *
 * It lives in a module variable and nowhere else — not localStorage, not the
 * URL, not the store's persisted state. Anything durable would leave a
 * plaintext key-equivalent on disk, which is the one thing this whole scheme
 * exists to avoid. A reload before the code is read means it is gone; the
 * account still works, and the owner can generate a new one from settings.
 */
let pending: string | null = null;

export function setPendingRecoveryCode(code: string) {
  pending = code;
}

/** Reads the code once and forgets it. */
export function takePendingRecoveryCode() {
  const code = pending;
  pending = null;
  return code;
}
