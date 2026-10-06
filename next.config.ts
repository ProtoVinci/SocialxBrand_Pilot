import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // the workspace root (a stray lockfile in the user folder otherwise confuses root detection)
  turbopack: { root: path.resolve(__dirname) },
  async redirects() {
    return [{ source: "/contact", destination: "/route", permanent: true }];
  },
  async headers() {
    return [
      {
        // processed media is content-hashed by name and never changes in place
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
