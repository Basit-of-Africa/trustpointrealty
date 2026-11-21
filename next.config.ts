import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The portal is fully session-driven, so we use classic dynamic rendering
  // (no cacheComponents). This keeps the Cloudflare/OpenNext build simple.
  turbopack: {
    rules: {
      "*.css": {
        // Only our own stylesheets. Without this the Tailwind loader also
        // processes next/font's generated CSS, which makes `next dev`
        // rebuild and reload in an endless loop.
        condition: { all: [{ not: "foreign" }, { path: /^src\// }] },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
