export const GITHUB_NOT_CONNECTED = "github_not_connected";

export const GITHUB_APP_INSTALL_URL = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG
  ? `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_SLUG}/installations/new`
  : "";
