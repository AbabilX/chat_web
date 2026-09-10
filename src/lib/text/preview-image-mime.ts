/**
 * The image types Signal accepts for a link preview (`VALID_IMAGE_MIME_TYPES`),
 * read from the bytes rather than from the header.
 *
 * Rust checks the `Content-Type` to decide whether to fetch at all; this
 * decides what to call the bytes that came back, and they are different
 * questions. The header is a claim by the same host that wrote the link, and a
 * blob given the wrong type simply fails to draw.
 */
export function sniffImageMime(bytes: Uint8Array): string {
  const at = (index: number) => bytes[index];
  const matches = (offset: number, signature: number[]) =>
    signature.every((byte, index) => at(offset + index) === byte);

  if (matches(0, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (matches(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (matches(0, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  // "RIFF" .... "WEBP"
  if (matches(0, [0x52, 0x49, 0x46, 0x46]) && matches(8, [0x57, 0x45, 0x42, 0x50])) {
    return "image/webp";
  }
  if (matches(0, [0x00, 0x00, 0x01, 0x00])) return "image/x-icon";
  // An unrecognised header is still handed to the decoder: an SVG or an
  // exotic JPEG variant draws fine, and a blob with no type is sniffed by the
  // browser exactly as an ordinary <img> response would be.
  return "";
}
