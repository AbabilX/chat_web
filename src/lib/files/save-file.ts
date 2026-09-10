"use client";

export type SaveOutcome = { saved: boolean; path?: string };

export const SAVE_CANCELLED: SaveOutcome = { saved: false };

export async function saveBlobToDownloads(
  blob: Blob,
  fileName: string,
): Promise<SaveOutcome> {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { saved: true, path: fileName };
}

export async function saveUrlToDownloads(
  url: string,
  fileName: string,
): Promise<SaveOutcome> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not download file");
  const blob = await response.blob();
  return saveBlobToDownloads(blob, fileName);
}

export async function saveBlobsToFolder(
  files: { blob: Blob; fileName: string }[],
): Promise<SaveOutcome & { count?: number }> {
  for (const file of files) {
    await saveBlobToDownloads(file.blob, file.fileName);
  }
  return { saved: true, count: files.length };
}
