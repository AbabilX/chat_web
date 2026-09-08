export type Changelog = {
  id: string;
  version: string;
  title: string;
  description: string;
  features: string[];
  fixes: string[];
  published_at: string;
  created_at: string;
};

export type PaginatedChangelogs = {
  changelogs: Changelog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
};
