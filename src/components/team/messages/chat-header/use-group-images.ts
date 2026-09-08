"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type { ChatConversation } from "@/lib/api/types/chat";
import { downscaleImage } from "@/lib/images/downscale-image";

/** Which of a group's two pictures is being replaced. */
export type GroupImageKind = "avatar" | "banner";

/**
 * How big each picture is worth keeping. The avatar is never drawn larger than
 * a 64px circle, so 512 covers a 3x screen with room to spare; the banner runs
 * the full width of the details panel, which is why it gets the extra pixels.
 */
const IMAGE_TARGETS: Record<GroupImageKind, { maxWidth: number }> = {
  avatar: { maxWidth: 512 },
  banner: { maxWidth: 1280 },
};

/**
 * Uploads a group photo or banner and saves the URL.
 *
 * The bytes ride the ordinary chat attachment presign, so the object lands
 * under this conversation's own storage prefix — which is exactly what the
 * server checks before accepting the URL. An image from anywhere else is
 * refused, because every member's client fetches it on sight and an arbitrary
 * URL would be an IP-address beacon aimed at the whole group.
 */
export function useGroupImages(
  conv: ChatConversation,
  onUpdated: (conv: ChatConversation) => void,
) {
  const [uploading, setUploading] = useState<GroupImageKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function upload(kind: GroupImageKind, file: File) {
    setUploading(kind);
    setError(null);
    try {
      // Shrunk before the presign, not after: the presign is asked for the size
      // it is going to store, and the server checks that against the plan's
      // storage cap.
      const image = await downscaleImage(file, IMAGE_TARGETS[kind]);
      const presign = await api.presignChatAttachment(
        conv.id,
        image.contentType,
        image.fileName,
        image.blob.size,
      );
      const put = await fetch(presign.upload_url, {
        method: "PUT",
        body: image.blob,
        headers: { "Content-Type": image.contentType },
      });
      // fetch only rejects on a network failure, so a 403 from storage would
      // otherwise be saved as a URL pointing at nothing.
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      onUpdated(
        await api.updateChatGroupInfo(conv.id, {
          [kind === "avatar" ? "avatar_url" : "banner_url"]: presign.public_url,
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload the image");
    } finally {
      setUploading(null);
    }
  }

  return { uploading, error, setError, upload };
}
