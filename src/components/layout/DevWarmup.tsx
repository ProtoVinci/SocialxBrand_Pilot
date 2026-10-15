"use client";
import { useEffect } from "react";

// A route is compiled the first time it is requested in `next dev`, which made the first click
// to each page wait seconds (the page transition then sits frozen on the old page). This opens the
// main routes once in the background, one at a time, after the page has settled, so they are
// compiled before anyone clicks. Development only: in a production build every route is already
// built and prefetched, and this component renders nothing and does nothing (the code is dropped
// from the production bundle).
// Each compile is real work on the same machine as the browser, so the warmup only runs while the
// visitor is idle: any scroll, click, touch or key pauses it until things have been quiet for a
// moment, and a hidden tab pauses it too. It runs once per full page load (the layout persists
// across client navigations).
const ROUTES = ["/work", "/capabilities", "/approach", "/route", "/work/creator-content", "/capabilities/strategy-consulting"];
const QUIET_MS = 1500;
const INPUTS = ["pointerdown", "keydown", "wheel", "touchstart"] as const;

export function DevWarmup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let cancelled = false;
    let lastInput = performance.now();
    const onInput = () => { lastInput = performance.now(); };
    INPUTS.forEach((e) => window.addEventListener(e, onInput, { passive: true }));
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const quiet = async () => {
      while (!cancelled && (document.hidden || performance.now() - lastInput < QUIET_MS)) await sleep(500);
    };
    const run = async () => {
      for (const path of ROUTES) {
        await quiet();
        if (cancelled) return;
        if (path === location.pathname) continue;
        try { await fetch(path, { cache: "no-store", priority: "low" } as RequestInit); } catch { /* server restarting */ }
        await sleep(300);
      }
    };
    const t = window.setTimeout(run, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      INPUTS.forEach((e) => window.removeEventListener(e, onInput));
    };
  }, []);
  return null;
}
