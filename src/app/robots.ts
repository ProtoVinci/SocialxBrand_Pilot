import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/__contact/", "/lab"] }],
    sitemap: new URL("/sitemap.xml", site.url).toString(),
    host: site.url,
  };
}
