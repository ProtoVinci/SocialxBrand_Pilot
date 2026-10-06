import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { divisions } from "@/content/divisions";
import { liveScreenings } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (p: string) => new URL(p, site.url).toString();
  return [
    { url: url("/"), changeFrequency: "monthly", priority: 1 },
    { url: url("/work"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/capabilities"), changeFrequency: "monthly", priority: 0.9 },
    { url: url("/approach"), changeFrequency: "yearly", priority: 0.7 },
    { url: url("/route"), changeFrequency: "yearly", priority: 0.8 },
    ...divisions.map((d) => ({ url: url(`/capabilities/${d.slug}`), changeFrequency: "yearly" as const, priority: 0.7 })),
    ...liveScreenings().map((s) => ({ url: url(`/work/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
