// The 18 services as a client meets them: four plain-language groups (the owner chose this grouping,
// 2026-10-16, from docs/briefs/archive/SocialxBrand_Client_First_Layout_Refactor_Plan.md). Presentation only: every
// service keeps its own page, slug, PDF wording and `cluster` in divisions.ts.
// Each summary only restates what the member services' own descriptions already say.

import { divisionBySlug, type Division } from "./divisions";

export type ServiceGroup = { id: string; name: string; summary: string; slugs: string[] };

export const serviceGroups: ServiceGroup[] = [
  {
    id: "strategy-social",
    name: "Strategy & social media",
    summary: "Working out what your marketing needs to achieve, then planning, running and managing your social media and content around it.",
    slugs: ["strategy-consulting", "social-media-marketing", "social-media-management", "content-marketing"],
  },
  {
    id: "content-creative",
    name: "Content & creative production",
    summary: "Producing the content your marketing uses: videos, photography, design, branding and campaign ideas.",
    slugs: ["content-creation", "graphic-design", "video-production", "video-editing-animation", "photography", "branding-identity", "creative-advertising-campaigns"],
  },
  {
    id: "reach-enquiries",
    name: "Reach & enquiries",
    summary: "Reaching the people who are looking for what you offer, through paid advertising, search engines and WhatsApp.",
    slugs: ["performance-marketing", "search-seo", "whatsapp-marketing"],
  },
  {
    id: "creators-community",
    name: "Creators, community & digital tools",
    summary: "Working with creators, building a YouTube and video presence, looking after your reputation and community, and using AI and automation in your marketing.",
    slugs: ["creator-brand-growth", "youtube-organic-video", "reputation-pr-community", "ai-marketing-automation"],
  },
];

export const servicesIn = (g: ServiceGroup) => g.slugs.map(divisionBySlug).filter((d): d is Division => Boolean(d));
export const groupOf = (slug: string) => serviceGroups.find((g) => g.slugs.includes(slug));

/**
 * Services that sound alike. Each service page points to its pair, quoting the other service's own
 * description, so the difference is explained in the services' own (PDF) words, nothing added.
 */
const PAIRS: [string, string][] = [
  ["social-media-marketing", "social-media-management"],
  ["content-marketing", "content-creation"],
  ["video-production", "video-editing-animation"],
  ["branding-identity", "graphic-design"],
  ["performance-marketing", "search-seo"],
];
export const lookalikeOf = (slug: string) => {
  const pair = PAIRS.find((p) => p.includes(slug));
  return pair ? divisionBySlug(pair[0] === slug ? pair[1] : pair[0]) : undefined;
};
