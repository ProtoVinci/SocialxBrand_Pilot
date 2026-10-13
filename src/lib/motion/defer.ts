"use client";
import type { RefObject } from "react";
import { useGSAP } from "@/lib/gsap";
import { observeOnce, NEAR_MARGIN } from "@/lib/motion/observe";

/**
 * useGSAP for a section far below the fold: the setup runs when the section is about a screen
 * away (or already passed), not at page load, so the first paint is not queued behind timelines,
 * ScrollTriggers and splits for things nobody can see yet.
 *
 * Only for sections that are NOT pinned and do not push other content around: the home page's one
 * pin (the hero) is created at load, first, so every later trigger measures an already-final page.
 * Everything made inside runs in the hook's GSAP context, so it is reverted on unmount as usual.
 * `setup` may return a cleanup, as the callback of useGSAP does.
 */
export function useGSAPNear(setup: () => void | (() => void), { scope }: { scope: RefObject<Element | null> }) {
  useGSAP((context) => {
    const el = scope.current;
    if (!el) return;
    let cleanup: void | (() => void);
    const stop = observeOnce([el], NEAR_MARGIN, () => context.add(() => { cleanup = setup(); }));
    return () => { stop(); if (typeof cleanup === "function") cleanup(); };
  }, { scope });
}
