"use client";
import { useEffect } from "react";

/**
 * Leaving the page that renders this skips the whole-page view transition (rendered on the home
 * page only). Measured on Home → Work, production, 4× CPU: the snapshot transition cost ~300ms of
 * a ~1.1s click → content (docs/reviews/post-phase-audit-2026-10-15.md).
 *
 * React starts a view transition for every route change that mounts a <ViewTransition>, whatever
 * its enter/exit classes, so this is done one level down: while the page is mounted,
 * document.startViewTransition throws, and React takes its own fallback path (the one browsers
 * without the API take): it commits the next page directly, with no snapshot. The override is
 * removed when the page unmounts (passive cleanup, after that commit), so arriving at the home page
 * and every other route change keep their transition. Reduced motion is unaffected: those
 * transitions already run at 0s, and this one simply does not run.
 * Leaving through the open menu: Nav removes the panel at once on a route exit when the API exists,
 * so the new page appears without the menu's wipe.
 */
export function NoExitTransition() {
  useEffect(() => {
    if (typeof document.startViewTransition !== "function") return;
    const skip = () => { throw new DOMException("Page left without a view transition", "InvalidStateError"); };
    Object.defineProperty(document, "startViewTransition", { value: skip, configurable: true, writable: true });
    return () => { delete (document as { startViewTransition?: unknown }).startViewTransition; };
  }, []);
  return null;
}
