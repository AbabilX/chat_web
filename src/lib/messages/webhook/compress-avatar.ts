const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_SOURCE_PIXELS = 40_000_000;
const AVATAR_SIZE = 128;

const ACCEPTED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function compressWebhookAvatar(source: File): Promise<File> {
  if (!ACCEPTED.has(source.type)) {
    throw new Error("Use a JPG, PNG, WebP or GIF image.");
  }
  if (source.size > MAX_SOURCE_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > MAX_SOURCE_PIXELS) {
      throw new Error("Image dimensions are too large.");
    }
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is unavailable.");

    const crop = Math.min(bitmap.width, bitmap.height);
    context.drawImage(
      bitmap,
      (bitmap.width - crop) / 2,
      (bitmap.height - crop) / 2,
      crop,
      crop,
      0,
      0,
      AVATAR_SIZE,
      AVATAR_SIZE,
    );
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob || blob.type !== "image/webp") {
      throw new Error("This browser cannot compress the image.");
    }
    return new File([blob], "webhook-avatar.webp", { type: blob.type });
  } finally {
    bitmap.close();
  }
}
