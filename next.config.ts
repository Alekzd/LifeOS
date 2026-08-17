import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages deployment via OpenNext
  // output: "export", // Uncomment if using static export
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
