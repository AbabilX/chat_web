export const MAX_KANBAN_NOTE_ATTACHMENT_BYTES = 250 * 1024 * 1024;

export function formatAttachmentSizeLimit(bytes: number): string {
  const mb = Math.round(bytes / (1024 * 1024));
  return `${mb} MB`;
}
