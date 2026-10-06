"use client";
import { createContext, useContext, useEffect, useRef, type RefObject } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";

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
    const reduce = window.matchMedia(MQ.reduce).matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const instance = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, anchors: { offset: -80 } });
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

  // New route: start at the top and re-measure every trigger once fonts are ready.
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, [pathname]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
