import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The portal is fully session-driven, so we use classic dynamic rendering
  // (no cacheComponents). This keeps the Cloudflare/OpenNext build simple.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
