/** Shared mime/filename helpers for chat + comment attachment thumbs. */

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|heic|heif|avif|svg)$/i;
const SVG_EXT = /\.svg$/i;

export function isSvgAttachment(
  contentType: string,
  fileName = "",
): boolean {
  const type = contentType.toLowerCase().trim();
  return (
    type === "image/svg+xml" ||
    type === "image/svg" ||
    SVG_EXT.test(fileName)
  );
}

export function isImageAttachment(
  contentType: string,
  fileName = "",
): boolean {
  return (
    contentType.toLowerCase().startsWith("image/") || IMAGE_EXT.test(fileName)
  );
}

const CSV_EXT = /\.csv$/i;

export function isCsvAttachment(
  contentType: string,
  fileName = "",
): boolean {
  const type = contentType.toLowerCase().trim();
  return (
    type === "text/csv" ||
    type === "application/csv" ||
    type === "text/comma-separated-values" ||
    CSV_EXT.test(fileName)
  );
}
