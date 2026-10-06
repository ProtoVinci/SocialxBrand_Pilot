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
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- params are used once the TODO below is implemented
export function suggestRoute(audience: AudienceId, goal?: GoalId): string[] {
  // TODO(human): map audience (+ optional goal) to a starting set of division slugs.
  return [];
}
