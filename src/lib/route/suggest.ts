// Suggests a *starting* route of divisions for a visitor, from who they are and what they
// want right now. It is a conversation starter, not a plan: the UI always labels it as
// "a starting route — the real plan comes after we understand your business".
import type { AudienceId } from "@/content/site";

export type GoalId = "seen" | "remembered" | "trusted" | "chosen" | "grow";

export const goals: { id: GoalId; label: string; prompt: string }[] = [
  { id: "seen", label: "Be seen", prompt: "Not enough of the right people know we exist." },
  { id: "remembered", label: "Be remembered", prompt: "People see us, but we don't stick." },
  { id: "trusted", label: "Be trusted", prompt: "We need credibility before people commit." },
  { id: "chosen", label: "Be chosen", prompt: "We need enquiries, leads and sales." },
  { id: "grow", label: "Move forward", prompt: "We want a long-term growth system." },
];

/**
 * Returns 3–6 division slugs (see content/divisions.ts), most important first.
 * `goal` may be undefined when only the audience is known (the homepage audience tabs).
 */
// Each audience's core starting route, most important first (needs from content/site.ts).
const byAudience: Record<AudienceId, string[]> = {
  local: ["search-seo", "whatsapp-marketing", "social-media-management", "photography"],
  startups: ["branding-identity", "strategy-consulting", "social-media-marketing", "content-creation"],
  growing: ["performance-marketing", "content-marketing", "creator-brand-growth", "social-media-marketing"],
  established: [
    "reputation-pr-community",
    "youtube-organic-video",
    "creative-advertising-campaigns",
    "ai-marketing-automation",
  ],
};

// What each goal pulls forward, most important first.
const byGoal: Record<GoalId, string[]> = {
  seen: ["social-media-marketing", "performance-marketing", "search-seo"],
  remembered: ["branding-identity", "content-creation"],
  trusted: ["reputation-pr-community", "youtube-organic-video", "content-marketing"],
  chosen: ["performance-marketing", "whatsapp-marketing", "search-seo"],
  grow: ["strategy-consulting", "ai-marketing-automation", "youtube-organic-video"],
};

const MAX = 6;

export function suggestRoute(audience: AudienceId, goal?: GoalId): string[] {
  const base = byAudience[audience] ?? [];
  if (!goal) return base.slice(0, MAX);
  // Goal divisions lead, but the audience's top pick always stays on the route.
  const ordered = [...byGoal[goal], ...base];
  const route = [...new Set(ordered)].slice(0, MAX);
  if (base[0] && !route.includes(base[0])) route[route.length - 1] = base[0];
  return route;
}
