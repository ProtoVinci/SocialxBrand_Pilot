> **Historical reference.** Completed; what was done is in [docs/reviews/performance-fixes-2026-10-15.md](../../reviews/performance-fixes-2026-10-15.md). For current decisions use [HANDOVER.md](../../../HANDOVER.md) and the latest brief in [docs/briefs/](../).

# SOCIALxBRAND PILOT — Remaining Performance Issues, Root Causes, Fixes, and Verification Plan

> **Purpose:** This document is the implementation brief for the unresolved lag, jank, and navigation problems identified in the latest SOCIALxBRAND PILOT repository audit. It is intended to be used by Claude Code Desktop or a developer working inside the repository.
>
> **Primary goal:** Make the existing website feel immediate, stable, and smooth while preserving the brand's visual identity, creative direction, working interactions, accessibility, and responsive layouts.
>
> **Important:** Treat every finding as a hypothesis to verify against the current code before editing. The audit identified concrete risk areas, but the repository may change between audits. Do not blindly reapply fixes that are already present.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Scope and non-negotiable rules](#2-scope-and-non-negotiable-rules)
3. [Understand the symptoms correctly](#3-understand-the-symptoms-correctly)
4. [Issue 1 — Hero takeover animates layout properties](#4-issue-1--hero-takeover-animates-layout-properties)
5. [Issue 2 — Hero glare uses expensive desktop compositing](#5-issue-2--hero-glare-uses-expensive-desktop-compositing)
6. [Issue 3 — The pinned hero sequence does too much work for too long](#6-issue-3--the-pinned-hero-sequence-does-too-much-work-for-too-long)
7. [Issue 4 — HeroPill bypasses the shared video budget](#7-issue-4--heropill-bypasses-the-shared-video-budget)
8. [Issue 5 — WorkShowcase videos bypass the shared video budget](#8-issue-5--workshowcase-videos-bypass-the-shared-video-budget)
9. [Issue 6 — Multiple continuous motion systems overlap](#9-issue-6--multiple-continuous-motion-systems-overlap)
10. [Issue 7 — Full-page route transitions may be expensive](#10-issue-7--full-page-route-transitions-may-be-expensive)
11. [Issue 8 — ScrollTrigger refresh may create a delayed stall](#11-issue-8--scrolltrigger-refresh-may-create-a-delayed-stall)
12. [Issue 9 — Development route warmup may compete with interaction](#12-issue-9--development-route-warmup-may-compete-with-interaction)
13. [Issue 10 — Profile the Work index and its filtering/media behavior](#13-issue-10--profile-the-work-index-and-its-filteringmedia-behavior)
14. [Issue 11 — Make media loading and playback behavior consistent](#14-issue-11--make-media-loading-and-playback-behavior-consistent)
15. [Issue 12 — Prevent reduced-motion, resize, and navigation regressions](#15-issue-12--prevent-reduced-motion-resize-and-navigation-regressions)
16. [Implementation phases](#16-implementation-phases)
17. [Baseline and regression test plan](#17-baseline-and-regression-test-plan)
18. [Measurement standards and acceptance criteria](#18-measurement-standards-and-acceptance-criteria)
19. [Suggested investigation commands](#19-suggested-investigation-commands)
20. [Negative prompt and scope-control rules for Claude Code](#20-negative-prompt-and-scope-control-rules-for-claude-code)
21. [Phase prompts for Claude Code Desktop](#21-phase-prompts-for-claude-code-desktop)
22. [Final sign-off checklist](#22-final-sign-off-checklist)

---

## 1. Executive summary

The latest audit suggests that the remaining problems are not caused by a missing animation library. The project already uses a capable stack for this type of experience, including Next.js, React, GSAP/ScrollTrigger, Lenis, image/video assets, and custom media handling.

The higher-probability causes are **too much work happening at the same time**:

- the pinned home hero animates geometry-related CSS properties while the browser is scrolling;
- the desktop hero uses several large blur, mask, and blend-mode layers;
- multiple video components have their own activation logic instead of respecting one shared playback limit;
- several animated systems may run concurrently as a visitor moves between homepage sections;
- the route transition may capture or animate a heavyweight outgoing page;
- a delayed global `ScrollTrigger.refresh()` may create a post-navigation hitch;
- development-only route warmup may compete with interaction in `next dev`;
- the Work page's grid, media activation, and filtering need profiling to distinguish page-render cost from transition and media cost.

The previous repository performance report was said to record approximately **21 FPS during homepage scrolling under 4× CPU throttling**, with a high jank rate. Treat this as a **historical baseline from the repository report**, not as a new benchmark performed during this audit. The reported Work route load-blocking time was much lower (approximately 294 ms under the same reported CPU-throttled test), suggesting that perceived navigation delay may include transition, refresh, and media activation costs—not just initial JavaScript loading.

### Recommended order

1. Measure a reproducible production baseline.
2. Fix the hero takeover's expensive geometry animation.
3. Benchmark and simplify the desktop hero glare.
4. Unify video playback limits for hero pills and work previews.
5. Test route transitions with and without the full-page snapshot effect.
6. Investigate the ScrollTrigger refresh lifecycle.
7. isolate development-only behavior from production behavior.
8. Profile and optimize the Work grid only where the trace shows a real bottleneck.
9. Run visual, functional, responsive, accessibility, and performance regression tests.

**Do not start by replacing GSAP or Lenis, installing a new animation library, or rewriting the whole site.** This brief is aimed at narrow, measurable fixes.

---

## 2. Scope and non-negotiable rules

### In scope

- Home hero/takeover frame performance.
- Hero visual-effect compositing cost.
- Hero pill video loading and lifecycle.
- Work showcase video activation and concurrency.
- Overlapping continuous motion systems.
- Page transition behavior from Home to `/work` and back.
- Route-level `ScrollTrigger.refresh()` behavior.
- Development-only route warmup.
- Work grid mounting, filtering, animation, and media activation.
- Reduced-motion handling and lifecycle safety.
- Reproducible measurement, comparison, and regression reporting.

### Out of scope unless measurements prove it is necessary

- A wholesale redesign of the brand.
- Replacing GSAP, ScrollTrigger, Lenis, React, or Next.js.
- Installing Framer Motion, Motion One, React Spring, Locomotive Scroll, Barba, Three.js, or another runtime animation package.
- Rewriting every page, component, or design system.
- Deleting the cinematic hero, the portfolio, the marquee, or other signature elements simply because they animate.
- Recompressing every media asset without first identifying which assets affect the measured path.
- Replacing the existing responsive image pipeline with a new library without evidence.
- Adding fabricated client names, metrics, case studies, testimonials, team members, awards, pricing, or promises.
- Changing copy, layout, colors, content, or business behavior unrelated to the reported lag.

### Required working rules

1. **Inspect first, edit second.** Locate and read the current implementation and repository handover/docs before changing anything.
2. **Confirm each issue still exists.** If the issue is already fixed, record evidence and skip the code change.
3. **One performance hypothesis per change.** Avoid bundling unrelated refactors into the same commit or phase.
4. **Record before/after evidence.** Include actual commands, routes, test conditions, and results. Do not claim a gain without measurement.
5. **Preserve appearance and behavior.** Use screenshot comparisons and test interactions before accepting an optimization.
6. **Do not delete a fallback before replacing its behavior.** Preserve keyboard navigation, touch behavior, reduced motion, resize, refresh, and browser back/forward.
7. **Do not add dependencies by default.** Use the installed stack unless measurement demonstrates a concrete need.
8. **Do not report guessed facts as measured facts.** Distinguish historical repository measurements, current measurements, and estimates.
9. **Keep changes small and reviewable.** Inspect `git diff` after each phase and explain every modified file.
10. **Stop at phase boundaries.** Report the findings and wait for explicit approval before proceeding to the next implementation phase.

---

## 3. Understand the symptoms correctly

“Lag” can describe several different problems. The fix depends on which one occurs.

| Symptom | Likely class of problem | What to inspect |
|---|---|---|
| Scroll movement stutters on the Home hero | Main-thread, layout, paint, raster, or compositing work | Chrome Performance trace, frame track, layout/paint events, long tasks |
| Home looks smooth initially but stutters as sections change | Several observers/triggers/media activations firing together | Main-thread events and video start/stop events at section boundaries |
| Clicking Work takes a long time before anything appears | Route loading, compilation, transition, or navigation lifecycle | Click-to-first-content timing, route requests, React/Next navigation, trace |
| Work appears, then freezes briefly | Delayed ScrollTrigger refresh, grid animation, media decode, or hydration | Continue recording for several seconds after navigation |
| First visit is slow but second visit is fast in development | Development compilation or route warming | Compare `next dev` with production build/start |
| Videos start late or several start at once | Poster/source loading and video concurrency | Network panel, media events, active playback count |
| Mouse movement or filtering stutters | Per-event geometry reads, GSAP Flip/layout animation, handlers | Pointer event rate, forced layout, long tasks |
| Browser becomes slower after multiple route changes | Leaked listeners/triggers/tweens or stale media elements | Repeat navigation, event listeners, active ScrollTriggers, DOM/media counts |

### Important frame-time context

At 60 frames per second, a frame budget is about 16.7 ms. A trace with frames that repeatedly exceed that budget can feel janky even if network loading is fast. Conversely, a page that loads quickly can still feel slow if a route transition, layout refresh, or media decode blocks the main thread after the initial content appears.

Do not optimize from one overall “load time” number alone. Measure both **load behavior** and **interaction behavior**.

---

## 4. Issue 1 — Hero takeover animates layout properties

**Primary file:** `src/components/home/Opening.tsx`

### Current behavior to verify

The hero takeover uses a GSAP timeline that animates properties similar to `left`, `top`, `width`, `height`, `borderRadius`, and `rotate` on a card that expands to the viewport. The animation is scrubbed or driven by the pinned scroll sequence.

The key concern is `left`, `top`, `width`, and `height`. These properties can cause layout/geometry work as values change. When a large media layer is changing size while the page is pinned, the browser may need to calculate layout and paint repeatedly. Border-radius changes, video content, masks, and overlapping visual effects can increase the cost.

### Why this can cause lag

The intended animation is a visual movement and expansion. However, if it is implemented by changing the element's layout dimensions on every scroll update, the browser can be forced to recalculate more than just the visual transform. The cost can become significant when the element is large and overlays other content.

This does not mean every use of width or height is automatically slow. The performance concern is repeatedly changing geometry during a scroll-scrubbed animation on a large, layered element. Confirm it in the browser trace before changing it.

### Recommended implementation

1. Read the entire hero timeline and all of its setup/cleanup behavior. Identify the true start and end rectangles, the pinned root, responsive sizing rules, and the reset behavior.
2. Keep the existing visual intent: a card or window grows into the full-screen takeover.
3. Measure the card's start rectangle relative to a stable containing block.
4. Prefer animating a dedicated visual layer using `transform: translate(...) scale(...)` rather than continuously changing `left`, `top`, `width`, and `height`.
5. Establish a transform origin that matches the current expansion direction. If the target is full viewport, calculate the scale factors from the initial bounding rectangle to the final viewport rectangle.
6. Keep content clipping, rounded corners, and rotation visually equivalent. If border-radius interpolation is expensive or visually awkward, consider placing the visual content inside an outer clipping wrapper whose geometry is stable, then animate the inner layer. Do not add wrappers without checking stacking contexts and pointer behavior.
7. Cache initial measurements for the current layout and refresh them at appropriate lifecycle events. Re-measure on resize and ScrollTrigger refresh, but do not call `getBoundingClientRect()` repeatedly on every scroll update unless measurement shows it is necessary.
8. Ensure the timeline remains correct on reverse scroll, browser refresh at a scrolled position, mobile viewport changes, and reduced motion.
9. Use `invalidateOnRefresh` or an equivalent deliberate remeasurement strategy only if it matches the existing lifecycle. Do not force repeated global refreshes as a substitute for stable geometry.

### Illustration only — not a drop-in patch

A possible transform-based approach is to calculate the start rectangle once and tween a dedicated element's translation and scale. The exact math depends on the current DOM and containing block; Claude Code must derive this from the current implementation rather than pasting a generic snippet.

```ts
// Illustrative only: adapt to the actual layout and GSAP lifecycle.
const start = element.getBoundingClientRect();
const scaleX = viewportWidth / start.width;
const scaleY = viewportHeight / start.height;

// Prefer a transform-driven animation for the visual layer.
gsap.to(element, {
  x: targetX,
  y: targetY,
  scaleX,
  scaleY,
  ease: "none",
});
```

A real implementation must account for the element's offset parent, transforms already applied by the design, current rotation, viewport position, scroll container, and any parent transforms. The code above is not sufficient by itself for a production fix.

### Avoid these incorrect fixes

- Do not remove the hero sequence solely to improve a metric.
- Do not change it to an unrequested crossfade without screenshot review.
- Do not use `will-change: transform` on every element permanently. Use it selectively and test memory/compositing impact.
- Do not add another animation library.
- Do not remove pinning until an A/B measurement shows it is necessary.

### Acceptance criteria

- The hero card still transforms into the full-screen takeover with the same intended composition.
- Scroll reversal does not leave the card at an incorrect position or scale.
- Initial load and refresh at different scroll positions remain stable.
- Mobile and desktop geometry remain correct after resize/orientation changes.
- The Performance trace shows a reduction in repeated layout work or a meaningful improvement in frame-time consistency.
- No new layout shift, flicker, clip error, or text jump is introduced.

---

## 5. Issue 2 — Hero glare uses expensive desktop compositing

**Primary file:** `src/components/fx/HeroGlare.tsx`

### Current behavior to verify

The hero glare reportedly uses multiple large beam layers, large blur radii, CSS masks, gradients, blend modes such as multiply/overlay, and animated transforms. The mobile effect was already reduced in the previous pass; the desktop composition remained relatively heavy.

### Why this can cause lag

Large blurred elements can require significant rasterization and compositing work. Masking and blend modes can introduce additional offscreen surfaces. If large layers move continuously or overlap a pinned video, the browser may need to update large screen areas even if the elements are technically transformed.

The cost varies by browser, GPU, viewport size, and hardware. Do not assume a particular blur is the culprit until the trace or a controlled A/B test shows it.

### Recommended implementation

Use a controlled comparison with three variants:

- **A — Current version:** record draw/paint/raster/compositing behavior and screenshot appearance.
- **B — Static texture:** use a pre-rendered glare/lighting texture for the soft ambient lighting, with dimensions suited to the actual viewport and an optimized format.
- **C — Static texture plus minimal motion:** retain only one or two lightweight moving highlights if the motion is visually important.

For the static texture:

1. Generate it from the existing visual language, not from a new or unrelated design.
2. Preserve the lighting direction, hue, contrast, and gradient balance from the current hero.
3. Export it at sufficient quality for the largest supported display. Do not ship a huge uncompressed image.
4. Use responsive sizing or a suitable resolution tier if the file becomes large.
5. Keep the image decorative (`pointer-events: none`) and avoid introducing accessibility noise.
6. Avoid layering the texture over the entire page if it only belongs to the hero.
7. Verify the background does not stretch awkwardly at wide screens or mobile aspect ratios.

If motion remains, limit it to a small number of layers using transform/opacity where possible. Avoid creating permanent compositing layers for every decorative element without measuring.

### Acceptance criteria

- The hero still matches the existing brand composition in screenshots.
- The glare effect remains present and intentional.
- The desktop performance trace demonstrates less paint/raster/draw work or steadier frames.
- Asset transfer size does not increase unreasonably.
- No visual banding, texture repetition, harsh cropping, or mobile distortion appears.
- Reduced-motion behavior remains respected.

---

## 6. Issue 3 — The pinned hero sequence does too much work for too long

**Primary file:** `src/components/home/Opening.tsx`

### Current behavior to verify

The hero has a pinned scroll sequence over an extended scroll distance (reported as roughly 230% of viewport height), with multiple concurrent effects: takeover transformation, text animation, video playback, and ambient lighting.

### Why this can feel sluggish

A long pinned sequence makes users stay inside the same animated scene for longer. If several animations, media elements, and visual effects all update during that period, the browser has less opportunity to deliver inexpensive frames. Even when the animation is technically correct, the scroll can feel “heavy” or disconnected from the user's gesture.

### Recommended implementation

1. Preserve the core storytelling beat: introduce the hero, transform the key visual, and release the visitor into the next section.
2. Identify which effects truly need scroll-linked synchronization. Any nonessential effect can remain static during the critical takeover interval.
3. Test a shorter ScrollTrigger end distance. Do not pick a new value arbitrarily; compare multiple values while retaining the intended pacing.
4. Avoid initiating unrelated video or decorative transitions during the most expensive portion of the takeover.
5. Check whether the text animation needs character-level splitting during every part of the pinned timeline, or whether it can finish before the heavy media transformation.
6. Ensure the exit from the pinned scene does not trigger another full layout/refresh at the same time.
7. Test at 60 Hz and high-refresh-rate screens as well as under CPU throttling.
8. Include reduced-motion behavior: provide a clear static or shortened version that preserves all content and the primary CTA.

### Acceptance criteria

- The hero communicates the same brand story with less unnecessary scrolling.
- The user can scroll naturally without a perception of resistance or delayed response.
- The transition into the next section is predictable and stable.
- The page remains correct when scrolling rapidly through the entire scene.
- Measured frame times improve or at least do not regress when compared under the same conditions.

---

## 7. Issue 4 — HeroPill bypasses the shared video budget

**Primary file:** `src/components/home/HeroPill.tsx`

### Current behavior to verify

The `PillVideo` implementation reportedly uses a raw `<video>` element with `preload="auto"`. The capsule transitions can mount multiple slide videos as it advances. The main `Reel` component has a shared budget, but `HeroPill` follows separate playback/loading logic.

### Why this can cause lag

A media budget only works if every significant video-playing path follows it. Raw video elements can request data, allocate decoder resources, and perform playback independently of a budget used by a separate component. `preload="auto"` is a hint that allows a browser to fetch more data than the active slide needs. Multiple preloaded videos increase network and memory pressure, especially when the visitor first lands on the home page.

A paused video can still have media resources buffered or decoded, so simply pausing old slides is not always equivalent to releasing them.

### Recommended implementation

1. Review `video-budget.ts` and document its actual behavior: concurrent playback limit, priority, release semantics, visibility rules, mobile behavior, and handling of failed `play()` calls.
2. Decide whether `HeroPill` should use the existing shared budget or a small, explicit budget for hero clips. Avoid two competing policies.
3. Replace eager preloading of every upcoming slide with a poster-first strategy. Use `preload="none"` or another deliberate policy for inactive clips; the browser's support and actual behavior should be tested.
4. Only attach a video source or initiate playback when the slide is about to become active and is eligible under the budget. Do not mount an unbounded number of future video elements merely to enable a crossfade.
5. Keep the active clip and, only if required for a visual transition, one next clip. Recycle or unmount older clips after the transition completes.
6. When an element is no longer eligible, pause it and release its budget claim. If unloading the source is considered, do so only for clips that are unlikely to be needed imminently; source removal and `load()` may force a future re-download.
7. Stop or reduce capsule cycling while the tab is hidden, the user is navigating away, or the hero takeover is at its most expensive point.
8. Handle rejected `video.play()` promises gracefully; autoplay may be blocked or interrupted on some devices.
9. Keep poster images visible as a fallback if playback or network requests fail.

### Acceptance criteria

- The number of simultaneously playing hero clips stays within the agreed limit.
- Inactive clips do not eagerly download full media unnecessarily.
- The capsule still transitions smoothly and shows the intended creative content.
- No blank flash occurs while changing clips.
- The takeover does not compete with unnecessary capsule transitions.
- The shared budget releases a claim after pause/unmount/error and cannot become stuck.
- Network and active-media counts are documented before and after the change.

---

## 8. Issue 5 — WorkShowcase videos bypass the shared video budget

**Primary file:** `src/components/home/WorkShowcase.tsx`

### Current behavior to verify

The `Frame` component reportedly creates a `<video>` directly when `hot && frame.video` is true, using attributes similar to `autoPlay`, `muted`, and `loop`. It does not appear to call the same `requestPlay()` / `release()` functions used by `Reel` and `video-budget.ts`.

The touch/intersection activation path can also activate more than one visible tile, so the number of active clips may exceed the intended desktop hover behavior.

### Why this can cause lag

The site may have a global video budget in name, but raw videos can bypass it. On mobile, multiple visible cards may enter the viewport at once. Each activated video can compete for decoding, bandwidth, memory, and compositor resources. Work showcase copies used for looping can also become an unnecessary source of work if duplicate tiles are interactive or media-enabled.

### Recommended implementation

1. Identify all raw `<video>` uses in the component and establish the exact activation path for mouse, touch, keyboard, intersection, and visibility changes.
2. Route all playback requests through a common budget abstraction, or create a single documented bounded-preview controller if the shared `Reel` component cannot be reused safely.
3. On fine-pointer devices, activate a preview on deliberate hover/focus only when it is allowed by the budget.
4. On coarse-pointer devices, do not treat every pointer move/scroll as a hover. Choose one explicit behavior—poster only, tap-to-preview, or one active visible preview—and enforce a strict concurrency limit.
5. Keep all inactive tiles poster-first.
6. Make duplicate loop-track copies inert: no focusable controls, no duplicate hover activation, and no additional video source/playback work unless needed for the visible effect.
7. Cancel or release requests when the tile leaves the active region, loses hover/focus, the route changes, or the page becomes hidden.
8. Prevent multiple asynchronous `play()` calls from racing. Track the active request or use a stable activation token so an older promise cannot restart a clip after the tile has become inactive.
9. Keep keyboard users able to access project links and relevant content without requiring pointer hover.

### Acceptance criteria

- The active-preview count never exceeds the selected maximum on desktop or mobile.
- Scrolling the showcase does not activate every visible video.
- Loop duplicates do not create extra playback or focus stops.
- Preview activation remains responsive and visually correct.
- The poster stays visible until a video has a usable frame.
- Browser back/forward does not leave hidden work-preview videos playing.

---

## 9. Issue 6 — Multiple continuous motion systems overlap

**Areas to inspect:**

- `src/components/home/WorkShowcase.tsx`
- `src/components/home/Marquee.tsx`
- `src/components/home/Ladder.tsx`
- `src/components/capabilities/DivisionBoard.tsx`
- `src/components/fx/ToolsOrbit.tsx`

### Current behavior to verify

The website uses several animation patterns that can run together: looping work tracks, marquee ticker updates, scroll-linked word/video changes, an idle capability tour, orbit motion, and hero capsule transitions. Some systems already pause offscreen or have visibility checks; verify which ones work in the current code instead of assuming they are all continuously active.

### Why this can cause lag

Each animation might be inexpensive on its own, but their costs can add up. At a section boundary, an observer may activate a new motion system while another one is still animating. Media requests or decoding may begin at the same time. Multiple ticker callbacks, ScrollTriggers, React state updates, and transforms can compete for the same main thread and GPU.

### Recommended implementation

1. Create an inventory of every continuous or scroll-linked animation on the home page. Record its trigger, update mechanism, offscreen behavior, media dependencies, and cleanup.
2. Use a single lifecycle owner for each effect. Avoid having both React state and GSAP ticker updates continuously drive the same visual property.
3. Pause ambient/infinite effects when their section is sufficiently far outside the viewport. Use an existing visibility helper where appropriate rather than adding parallel observers to the same element.
4. If the current marquee is GSAP-driven, confirm it creates one reusable animation and does not recreate tweens during every update.
5. Check that `Ladder` or other scroll-linked components do not perform frequent React state updates where a direct GSAP property update is more appropriate. Do not move all state out of React automatically; change only where profiling shows repeated rendering costs.
6. Pause nonessential animation while `document.visibilityState` is hidden and clean up listeners correctly.
7. If the user scrolls through the expensive hero takeover, defer starting an unrelated idle tour until after the transition ends or the page is idle.
8. Respect `prefers-reduced-motion` by reducing or disabling nonessential continuous movement, not by hiding the actual content.
9. Verify that animations restart from a valid state when a section becomes visible again.

### Acceptance criteria

- Only the necessary animation systems run at each point in the journey.
- Offscreen systems stop consuming ongoing work when their motion is not visible or useful.
- No animation restarts multiple times due to repeated observer callbacks.
- The page feels responsive when moving between home sections.
- All important content remains available when reduced motion is enabled.

---

## 10. Issue 7 — Full-page route transitions may be expensive

**Files to inspect:**

- `src/components/layout/PageShell.tsx`
- `src/app/globals.css`

### Current behavior to verify

Pages reportedly use React `ViewTransition` wrappers, with the outgoing page fading/lifting and the incoming page rising into place over a duration of up to roughly 440 ms. The outgoing home page can contain a pinned video scene, moving tracks, blurred layers, and other composited content.

### Why this can cause perceived delay

A transition can be costly even if route loading itself is fast. Animating a snapshot or large page surface can create extra paint/compositing work and can make users wait visually for the new page. If the outgoing page remains animated while the route changes, active video/ticker/scroll effects can compete with the transition.

A duration of 440 ms is not intrinsically wrong; the issue is whether the transition adds measurable work or makes the destination feel inaccessible.

### Recommended implementation: A/B test

Create a controlled comparison. Do not immediately remove the site's entire transition system.

- **Variant A:** current full-page transition.
- **Variant B:** a shorter, simpler opacity transition when navigating away from Home.
- **Variant C:** no full-page snapshot transition for the Home-to-Work route boundary, while retaining transitions on lighter page boundaries if they remain useful.

For each variant, measure click-to-usable-content time, transition paint/compositing activity, any main-thread long tasks, and subjective smoothness on the same hardware.

If the simplified transition wins:

1. Scope the change to the expensive transition boundary rather than changing all routes.
2. Ensure the link responds immediately to click/keyboard activation.
3. Do not wait for the outgoing animation to finish before rendering the destination.
4. Stop or suspend outgoing route-specific media/ambient animations when the route is leaving.
5. Respect reduced motion.
6. Verify browser back/forward, direct route load, and repeated navigation.
7. Preserve current focus management and prevent the new page from being visually hidden or inaccessible during a transition.

### Acceptance criteria

- Clicking Work gives immediate visual feedback.
- The Work page becomes usable promptly, without waiting for unnecessary decorative motion.
- The Home page does not continue expensive playback after navigation.
- Transition appearance remains polished and consistent.
- Browser back/forward, keyboard navigation, and direct page loads work correctly.

---

## 11. Issue 8 — ScrollTrigger refresh may create a delayed stall

**Primary file:** `src/components/motion/SmoothScroll.tsx`

### Current behavior to verify

The route-change lifecycle reportedly resets scroll, waits about 520 ms, waits for fonts, and then schedules a global `ScrollTrigger.refresh()` using idle scheduling or a timeout. A global refresh can recalculate trigger positions for every active ScrollTrigger, including pinned scenes and triggers that do not belong to the new page.

### Why this can cause lag

`ScrollTrigger.refresh()` is not just a lightweight notification. It can measure trigger elements, update pin spacers, and recompute start/end values. If many triggers are registered, or if page layout is still changing, the work can cause a visible main-thread pause. A timer does not reduce the work; it only changes when it happens.

### Recommended implementation

1. Find every place that creates, refreshes, kills, or reverts ScrollTriggers.
2. Determine whether old route triggers are killed during route changes and whether new route triggers are mounted before or after refresh.
3. Verify whether the page actually needs a manual global refresh after every navigation. Do not remove refresh until pinned scenes and dynamic layouts have been tested.
4. For pages with no relevant triggers, skip unnecessary refresh work if the lifecycle permits it.
5. Where a refresh is required, coordinate it with the route's layout and font readiness without creating repeated refresh calls from several components.
6. Avoid arbitrary delays as a proxy for layout stability. Use the actual lifecycle event or a stable next-frame/idle scheduling approach, as appropriate to how the route is rendered.
7. If images, fonts, or dynamically mounted content change geometry after the first refresh, make sure the responsible component notifies the layout lifecycle deliberately instead of forcing full refreshes from unrelated components.
8. Keep a single documented owner responsible for route-level refresh policy.
9. Test browser back/forward, pinned hero state, resizing, direct inner-page loads, and rapid consecutive navigation.
10. Use performance marks or console timing during diagnosis to determine exactly how long refresh takes and which route triggers it.

### Acceptance criteria

- No unnecessary global refresh occurs when navigating to routes that do not need it.
- Required pinned scenes still align correctly with their intended scroll positions.
- The post-navigation pause is eliminated or measurably reduced.
- Repeated navigation does not accumulate triggers or pin spacers.
- No route renders with incorrect trigger positions after fonts/layout settle.

---

## 12. Issue 9 — Development route warmup may compete with interaction

**Primary file:** `src/components/layout/DevWarmup.tsx`

### Current behavior to verify

This component is reportedly development-only and begins warming several routes after a delay of about 2.5 seconds. It fetches route URLs sequentially to encourage Next.js to compile them before navigation.

### Why this can make the site feel buggy in development

Development mode performs work that differs from production, including route compilation and development-specific instrumentation. Warming multiple routes can help later navigation but may consume CPU/network while the visitor is using the page. If the user clicks or scrolls at the same time, that work can make interactions appear delayed.

### Recommended implementation

1. Confirm the component is excluded from the production build/runtime as intended.
2. Compare the same interaction in development and production before treating warmup as a production bug.
3. If warmup harms development interaction, defer it until the browser is idle when supported, and provide a fallback when idle scheduling is unavailable.
4. Stop scheduling additional warmup requests if the user starts meaningful interaction, the document becomes hidden, or a route is actively being navigated to.
5. Deduplicate route requests and ensure warmup doesn't request the current route unnecessarily.
6. Keep the set of warmed routes small and intentional. Do not precompile every route blindly.
7. Avoid turning this into an elaborate scheduler or installing a package just for route warmup.

### Acceptance criteria

- Development route warmup no longer competes noticeably with scrolling/clicking.
- Production behavior is unchanged if the component is already excluded there.
- The first navigation in development is documented separately from production navigation.
- Warmup requests do not run repeatedly after every route change.

---

## 13. Issue 10 — Profile the Work index and its filtering/media behavior

**Primary file:** `src/components/work/WorkIndex.tsx`

### Current behavior to verify

The Work index reportedly renders a grid of portfolio tiles, many using `Reel mode="hover"`, poster-first loading, and GSAP Flip for filter/layout transitions. This is a reasonable pattern, but it can still be expensive if many preview components mount at once, multiple media requests begin during scrolling, or the filtering animation repeatedly recalculates a large grid.

### Important distinction

The existing report's approximately 294 ms blocking-time result for `/work` suggests initial route JavaScript is not necessarily the main problem in the measured scenario. A visually delayed route can still be caused by the outgoing transition, a later refresh, video decode, filtering work, or development compilation.

Do not optimize the grid based on its component count alone. Use a trace to identify the phase that stalls.

### Recommended investigation

Record separately:

1. Route click to the first destination frame.
2. Route click to the first usable work card.
3. Time until the page becomes responsive to scrolling.
4. Time until first poster visible.
5. Video network requests and playback starts during the first viewport.
6. Filter interaction latency.
7. Main-thread work after navigating for at least two seconds.

### Recommended fixes if profiling confirms a bottleneck

- Keep posters available immediately and avoid waiting for previews before showing the grid.
- Limit mounted/active preview videos if component lifecycle or decoding is shown to dominate.
- Ensure `Reel mode="hover"` does not start loading or playing media on touch scrolling unintentionally.
- Keep filtering accessible and reliable. If GSAP Flip is expensive on a large grid, compare a simpler opacity/transform transition or a smaller set of animated properties.
- Avoid animating expensive layout properties across every card when a transform/opacity treatment is sufficient.
- If cards are duplicated for visual looping, ensure duplicates are not interactive and do not activate media.
- Keep link targets and keyboard focus correct after filtering.
- Preserve stable React keys, and confirm filtering does not remount unrelated cards unnecessarily.

### Acceptance criteria

- Posters and core grid content appear promptly.
- Scrolling does not initiate excessive simultaneous playback.
- Filter changes remain smooth and produce the same correct set/order of projects.
- Route-load, transition, and post-load stalls are measured separately.
- No arbitrary removal of cards or content is used to achieve a benchmark.

---

## 14. Issue 11 — Make media loading and playback behavior consistent

**Relevant files:**

- `src/components/media/video-budget.ts`
- `src/components/media/Reel.tsx` (confirm exact path/name in repository)
- `src/components/home/HeroPill.tsx`
- `src/components/home/WorkShowcase.tsx`
- Any other component that renders a raw `<video>`

### Why a single policy is needed

Media behavior can become inconsistent when the app has one managed video component but other features create raw `<video>` elements. A budget, lazy loading strategy, visibility policy, and cleanup behavior only help if all meaningful media paths use them or explicitly document why they do not.

### Recommended media policy

For every video use, identify which of these states it should occupy:

1. **Poster only:** video source not yet needed; poster or fallback is shown.
2. **Eligible/near active:** the UI has a strong reason to load the clip soon; any preloading is deliberate and bounded.
3. **Playing:** the clip holds a playback-budget slot and is genuinely visible or actively requested.
4. **Paused but retained:** the clip may resume soon, so keeping its source is worthwhile.
5. **Released/unloaded:** the clip is unlikely to be needed soon; resource release is considered if it will reduce memory without causing excessive re-downloads.

Do not add one complicated universal hook unless it genuinely simplifies the current architecture. First inventory all raw video tags, then either reuse the existing controller or document a narrowly scoped exception.

### Error and lifecycle cases to handle

- `play()` rejects because autoplay is blocked.
- The source fails or the network stalls.
- The element leaves the active viewport.
- The component unmounts during a transition.
- The page changes route.
- The browser tab becomes hidden.
- The device changes from desktop to a coarse pointer due to resizing/device emulation.
- A stale promise resolves after a newer active clip has been selected.
- Reduced motion is enabled.

### Acceptance criteria

- Active playback count stays within a documented limit for each device class.
- No media continues playing after its owner has unmounted or its route is no longer active.
- Failed playback leaves a usable poster/fallback.
- Network activity is intentional and bounded.
- The policy does not cause visible blank flashes or excessive re-downloads.

---

## 15. Issue 12 — Prevent reduced-motion, resize, and navigation regressions

This is a cross-cutting reliability task rather than one isolated bug.

### Why it matters

Performance changes to GSAP, ScrollTrigger, media activation, and transitions can introduce regressions in less common flows. A transform-based takeover can fail after resize; a media budget can keep a slot reserved after unmount; a refresh change can break pinned scenes; a route transition change can leave the outgoing page animating; an event listener can be registered multiple times.

### Required lifecycle checks

- All event listeners are removed using the same function reference that was added.
- All observers are disconnected on cleanup.
- All GSAP timelines, ScrollTriggers, delayed calls, and ticker callbacks are cleaned up when their component unmounts or their route deactivates.
- A component does not instantiate a new tween on every scroll update when a reusable tween or direct value update is appropriate.
- Resize/orientation changes do not leave stale measurements.
- Browser back/forward returns sections and animations to a valid state.
- Reduced-motion behavior does not remove meaningful content or essential controls.
- `video.play()` rejections and media loading failures do not produce unhandled promise errors.
- Route transitions do not make content unreachable to keyboard users or leave focus behind on an outgoing route.
- Touch scrolling does not trigger hover-only effects unintentionally.

### Acceptance criteria

Run the same Home → Work → Home → Work sequence several times. Confirm that active videos, active ScrollTriggers, event listeners, and memory usage do not grow without bound. The page should feel consistent on the first and later navigations.

---

## 16. Implementation phases

Claude Code must complete these phases sequentially. It must not move on to the next phase without reporting the outcome and receiving approval.

### Phase 0 — Read-only confirmation and baseline

**No code changes.**

Tasks:

1. Inspect `package.json`, lockfile, `HANDOVER.md`, QA/performance reports, and existing test scripts.
2. Confirm each file and behavior mentioned in this README still exists.
3. Identify any fixes that have already been completed in the latest repository.
4. Run the current type/lint/test/build checks where practical; report failures without modifying unrelated code.
5. Establish whether the current measured environment is development or production.
6. Capture a baseline for home scroll, Home → Work navigation, Work filtering, and reverse navigation.
7. Record the environment: browser/version, OS, viewport, CPU throttling, network throttling, whether the cache is cold/warm, command used, and actual results.
8. Produce a short issue matrix: `Confirmed`, `Not reproduced`, `Already fixed`, or `Needs browser trace`.

**Exit gate:** no code changed; baseline and issue matrix are presented for review.

### Phase 1 — Fix the confirmed hero rendering bottleneck

Scope:

- `src/components/home/Opening.tsx`
- `src/components/fx/HeroGlare.tsx` only if the trace confirms it contributes materially

Tasks:

1. Reproduce and record the hero scrolling trace.
2. Implement the narrowest geometry-animation improvement.
3. Test static-glare and minimal-motion variants if glare compositing is costly.
4. Compare frame-time and visual results with the baseline.
5. Run the hero resize, reverse-scroll, and reduced-motion checks.

**Exit gate:** measurable or clearly evidenced improvement, with screenshots and no visual/functional regressions.

### Phase 2 — Unify hero and showcase video activation

Scope:

- `src/components/media/video-budget.ts`
- `src/components/home/HeroPill.tsx`
- `src/components/home/WorkShowcase.tsx`
- Existing `Reel` component only as necessary

Tasks:

1. Inventory all video elements and the existing budget policy.
2. Route hero and WorkShowcase preview playback through a bounded policy.
3. Remove unnecessary eager preload behavior.
4. Keep poster-first fallback, cleanup, and error handling.
5. Test desktop hover, touch scrolling, route changes, hidden tab, and failed playback.
6. Record active-video counts and media requests.

**Exit gate:** concurrency is bounded and documented, visual transitions are intact, and media does not continue after owner/route deactivation.

### Phase 3 — Reduce overlapping motion without flattening the design

Scope:

- `WorkShowcase.tsx`
- `Marquee.tsx`
- `Ladder.tsx`
- `DivisionBoard.tsx`
- `ToolsOrbit.tsx`

Tasks:

1. Inventory continuous effects and their start/pause/cleanup rules.
2. Fix only the overlaps or duplicate drivers shown in profiling.
3. Pause offscreen/idle motion when appropriate.
4. Verify GSAP timelines and triggers are not recreated repeatedly.
5. Test reduced motion and entering/leaving sections quickly.

**Exit gate:** no required interaction or visual content is removed, and the motion lifecycle is simpler and stable.

### Phase 4 — Optimize Home → Work navigation

Scope:

- `src/components/layout/PageShell.tsx`
- `src/app/globals.css`
- `src/components/motion/SmoothScroll.tsx`

Tasks:

1. Compare current transition with one or more simpler variants.
2. Choose the version that improves responsiveness while preserving the desired style.
3. Trace the route-level `ScrollTrigger.refresh()` timing and cost.
4. Avoid unnecessary refreshes while retaining correct pin/trigger geometry.
5. Ensure the outgoing home page releases media and continuous motion.
6. Test direct route loads and browser back/forward.

**Exit gate:** Home → Work is measurably or visibly more immediate; no pinned-section or focus regressions.

### Phase 5 — Separate development behavior from production behavior

Scope:

- `src/components/layout/DevWarmup.tsx`
- Existing developer scripts only if needed

Tasks:

1. Compare first navigation in `next dev` with a production build/start.
2. Verify that warmup is development-only.
3. If warmup competes with interaction, defer or cancel it when interaction begins.
4. Avoid adding complex scheduling infrastructure.

**Exit gate:** report clearly whether the slow navigation is production-reproducible and verify any warmup change does not alter production behavior.

### Phase 6 — Work index targeted optimization

Scope:

- `src/components/work/WorkIndex.tsx`
- Its direct tile/filter/media components only if trace evidence calls for it

Tasks:

1. Measure route entry, first usable card, post-navigation stall, and filter changes separately.
2. Optimize the phase that actually blocks interaction.
3. Keep posters immediate, playback bounded, and filters correct.
4. Preserve the existing project list and design.

**Exit gate:** Work loads and filters correctly without unnecessary media activation or new visual regressions.

### Phase 7 — Final regression and handover

Tasks:

1. Run type checking, lint, tests, and production build.
2. Re-run the same browser performance scenarios as the baseline.
3. Test Home, Work, navigation back to Home, filtering, resize, mobile/touch, and reduced motion.
4. Inspect `git diff` and ensure no unrelated work was added.
5. Update the repository's handover/performance report with measured results, conditions, known limitations, and files changed.
6. Report any issue that could not be tested rather than claiming it passed.

**Exit gate:** provide a concise final report including before/after figures, screenshots or trace references if available, test results, changed files, and unresolved issues.

---

## 17. Baseline and regression test plan

Use the same conditions before and after every implementation phase. A comparison is not valid if the conditions change materially.

### Scenario A — Initial Home load

1. Start from a fresh production server.
2. Use the same viewport and browser profile.
3. Record initial navigation to `/`.
4. Record when the main heading, primary CTA, and hero poster are visible.
5. Record video requests and when each video starts playback.
6. Note long tasks, layout shifts, and console errors.

### Scenario B — Scroll through the hero

1. Start at the top of Home.
2. Scroll through the pinned hero at a controlled rate.
3. Repeat with a fast scroll and reverse scroll.
4. Record frame-time distribution, long tasks, layout events, paint/raster work, and jank.
5. Verify the takeover and hero copy at each transition point.

### Scenario C — Move through home sections

1. Scroll from hero into the next section and through the work showcase.
2. Observe whether multiple videos start at the same time.
3. Record stalls at section boundaries.
4. Check whether offscreen animations and video playback pause or continue.
5. Repeat after waiting on the page for a few seconds.

### Scenario D — Home → Work navigation

1. Start from the top of Home and wait for the hero to settle.
2. Click the Work navigation item.
3. Record click-to-first-content and click-to-interactive time.
4. Continue the recording for at least two seconds after the page appears.
5. Look for snapshot/transition cost, delayed refresh, media decode, and long tasks.

### Scenario E — Work interactions

1. Scroll through the initial work grid.
2. Hover tiles using a mouse.
3. Scroll/tap using a touch device or device emulation.
4. Filter by project category.
5. Navigate back and forth between project details and Work.
6. Confirm posters, filtering, and project links remain correct.

### Scenario F — Lifecycle reliability

Repeat Home → Work → Home several times. Confirm that:

- active playback does not grow across routes;
- old route animations stop;
- ScrollTrigger counts do not continually rise;
- listeners are cleaned up;
- no delayed stall appears after navigation;
- resize and reduced-motion behavior remain valid.

### Recommended browser tools

Use Chrome/Chromium DevTools where available:

- **Performance** for frame time, long tasks, layout, paint, raster, compositing, and interaction timing.
- **Network** for route/data/image/video requests and transfer sizes.
- **Rendering** tools for paint flashing and layer/compositing diagnosis, if helpful.
- **Console** for errors and unhandled media promises.
- **Lighthouse** as a supplementary check, not the sole source of truth for scroll smoothness.

Do not collect sensitive customer data in test traces. A local development test is preferred.

---

## 18. Measurement standards and acceptance criteria

### Make before/after comparisons reproducible

Every measurement report must state:

- commit or source state;
- production or development mode;
- browser and browser version;
- OS/device class;
- viewport size and device pixel ratio if known;
- CPU throttling and network throttling;
- cold or warm cache;
- route and exact interaction sequence;
- number of repetitions;
- metric definition and result;
- any known noise or measurement limitation.

Use multiple repetitions where practical. Report medians and variability rather than selecting the best run. If results are noisy, say so and gather more evidence.

### Performance metrics to capture

For Home hero scroll:

- frame-time distribution and dropped/janky frames;
- long tasks on the main thread;
- layout/recalculate-style time;
- paint/raster/compositing activity;
- media starts and concurrent playbacks.

For Home → Work navigation:

- click to first destination content;
- click to a usable/interactive grid;
- transition duration and related rendering cost;
- post-navigation long tasks;
- time/cost of `ScrollTrigger.refresh()` if it runs.

For Work filtering:

- input-to-visible-result latency;
- layout/paint time during filter animation;
- count of re-rendered/remounted project cards if it is practical to measure;
- any errors or incorrect focus order.

### How to interpret the existing figures

The previously cited 21 FPS and approximately 27.9% jank figure are a historic signal that the home hero deserves attention. They are not a guarantee that every machine will see that result, nor should they be presented as a fresh benchmark. The goal is to run the same script/browser setup after each phase and show whether the result improved.

For a nominal 60 Hz display, aim for frame times close to or below 16.7 ms most of the time. Do not claim that every frame must always be below this threshold, and do not set an arbitrary FPS pass/fail if the measurement is too noisy. Explain the distribution and user-visible result.

### Functional criteria are equally important

A fix is not acceptable if it improves one number but breaks:

- responsive hero geometry;
- pinned scroll behavior or reverse scrolling;
- content visibility;
- touch interaction;
- keyboard navigation;
- browser back/forward;
- media fallbacks;
- reduced motion;
- direct loading of inner routes;
- project filtering and links.

---

## 19. Suggested investigation commands

First inspect the repo's existing scripts and `package.json`. Do not assume that every command below exists or that its flags are unchanged.

Typical production validation commands may be:

```bash
npm run build
npm run start -- --port 3100
```

The existing repository audit notes may include custom QA commands such as:

```bash
node scripts/qa/perf.mjs --url=/ --cpu=4 --scroll=7000
node scripts/qa/media-audit.mjs --detail
node scripts/qa/debug.mjs --url=/
npm test -- --workers=1
```

**Before running them:** inspect the current scripts and each script's help/implementation. If a script is absent or uses different flags, report that and use the repository's supported equivalent. Do not create replacement test harnesses unless approved.

Also inspect:

```bash
git status --short
git diff --stat
git diff
```

Use `git status` before starting to avoid confusing the user's existing changes with the work in this plan. Never reset or overwrite uncommitted user changes.

---

## 20. Negative prompt and scope-control rules for Claude Code

Copy this section into Claude Code as project instructions before beginning implementation.

> ### STRICT NEGATIVE PROMPT — DO NOT DO THESE THINGS
>
> You are working on an existing Next.js/React agency website. Your task is to fix only the verified lag, jank, video concurrency, route-transition, and lifecycle issues described in this README.
>
> **Do not perform random work.** Do not redesign unrelated pages, invent new features, replace brand elements, rewrite copy outside the requested scope, rearrange the service catalogue, change the route structure, or alter project content just because you think it could be improved.
>
> **Do not hallucinate.** Do not claim a bug exists until you locate it in the current source or reproduce it. Do not invent files, function names, exports, package scripts, dependencies, measurements, or test outcomes. When a path or API differs, search the repository and explain the discrepancy. When evidence is missing, state that it is unknown.
>
> **Do not blindly reapply old fixes.** Inspect the current implementation and the repository handover first. If an item is already implemented, verify it and mark it “already fixed” or “not reproduced.” Do not change functioning code just to show activity.
>
> **Do not install another animation or smooth-scroll library.** Do not add Framer Motion, Motion One, React Spring, Locomotive Scroll, Barba, Three.js, or another runtime package as a shortcut. Do not replace GSAP, ScrollTrigger, Lenis, Next.js, or React without explicit approval and measured evidence that the existing stack cannot solve the issue.
>
> **Do not make broad code edits.** Do not refactor the whole app, rename many components, change architecture unrelated to the measured issue, or modify unrelated CSS. Keep patches minimal, local, reversible, and easy to review.
>
> **Do not delete the visual identity.** Do not remove the cinematic hero, brand glare, work showcase, marquee, pinned scene, or other signature creative elements simply to improve a performance score. Prefer targeted transform/compositing/media lifecycle improvements and compare screenshots.
>
> **Do not use fake evidence.** Never invent clients, performance numbers, testimonials, prices, results, awards, user counts, or business claims. Never say a performance score improved unless you ran the corresponding test under comparable conditions. Distinguish measured results from estimates.
>
> **Do not change unrelated behavior.** Preserve routes, navigation labels except where explicitly in scope, service content, project metadata, CTA destinations, contact details, forms, accessibility, keyboard behavior, touch behavior, and current visual design unless a change is necessary for a verified issue and is documented.
>
> **Do not disable safeguards casually.** Do not remove ScrollTrigger refresh, video budgeting, reduced-motion support, cleanup, error handling, or fallbacks unless you can demonstrate they are unnecessary and replace the behavior safely.
>
> **Do not optimize by hiding or deleting content.** Do not remove cards, sections, videos, service entries, or page elements solely to improve a benchmark. Reduce unnecessary work while preserving required content.
>
> **Do not proceed across phases automatically.** Complete only the phase the user explicitly approved. At the end, summarize the files changed, the precise reason for each change, test results, before/after evidence, and remaining uncertainties. Stop and wait for approval before starting the next phase.
>
> **Required behavior before editing:** inspect the current code, report the specific lines/functions responsible, explain the intended minimal patch, and identify the tests you will use. If the user has not approved implementation yet, remain read-only.

---

## 21. Phase prompts for Claude Code Desktop

Use one prompt at a time. Do not paste all prompts as one instruction to execute every phase.

### Prompt 0 — Read-only audit

```text
Read SocialxBrand_Performance_Fixes_README.md fully. Complete Phase 0 only. Do not edit any files.

Inspect the current repository and verify each issue in Sections 4–15 against the actual code. Inspect the package scripts, handover notes, QA scripts, and performance reports. Distinguish confirmed issues, already-fixed issues, not-reproduced issues, and issues requiring browser profiling. Establish whether the reported lag occurs in development, production, or both if the required environment is available.

Report exact file paths and relevant function/component names. Do not invent line references or claim new performance measurements you did not run. Provide a minimal plan for Phase 1 only and stop for approval.
```

### Prompt 1 — Hero takeover

```text
Implement Phase 1 only from SocialxBrand_Performance_Fixes_README.md, and only for issues confirmed in Phase 0. Follow the negative prompt in Section 20.

First state the precise change you intend to make in Opening.tsx and, only if measurements justify it, HeroGlare.tsx. Then make the smallest viable change. Preserve the current hero design, scrolling narrative, responsive layout, reduced-motion behavior, and reverse-scroll behavior.

Run the approved before/after tests under comparable conditions. Show actual results and screenshots or trace evidence if available. Do not proceed to Phase 2.
```

### Prompt 2 — Media budget

```text
Implement Phase 2 only from SocialxBrand_Performance_Fixes_README.md, for verified issues only. Inspect video-budget.ts, the Reel implementation, HeroPill.tsx, and WorkShowcase.tsx before editing. Do not create a parallel unbounded media system or install packages.

Make playback concurrency explicit for hero and work preview videos, remove unnecessary eager preloading, and preserve posters, crossfades, touch behavior, error handling, and cleanup. Verify active playback count and media network activity. Report changed files and test results, then stop.
```

### Prompt 3 — Motion overlap

```text
Implement Phase 3 only from SocialxBrand_Performance_Fixes_README.md. Do not flatten the design or disable every animation. Profile and fix only overlapping, duplicate, or improperly cleaned-up motion systems demonstrated by evidence. Preserve existing visual intent and reduced-motion behavior.

Report the animation lifecycle before and after, each file changed, measurements, and regressions tested. Stop for approval before Phase 4.
```

### Prompt 4 — Navigation and ScrollTrigger

```text
Implement Phase 4 only from SocialxBrand_Performance_Fixes_README.md. Compare the existing Home-to-Work transition with a simpler variant, and measure ScrollTrigger.refresh() cost and timing. Do not globally remove ViewTransition or ScrollTrigger.refresh() without evidence and a replacement lifecycle strategy.

Make the smallest proven change. Preserve direct route loads, browser back/forward, pinned scenes, focus handling, and responsive geometry. Report before/after click-to-usable timing and trace evidence. Stop before Phase 5.
```

### Prompt 5 — Development warmup

```text
Implement Phase 5 only. Compare development and production behavior, inspect DevWarmup.tsx and the current package scripts, and confirm whether route warmup actually competes with user interaction. If the issue is development-only, make only a small development-only adjustment. Do not change production code unnecessarily. Report the comparison and stop.
```

### Prompt 6 — Work index

```text
Implement Phase 6 only. Profile WorkIndex route entry, time to usable project grid, video activation, and filter interactions separately. Change only the specific component/path that evidence shows is responsible. Preserve all projects, filters, links, keyboard focus, and visual direction. Report before/after results and stop.
```

### Prompt 7 — Final regression

```text
Complete Phase 7 only from SocialxBrand_Performance_Fixes_README.md. Do not add new features or perform another broad optimization pass. Run the available type, lint, test, build, media, and performance checks. Repeat the same browser scenarios and environment used for the baseline. Review git diff and report all modified files.

Separate verified improvements from inconclusive results. List any tests not run and why. Do not claim success without evidence. Do not overwrite or reset user changes.
```

---

## 22. Final sign-off checklist

### Home hero

- [ ] Hero takeover no longer causes the previously observed level of scroll stutter.
- [ ] The transition preserves the visual design and responds to scroll reversal.
- [ ] Desktop glare has been compared against a static/minimal-motion alternative if profiling justified it.
- [ ] No new layout shift, clipping, or resize bug exists.
- [ ] Reduced motion remains usable and complete.

### Video and media

- [ ] HeroPill playback is bounded and does not eagerly preload all upcoming slides.
- [ ] WorkShowcase video activation uses an explicit concurrency limit.
- [ ] Touch scrolling does not activate an uncontrolled number of previews.
- [ ] Inactive previews show posters and do not keep playing unexpectedly.
- [ ] Media play failures are handled without an unhandled promise rejection.
- [ ] Playback claims and listeners are released on unmount, route change, and hidden-tab transitions.

### Motion lifecycle

- [ ] Continuous effects pause when they are genuinely not needed.
- [ ] No known redundant ticker/tween or duplicate animation driver remains without a documented reason.
- [ ] ScrollTriggers and event listeners do not accumulate after repeated navigation.
- [ ] Existing visual effects have not been removed without approval.

### Navigation and Work

- [ ] Home → Work responds promptly.
- [ ] Post-navigation refresh does not introduce a visible freeze.
- [ ] Direct route loads and browser back/forward work.
- [ ] Work posters/grid are usable before previews finish loading.
- [ ] Filtering remains correct, accessible, and responsive.
- [ ] Production and development results have been clearly separated.

### Code quality and evidence

- [ ] Type checking passes, or pre-existing failures are documented.
- [ ] Lint passes, or pre-existing failures are documented.
- [ ] Tests pass, or unavailable/flaky tests are documented.
- [ ] Production build succeeds.
- [ ] Before/after performance comparison uses comparable conditions.
- [ ] All files changed are listed and explained.
- [ ] No unrelated packages, redesigns, content changes, or fabricated facts were added.
- [ ] Repository changes and uncommitted user work were preserved.

---

## Final instruction

Treat this as a **measured performance repair, not a redesign challenge**. The site already has a distinctive visual identity and a capable animation stack. The priority is to reduce unnecessary main-thread, layout, raster, compositing, and media work at the exact moments users feel lag: scrolling through the home hero, moving between sections, and navigating from Home to Work.

If a suspected issue cannot be reproduced or measured, document the uncertainty and do not invent a fix. If a fix improves performance but breaks the design or behavior, reject or revise it. Make one controlled change at a time, prove what improved, and stop at each phase boundary for review.
