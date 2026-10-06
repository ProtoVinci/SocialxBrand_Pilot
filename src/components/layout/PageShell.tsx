import { ViewTransition, type ReactNode } from "react";

/**
 * Per-page view-transition wrapper (layouts persist across navigations, so it lives here).
 * Tagged navigations (nav-forward / nav-back) lift the old page out and rise the new one in;
 * untagged ones (browser back, refresh) swap instantly.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "route-in", "nav-back": "route-in", default: "none" }}
      exit={{ "nav-forward": "route-out", "nav-back": "route-out", default: "none" }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
