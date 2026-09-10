"use client";

import { openExternal } from "@/lib/opener";
import {
  saveBlobToDownloads,
  saveBlobsToFolder,
  type SaveOutcome,
} from "./save-file";

export function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url, window.location.origin).pathname;
    const last = decodeURIComponent(path.split("/").pop() ?? "");
    return last || "attachment";
  } catch {
    return "attachment";
  }
}

async function fetchBlob(url: string): Promise<Blob> {
  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return fetch(url).then((res) => res.blob());
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not download file");
  return response.blob();
}

export async function resolveAssetBlob(url: string): Promise<Blob> {
  return fetchBlob(url);
}

export async function saveAssetToDownloads(
  url: string,
  fileName?: string,
): Promise<SaveOutcome> {
  const blob = await resolveAssetBlob(url);
  return saveBlobToDownloads(blob, fileName || fileNameFromUrl(url));
}

export async function saveAssetsToFolder(
  assets: { url: string; fileName?: string }[],
) {
  const files = [];
  for (const asset of assets) {
    files.push({
      blob: await resolveAssetBlob(asset.url),
      fileName: asset.fileName || fileNameFromUrl(asset.url),
    });
  }
  return saveBlobsToFolder(files);
}

export async function copyImageToClipboard(url: string): Promise<void> {
  const blob = await resolveAssetBlob(url);
  const png = blob.type === "image/png" ? blob : await redrawAsPng(blob);
  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}

async function redrawAsPng(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("no 2d context");
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("could not encode png"))),
      "image/png",
    );
  });
}

export async function copyTextToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export { openExternal };
