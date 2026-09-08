import type { NextConfig } from "next";

const api = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ""
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!api) return [];
    return [
      {
        source: "/hooks/chat/:webhookId/:token",
        destination: `${api}/hooks/chat/:webhookId/:token`,
      },
      {
        source: "/backend/api/notifications/stream",
        destination: `${api}/api/notifications/stream`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/user/workspace",
        destination: "/user/messages",
        permanent: false,
      },
      {
        source: "/user/workspace/:path*",
        destination: "/user/messages",
        permanent: false,
      },
      {
        source: "/user/team",
        destination: "/user/messages",
        permanent: true,
      },
      {
        source: "/user/team/:path*",
        destination: "/user/messages",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
