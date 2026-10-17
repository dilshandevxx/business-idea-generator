import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  reactStrictMode: true,
  async rewrites() {
    // Only rewrite to local port 8000 during local development.
    // In production (Vercel), Vercel automatically maps /api directly to api/index.py!
    if (isDev) {
      return [
        {
          source: "/api",
          destination: "http://127.0.0.1:8000/api",
        },
        {
          source: "/api/:path*",
          destination: "http://127.0.0.1:8000/api/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
