"use client";
import { useEffect } from "react";

// A route is compiled the first time it is requested in `next dev`, which made the first click
// to each page wait seconds (the page transition then sits frozen on the old page). This opens the
// main routes once in the background, one at a time, after the page has settled, so they are
// compiled before anyone clicks. Development only: in a production build every route is already
// built and prefetched, and this component renders nothing and does nothing.
const ROUTES = ["/work", "/capabilities", "/approach", "/route", "/work/creator-content", "/capabilities/strategy-consulting"];

export function DevWarmup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    let cancelled = false;
    const run = async () => {
      for (const path of ROUTES) {
        if (cancelled || path === location.pathname) continue;
        try { await fetch(path, { cache: "no-store", priority: "low" } as RequestInit); } catch { /* server restarting */ }
        await new Promise((r) => setTimeout(r, 300));
      }
    };
    const t = window.setTimeout(run, 2500);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, []);
  return null;
}
