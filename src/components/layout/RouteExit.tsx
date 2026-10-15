"use client";
import { useLayoutEffect, useRef } from "react";

/**
 * Takes the outgoing page out of layout just before its animations are torn down.
 *
 * Leaving a page reverts every GSAP context on it (useGSAP cleanups). Each ScrollTrigger it kills
 * reads the scroll position right after the previous revert wrote styles, so on the home page
 * (a dozen triggers over a very long, layered page) every kill forced a full layout of the page
 * that was being thrown away: a single ~1.5s task at 4x CPU between the click and the new page.
 * With the page set to display:none first, those layouts have almost nothing to measure.
 *
 * It must be the FIRST child of the page wrapper: React runs layout-effect cleanups of a removed
 * tree in order, so this one (hide) runs before the page's own (revert). The page has already been
 * captured for the view transition by then, and it is removed in the same commit, so the hiding is
 * never seen. Setup shows the wrapper again, which keeps React's development double-invoke
 * (cleanup, then setup again) harmless: this setup runs before the page's own effects re-run.
 */
export function RouteExit() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const page = ref.current?.parentElement;
    if (!page) return;
    page.style.removeProperty("display");
    return () => { page.style.display = "none"; };
  }, []);
  return <span ref={ref} hidden />;
}
