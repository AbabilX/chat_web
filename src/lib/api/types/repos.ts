export type Repo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  stars: number;
  language: string;
  updated_at: string;
  description: string;
  html_url: string;
};

export type Commit = {
  sha: string;
  message: string;
  author: { name: string; email: string };
  date: string;
  url: string;
};

export type RepoOverview = {
  repo_full_name: string;
  overview: string;
  commit_count: number;
  generated_at: string;
  cached: boolean;
  error?: string;
};

export type GitHubUser = {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
};
