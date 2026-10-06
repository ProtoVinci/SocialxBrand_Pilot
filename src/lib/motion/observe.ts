// One-shot viewport observers for reveals. IntersectionObserver instead of ScrollTrigger:
// these never take part in ScrollTrigger.refresh(), which re-measures every trigger on the
// page (with three pins on the home page, each extra trigger made refreshes visibly slower).

/** The reveal line, matching `revealStart` ("top 82%"): the bottom 18% of the viewport is excluded. */
export const REVEAL_MARGIN = "0px 0px -18% 0px";
/** About a screen ahead: for preparing work (splitting text) before it is needed. */
export const NEAR_MARGIN = "100% 0px 100% 0px";

/**
 * Calls `onEnter` once with every target that has reached the margin (targets arriving in the
 * same frame come as one batch, so they can stagger). Targets already scrolled past, e.g. after
 * a reload mid-page, count as entered. Returns a cleanup that disconnects the observer.
 */
export function observeOnce(targets: Element[], rootMargin: string, onEnter: (batch: Element[]) => void) {
  const pending = new Set(targets);
  const io = new IntersectionObserver((entries) => {
    const batch: Element[] = [];
    for (const e of entries) {
      const passed = e.boundingClientRect.bottom < (e.rootBounds?.top ?? 0);
      if ((e.isIntersecting || passed) && pending.delete(e.target)) {
        io.unobserve(e.target);
        batch.push(e.target);
      }
    }
    if (batch.length) onEnter(batch);
    if (!pending.size) io.disconnect();
  }, { rootMargin });
  targets.forEach((t) => io.observe(t));
  return () => io.disconnect();
}
