// The SOCIALxBRAND PILOT motion grammar. Every animation in the site draws from these
// values; documented with rationale in docs/motion-system.md.

export const dur = {
  micro: 0.2,
  quick: 0.35,
  base: 0.6,
  slow: 0.9,
  cinematic: 1.3,
} as const;

/** Registered as GSAP CustomEases in lib/gsap.ts; mirrored as CSS vars in globals.css. */
export const ease = {
  pilot: "pilot", // cubic-bezier(0.22, 1, 0.36, 1): entrances, long calm tail
  glide: "glide", // cubic-bezier(0.65, 0, 0.35, 1): curtains, state swaps
  snap: "power2.out", // micro feedback
  scrub: "none", // anything driven by scroll position
} as const;

export const stagger = {
  chars: 0.018,
  words: 0.04,
  lines: 0.08,
  cards: 0.07,
  /** Cap on a whole group's stagger, so long lists never feel late. */
  maxTotal: 0.5,
} as const;

export const cappedStagger = (count: number, each: number) =>
  Math.min(each, stagger.maxTotal / Math.max(1, count - 1));

/** Where Lenis smooth scroll runs: fine pointers without reduced motion (SmoothScroll reads this too). */
export const lenisEnabled = () =>
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !window.matchMedia("(pointer: coarse)").matches;

/**
 * The `scrub` value for scroll-linked scenes. Where Lenis runs, the scroll position is already
 * smoothed, so scenes follow it exactly (`true`): a second smoothing layer on top made every scene
 * trail the wheel by most of a second and keep drifting after the scroll stopped. Native (touch)
 * scroll arrives in raw steps, so there GSAP's own catch-up still smooths it.
 */
export const scrubSmoothing = (native = 0.6): true | number => (lenisEnabled() ? true : native);

/** Shared ScrollTrigger entry point for one-shot reveals. */
export const revealStart = "top 82%";

export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px)",
  mobile: "(max-width: 767.98px)",
  finePointer: "(hover: hover) and (pointer: fine)",
  /** Matches the CSS `cinema:` variant: pinned/choreographed layouts. */
  cinema: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  /** Small screens with motion: re-choreographed, never pinned. */
  pocket: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
} as const;
