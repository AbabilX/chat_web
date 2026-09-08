const APP_KEY_HEADER = "X-AbabilX-Key";

function resolveAppKey(): string {
  const key = process.env.NEXT_PUBLIC_ABABILX_APP_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_ABABILX_APP_KEY is not set");
  }
  return key;
}

/** Merge the shared app key onto a fetch Headers object. */
export function withAppKey(headers?: HeadersInit): Headers {
  const next = new Headers(headers);
  next.set(APP_KEY_HEADER, resolveAppKey());
  return next;
}
