import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Every crawler (search and AI alike) may read the whole public site; only the local media
 * contact sheet (scripts/media/contact-sheet.mjs, gitignored) is excluded. No `Host` line: Google
 * ignores it, and the canonical host comes from the redirects, canonical tags and sitemap instead.
 * Crawler policy and its review date: docs/seo.md.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/__contact/"] }],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  };
}
