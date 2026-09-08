/** How large a group picture is allowed to arrive, and how hard to squeeze it. */
export type DownscaleTarget = {
  /** Longest edge of the result, in pixels. */
  maxWidth: number;
  /** JPEG quality, 0–1. */
  quality?: number;
};

export type DownscaledImage = {
  blob: Blob;
  contentType: string;
  fileName: string;
};

/**
 * Shrinks a picked image before it is uploaded.
 *
 * A phone camera file is several megabytes and four thousand pixels wide; a
 * group avatar is drawn at 36px and a banner at a few hundred. Uploading the
 * original means paying for those megabytes three times over — the upload, the
 * storage, and every member's device fetching them on every open — for detail
 * nobody can see at that size. Re-encoding as JPEG rather than keeping the
 * source format is part of the same trade: these are photographs, and PNG is
 * lossless. Nothing here needs transparency, because both surfaces sit on an
 * opaque background.
 *
 * Returns the original file untouched if anything goes wrong — an image the
 * browser cannot decode, a canvas that refuses to export. A slightly large
 * upload is a far better outcome than a group photo that cannot be set at all.
 */
export async function downscaleImage(
  file: File,
  { maxWidth, quality = 0.82 }: DownscaleTarget,
): Promise<DownscaledImage> {
  const original: DownscaledImage = {
    blob: file,
    contentType: file.type || "image/jpeg",
    fileName: file.name,
  };
  if (typeof createImageBitmap !== "function") return original;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return original;
  }

  try {
    const scale = Math.min(1, maxWidth / bitmap.width);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    // Re-encoding can enlarge an image that was already well compressed, so the
    // result only wins if it is actually smaller.
    if (!blob || blob.size >= file.size) return original;
    return {
      blob,
      contentType: "image/jpeg",
      fileName: replaceExtension(file.name, ".jpg"),
    };
  } finally {
    bitmap.close();
  }
}

function replaceExtension(name: string, extension: string) {
  const base = name.replace(/\.[^./\\]+$/, "");
  return `${base || "image"}${extension}`;
}
