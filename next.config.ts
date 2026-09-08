import type { NextConfig } from "next";

const api = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

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
    ];
  },
  async redirects() {
    return [
      {
        source: "/user/team",
        destination: "/user/workspace",
        permanent: true,
      },
      {
        source: "/user/team/:path*",
        destination: "/user/workspace/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
