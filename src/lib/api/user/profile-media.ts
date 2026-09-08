import { apiFetch, jsonHeaders } from "../core";
import type { AppUser } from "../types/me";

export type ProfileUploadKind = "avatar" | "cover";

export type ProfilePresignResponse = {
  upload_url: string;
  public_url: string;
  object_key: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function presignProfileUpload(
  kind: ProfileUploadKind,
  contentType: string,
) {
  return apiFetch<ProfilePresignResponse>("/api/me/upload/presign", {
    method: "POST",
    body: JSON.stringify({ kind, content_type: contentType }),
    headers: jsonHeaders,
  });
}

export async function updateProfileMedia(payload: {
  avatar_url?: string;
  cover_url?: string;
}) {
  return apiFetch<AppUser>("/api/me/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: jsonHeaders,
  });
}

export async function uploadProfileImage(
  kind: ProfileUploadKind,
  file: File,
): Promise<AppUser> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image must be 5 MB or smaller");
  }

  const { upload_url, public_url } = await presignProfileUpload(kind, file.type);
  const putRes = await fetch(upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!putRes.ok) {
    throw new Error("Upload to storage failed");
  }

  return updateProfileMedia(
    kind === "avatar" ? { avatar_url: public_url } : { cover_url: public_url },
  );
}
