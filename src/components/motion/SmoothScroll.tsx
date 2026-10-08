"use client";
import { createContext, useContext, useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lenisEnabled } from "@/lib/motion/tokens";

/** Longest page-transition animation in globals.css, plus a little slack. */
const ROUTE_SETTLE_MS = 700;

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);
/** The Lenis instance (null on touch devices and under reduced motion). Read in handlers only. */
export const useLenis = () => useContext(LenisContext);

/**
 * Lenis smooth scroll, driven by the GSAP ticker so ScrollTrigger and scroll share one clock.
 * Off entirely for reduced motion and coarse (touch) pointers, where native scroll is better.
 * The instance is an external system, so it lives in a ref rather than React state.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!lenisEnabled()) return;

    // lerp 0.15: smooth, but catches up with the wheel quickly so scrolling feels snappy, not floaty
    const instance = new Lenis({ autoRaf: false, lerp: 0.15, smoothWheel: true, anchors: { offset: -80 } });
    const offScroll = instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis.current = instance;

    return () => {
      offScroll();
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  // New route: start at the top, then re-measure every trigger once fonts are ready. Skipped on
  // the first page load, where ScrollTrigger already refreshes on "load" (a second full
  // refresh re-measured every pin and cost ~350ms of main thread for nothing).
  // A layout effect, not a passive one: route changes commit inside a view transition, and
  // layout effects run before the incoming page is captured, so it is captured at the top
  // instead of jumping there mid-animation.
  const firstRoute = useRef(true);
  useLayoutEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    // The refresh is a long main-thread task (it re-measures every pin). Each new trigger has
    // already measured itself on creation, so this is only a safety net: it waits until the
    // page-entrance animation has played, then runs when the browser is idle.
    // (Safari has no requestIdleCallback: a plain timeout there)
    let cancelled = false;
    const timer = window.setTimeout(() => {
      document.fonts?.ready.then(() => {
        if (cancelled) return;
        const run = () => { if (!cancelled) ScrollTrigger.refresh(); };
        if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 1000 });
        else window.setTimeout(run, 0);
      });
    }, ROUTE_SETTLE_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
