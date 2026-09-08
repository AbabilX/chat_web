/**
 * Scroll a deep-linked element into view and flash-highlight it.
 * Shared by task-comment, wall-comment, and board-column deep links.
 * Returns true when the element was found.
 */
export function flashHighlight(
  elementId: string,
  opts?: { inline?: ScrollLogicalPosition },
): boolean {
  const el = document.getElementById(elementId);
  if (!el) return false;
  el.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: opts?.inline ?? "nearest",
  });
  el.classList.add("deep-link-flash");
  window.setTimeout(() => el.classList.remove("deep-link-flash"), 2500);
  return true;
}
