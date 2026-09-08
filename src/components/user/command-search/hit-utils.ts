import type { AISearchHit } from "@/lib/api/types/assistant";

/** Where a search hit lives in the app. */
export function hitHref(hit: AISearchHit): string {
  switch (hit.source) {
    case "dm":
    case "channel":
      return `/user/workspace/messages?c=${hit.conversation_id}&m=${hit.anchor_id}`;
    case "wall_post":
      return `/user/workspace/wall?postId=${hit.post_id}`;
    case "wall_comment":
      return hit.message_id
        ? `/user/workspace/wall/post/${hit.post_id}?commentId=${hit.message_id}`
        : `/user/workspace/wall/post/${hit.post_id}`;
    case "task_comment": {
      const base = hit.board_id
        ? `/user/workspace/board?boardId=${hit.board_id}&taskId=${hit.task_id}`
        : `/user/workspace/board?taskId=${hit.task_id}`;
      return hit.message_id ? `${base}&comment=${hit.message_id}` : base;
    }
    case "task":
      return hit.board_id
        ? `/user/workspace/board?boardId=${hit.board_id}&taskId=${hit.task_id}`
        : `/user/workspace/board?taskId=${hit.task_id}`;
  }
}

/** Short human label for the hit's source. */
export function hitSourceLabel(
  hit: AISearchHit,
  lang?: string | null,
): string {
  const bn = lang === "bn";
  switch (hit.source) {
    case "dm":
      return hit.label;
    case "channel":
      return `#${hit.label}`;
    case "wall_post":
      return bn ? "ওয়াল পোস্ট" : "Wall post";
    case "wall_comment":
      return bn ? "ওয়াল রিপ্লাই" : "Wall reply";
    case "task_comment":
    case "task":
      return hit.label;
  }
}

/** Badge text describing the hit type (for the command palette). */
export function hitTypeBadge(hit: AISearchHit, lang?: string | null): string {
  const bn = lang === "bn";
  switch (hit.source) {
    case "dm":
      return bn ? "ডাইরেক্ট মেসেজ" : "DM";
    case "channel":
      return bn ? "চ্যানেল" : "Channel";
    case "wall_post":
      return bn ? "ওয়াল" : "Wall";
    case "wall_comment":
      return bn ? "ওয়াল রিপ্লাই" : "Wall reply";
    case "task_comment":
      return bn ? "টাস্ক কমেন্ট" : "Task comment";
    case "task":
      return bn ? "টাস্ক" : "Task";
  }
}
