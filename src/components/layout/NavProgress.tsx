"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Instant feedback for a route change. The page transition holds the old page still until the
 * new one is ready (the browser captures it first), so a slow route (a first visit in dev, a
 * cold network) reads as a freeze. This thin bar and a progress cursor start on the click itself:
 * it fills slowly while the page loads and completes the moment the path changes.
 *
 * It listens at the document, so every link counts (menu, footer, cards, plain anchors) without
 * each one wiring up pending state, and it keeps no React state: the bar is driven by data
 * attributes, so a click never re-renders anything.
 */
export function NavProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLSpanElement>(null);
  // set by the effect below; called when the path changes (the new page is in)
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const root = document.documentElement;
    let loading = false;
    let timers: number[] = [];
    const clear = () => { timers.forEach(window.clearTimeout); timers = []; };

    const finish = (abort = false) => {
      if (!loading) return;
      loading = false;
      clear();
      delete root.dataset.navigating;
      if (el.dataset.state === "loading" && !abort) {
        el.dataset.state = "done";
        timers.push(window.setTimeout(() => { el.dataset.state = "idle"; }, 450));
      } else {
        el.dataset.state = "idle";
      }
    };
    finishRef.current = finish;

    const start = () => {
      if (loading) return;
      loading = true;
      clear();
      root.dataset.navigating = "";
      // not shown at all for a navigation that completes within ~140ms
      timers.push(window.setTimeout(() => { el.dataset.state = "loading"; }, 140));
      // a navigation that never lands must not leave the bar hanging
      timers.push(window.setTimeout(() => finish(true), 20_000));
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? (e.target.closest("a[href]") as HTMLAnchorElement | null) : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash
      start();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
      clear();
      delete root.dataset.navigating;
    };
  }, []);

  useEffect(() => { finishRef.current(); }, [pathname]);

  return <span ref={bar} data-nav-progress data-state="idle" aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-gradient-to-r from-blue to-signal" />;
}
