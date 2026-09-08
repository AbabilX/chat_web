/**
 * Signal Desktop `ts/util/scrollUtil.std.ts` — same three functions, same
 * assignments. Do not use `scrollTo({ behavior })`: inherited
 * `html { scroll-behavior: smooth }` would animate, and WKWebView has been
 * seen to ignore `behavior: "instant"`, leaving the leftover scroll offset.
 */

export function getScrollBottom(
  el: Pick<HTMLElement, "clientHeight" | "scrollHeight" | "scrollTop">,
): number {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

export function setScrollBottom(
  el: Pick<HTMLElement, "clientHeight" | "scrollHeight" | "scrollTop">,
  newScrollBottom: number,
): void {
  el.scrollTop = el.scrollHeight - newScrollBottom - el.clientHeight;
}

export function scrollToBottom(
  el: Pick<HTMLElement, "scrollHeight" | "scrollTop">,
): void {
  el.scrollTop = el.scrollHeight;
}
