export async function openExternal(url: string): Promise<void> {
  if (!url || typeof url !== "string") return;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#" || trimmed.startsWith("javascript:")) return;
  window.open(trimmed, "_blank", "noopener,noreferrer");
}
