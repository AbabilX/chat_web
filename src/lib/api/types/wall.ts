import type { KanbanReactionGroup } from "./kanban";

export type WallReactionGroup = KanbanReactionGroup;

export type WallAttachment = {

  id: string;

  post_id: string;

  comment_id?: string | null;

  file_name: string;

  file_url: string;

  content_type: string;

  size_bytes: number;

  uploaded_by: string;

  created_at: string;

  /** True when the workspace's files are locked: file_url is withheld until upgrade. */
  locked?: boolean;
};



export type WallAttachmentInput = {

  file_url: string;

  file_name: string;

  content_type: string;

  size_bytes: number;

};



export type WallComment = {

  id: string;

  post_id: string;

  user_id: string;

  parent_id?: string | null;

  body: string;

  created_at: string;

  user_name?: string;

  user_avatar_url?: string;

  user_is_premium?: boolean;

  attachments?: WallAttachment[];

  reactions?: WallReactionGroup[];

};



export type WallCategoryId = string;

export type WallCategoryStatus =


  | "pending"

  | "published"

  | "rejected"

  | "archived";



export type WallCategory = {

  id: string;

  team_id: string;

  slug: string;

  label: string;

  description?: string;

  status: WallCategoryStatus;

  requested_by?: string | null;

  reviewed_by?: string | null;

  reviewed_at?: string | null;

  reject_reason?: string | null;

  created_at: string;

  updated_at: string;

  requester_name?: string;

};



export type WallCategoriesManage = {

  categories: WallCategory[];

  pending_count: number;

};



export type WallPost = {

  id: string;

  team_id: string;

  user_id: string;

  category: string;

  body: string;

  created_at: string;

  updated_at: string;

  user_name?: string;

  user_avatar_url?: string;

  user_is_premium?: boolean;

  attachments?: WallAttachment[];

  comments?: WallComment[];

  reactions?: WallReactionGroup[];

  comment_count: number;

  saved_by_me: boolean;

};



export type WallPostsPage = {

  posts: WallPost[];

  next_cursor: string;

  has_more: boolean;

};



export type WallSavedPost = WallPost & {

  saved_at: string;

};



export type WallStats = {

  total_posts: number;

  my_posts: number;

  my_saves: number;

  category_counts: Record<string, number>;

};

export type WallSearchPerson = {
  user_id: string;
  name?: string;
  username?: string;
  github_username?: string;
  avatar_url?: string;
  match_field: "name" | "username" | "github_username";
};

export type WallSearchPostHit = {
  post: WallPost;
  excerpt: string;
  match_in: "body" | "author" | "category";
};

export type WallSearchCommentHit = {
  post_id: string;
  post_author_name?: string;
  comment: WallComment;
  excerpt: string;
};

export type WallSearchResponse = {
  people: WallSearchPerson[];
  posts: WallSearchPostHit[];
  comments: WallSearchCommentHit[];
};


