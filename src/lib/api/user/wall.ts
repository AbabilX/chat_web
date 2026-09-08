import { apiFetch, jsonHeaders } from "../core";

import type { ForwardTarget } from "@/lib/chat-e2ee/forward-targets";
import type {

  WallAttachmentInput,

  WallCategoriesManage,

  WallCategory,

  WallComment,

  WallPost,

  WallPostsPage,

  WallReactionGroup,

  WallSavedPost,

  WallStats,

  WallSearchResponse,

} from "../types/wall";



export type WallListOpts = {

  cursor?: string;

  limit?: number;

  category?: string;

  saved?: boolean;

  mine?: boolean;

};



export function getWallPost(postId: string) {
  return apiFetch<WallPost>(`/api/teams/wall/posts/${postId}`);
}

export function listWallPosts(opts?: WallListOpts) {

  const params = new URLSearchParams();

  if (opts?.cursor) params.set("cursor", opts.cursor);

  if (opts?.limit) params.set("limit", String(opts.limit));

  if (opts?.category) params.set("category", opts.category);

  if (opts?.saved) params.set("saved", "1");

  if (opts?.mine) params.set("mine", "1");

  const qs = params.toString();

  return apiFetch<WallPostsPage>(`/api/teams/wall/posts${qs ? `?${qs}` : ""}`);

}



export function getWallStats() {

  return apiFetch<WallStats>("/api/teams/wall/stats");

}

export function searchWall(q: string, limit = 10) {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));
  return apiFetch<WallSearchResponse>(`/api/teams/wall/search?${params.toString()}`);
}



export function listWallCategories() {

  return apiFetch<WallCategory[]>("/api/teams/wall/categories");

}



export function requestWallCategory(label: string, description?: string) {

  return apiFetch<WallCategory>("/api/teams/wall/categories/request", {

    method: "POST",

    body: JSON.stringify({ label, description: description ?? "" }),

    headers: jsonHeaders,

  });

}



export function listWallCategoriesManage() {

  return apiFetch<WallCategoriesManage>("/api/teams/wall/categories/manage");

}



export function createWallCategory(label: string, description?: string) {

  return apiFetch<WallCategory>("/api/teams/wall/categories", {

    method: "POST",

    body: JSON.stringify({ label, description: description ?? "" }),

    headers: jsonHeaders,

  });

}



export function publishWallCategory(categoryId: string) {

  return apiFetch<WallCategory>(`/api/teams/wall/categories/${categoryId}/publish`, {

    method: "POST",

    headers: jsonHeaders,

  });

}



export function rejectWallCategory(categoryId: string, reason?: string) {

  return apiFetch<WallCategory>(`/api/teams/wall/categories/${categoryId}/reject`, {

    method: "POST",

    body: JSON.stringify({ reason: reason ?? "" }),

    headers: jsonHeaders,

  });

}



export function updateWallCategory(

  categoryId: string,

  label: string,

  description?: string,

) {

  return apiFetch<WallCategory>(`/api/teams/wall/categories/${categoryId}`, {

    method: "PATCH",

    body: JSON.stringify({ label, description: description ?? "" }),

    headers: jsonHeaders,

  });

}



export function archiveWallCategory(categoryId: string) {

  return apiFetch<WallCategory>(`/api/teams/wall/categories/${categoryId}`, {

    method: "DELETE",

  });

}



export function createWallPost(

  body: string,

  opts?: {

    category?: string;

    attachments?: WallAttachmentInput[];

    mentioned_user_ids?: string[];

  },

) {

  return apiFetch<WallPost>("/api/teams/wall/posts", {

    method: "POST",

    body: JSON.stringify({

      body,

      category: opts?.category,

      ...(opts?.attachments?.length ? { attachments: opts.attachments } : {}),

      ...(opts?.mentioned_user_ids?.length

        ? { mentioned_user_ids: opts.mentioned_user_ids }

        : {}),

    }),

    headers: jsonHeaders,

  });

}



export function updateWallPost(postId: string, body: string) {

  return apiFetch<WallPost>(`/api/teams/wall/posts/${postId}`, {

    method: "PATCH",

    body: JSON.stringify({ body }),

    headers: jsonHeaders,

  });

}



export function deleteWallPost(postId: string) {

  return apiFetch<{ ok: boolean }>(`/api/teams/wall/posts/${postId}`, {

    method: "DELETE",

  });

}



export function createWallComment(

  postId: string,

  body: string,

  opts?: {

    parent_id?: string;

    attachments?: WallAttachmentInput[];

    mentioned_user_ids?: string[];

  },

) {

  return apiFetch<WallComment>(`/api/teams/wall/posts/${postId}/comments`, {

    method: "POST",

    body: JSON.stringify({

      body,

      ...(opts?.parent_id ? { parent_id: opts.parent_id } : {}),

      ...(opts?.attachments?.length ? { attachments: opts.attachments } : {}),

      ...(opts?.mentioned_user_ids?.length

        ? { mentioned_user_ids: opts.mentioned_user_ids }

        : {}),

    }),

    headers: jsonHeaders,

  });

}



export function updateWallComment(postId: string, commentId: string, body: string) {

  return apiFetch<WallComment>(

    `/api/teams/wall/posts/${postId}/comments/${commentId}`,

    {

      method: "PATCH",

      body: JSON.stringify({ body }),

      headers: jsonHeaders,

    },

  );

}



export function deleteWallComment(postId: string, commentId: string) {

  return apiFetch<{ ok: boolean }>(

    `/api/teams/wall/posts/${postId}/comments/${commentId}`,

    { method: "DELETE" },

  );

}



export function toggleWallReaction(
  postId: string,
  emoji: string,
  commentId?: string,
) {
  return apiFetch<{ added: boolean; reactions: WallReactionGroup[] }>(
    `/api/teams/wall/posts/${postId}/reactions`,
    {
      method: "POST",
      body: JSON.stringify({
        emoji,
        comment_id: commentId ?? null,
      }),
      headers: jsonHeaders,
    },
  );
}

export function toggleWallSave(postId: string) {

  return apiFetch<{ saved: boolean }>(`/api/teams/wall/posts/${postId}/save`, {

    method: "POST",

    headers: jsonHeaders,

  });

}



export function presignWallAttachment(

  contentType: string,

  fileName: string,

  sizeBytes: number,

) {

  return apiFetch<{

    upload_url: string;

    public_url: string;

    object_key: string;

  }>("/api/teams/wall/posts/attachments/presign", {

    method: "POST",

    body: JSON.stringify({

      content_type: contentType,

      file_name: fileName,

      size_bytes: sizeBytes,

    }),

    headers: jsonHeaders,

  });

}



export function discardWallUpload(fileUrl: string) {

  return apiFetch<{ ok: boolean }>("/api/teams/wall/posts/attachments/discard", {

    method: "POST",

    body: JSON.stringify({ file_url: fileUrl }),

    headers: jsonHeaders,

  });

}



export function listMySavedWallPosts() {

  return apiFetch<WallSavedPost[]>("/api/me/wall/saves");

}

export function forwardWallPost(body: {
  post_id: string;
  conversation_ids?: string[];
  user_ids?: string[];
  caption?: string;
  /** Client-prepared destinations — required to reach an E2EE DM. */
  targets?: ForwardTarget[];
}) {
  return apiFetch<{ forwarded_to: number }>("/api/teams/wall/forward", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(body),
  });
}


