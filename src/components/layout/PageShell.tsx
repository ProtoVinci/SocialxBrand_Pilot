import { ViewTransition, type ReactNode } from "react";

/**
 * Per-page view-transition wrapper (layouts persist across navigations, so it lives here).
 * Every navigation lifts the old page out and rises the new one in: tagged links (nav-forward /
 * nav-back) and untagged ones alike (footer links, the 404 page, browser back/forward), so no
 * route change ever swaps with a hard cut. `default="none"` keeps in-page transitions (search
 * params, Suspense reveals) from animating the whole page.
 * Pages with a dynamic segment key this wrapper on the segment (`key={slug}`): /work/a → /work/b
 * renders the same page component, which React would otherwise update in place, with no
 * enter/exit to animate.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="route-in" exit="route-out" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
