/** Stable per-sender colour, Signal-style. The eight `--sig-author-*` tokens
 * are defined per theme in globals.css, so the same index reads correctly on
 * both the dark and the light incoming bubble. */
export function authorColorVar(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash * 31 + userId.charCodeAt(i)) | 0;
  }
  return `var(--sig-author-${Math.abs(hash) % 8})`;
}
