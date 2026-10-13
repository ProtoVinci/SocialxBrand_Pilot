"use client";
import { useSyncExternalStore } from "react";

/**
 * True when the viewport is at least `px` wide, as a media-query subscription (no resize listener,
 * no layout reads). The server render and hydration assume the narrow layout, so the first client
 * render matches the HTML; wide screens switch before any media has been requested.
 */
export function useMinWidth(px: number) {
  const query = `(min-width: ${px}px)`;
  return useSyncExternalStore(
    (cb) => { const mq = window.matchMedia(query); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
