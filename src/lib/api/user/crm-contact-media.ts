import { apiFetch, jsonHeaders } from "../core";

type ContactImagePresign = {
  upload_url: string;
  public_url: string;
};

export async function uploadCRMContactImage(file: File) {
  const presign = await apiFetch<ContactImagePresign>(
    "/api/teams/crm/contact-images/presign",
    {
      method: "POST",
      body: JSON.stringify({
        content_type: file.type,
        size_bytes: file.size,
      }),
      headers: jsonHeaders,
    },
  );
  const response = await fetch(presign.upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!response.ok) {
    throw new Error("Image upload failed");
  }
  return presign.public_url;
}

export function discardCRMContactImage(imageUrl: string) {
  return apiFetch<{ deleted: boolean }>("/api/teams/crm/contact-images/discard", {
    method: "POST",
    body: JSON.stringify({ image_url: imageUrl }),
    headers: jsonHeaders,
  });
}
