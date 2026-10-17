import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { divisions } from "@/content/divisions";
import { liveScreenings } from "@/content/work";

/**
 * Every public, indexable page, on the canonical host. No `priority` or `changefreq` (Google
 * ignores both) and no `lastModified`: the content carries no maintained update dates, and a
 * build-time date would claim every page changed on every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/work",
    "/capabilities",
    "/approach",
    "/about",
    "/route",
    ...divisions.map((d) => `/capabilities/${d.slug}`),
    ...liveScreenings().map((s) => `/work/${s.slug}`),
  ];
  return paths.map((p) => ({ url: new URL(p, siteUrl).toString() }));
}
