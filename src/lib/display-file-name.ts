const ENCODED_SEGMENT = /%[0-9A-Fa-f]{2}/;

/** Decode URL-encoded file names (e.g. Mahmudul%20Hasan.pdf → Mahmudul Hasan.pdf). */
export function displayFileName(fileName: string): string {
  if (!fileName || !ENCODED_SEGMENT.test(fileName)) return fileName;
  try {
    return decodeURIComponent(fileName.replace(/\+/g, " "));
  } catch {
    return fileName;
  }
}
