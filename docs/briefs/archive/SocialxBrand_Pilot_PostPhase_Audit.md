> **Historical reference.** Completed; what was done is in [docs/reviews/post-phase-audit-2026-10-15.md](../../reviews/post-phase-audit-2026-10-15.md). For current decisions use [HANDOVER.md](../../../HANDOVER.md) and the latest brief in [docs/briefs/](../).

# SOCIALxBRAND PILOT — Post-Phase Performance & Bug Regression Audit

**Repository reviewed:** `SocialxBrand_Pilot(3).zip`  
**Audit date:** 15 October 2026  
**Scope:** Home scroll/section transitions, Home → Selected Work navigation, video lifecycle, GSAP/ScrollTrigger ownership, remaining load work, and test coverage.  
**Important:** This is a source-code audit plus a review of the repo's `docs/reviews/performance-fixes-2026-10-15.md`. I did not modify the uploaded app. I could not complete a fresh dependency install/browser run in this environment, so fresh typecheck/build/Playwright results are **not claimed** here. The repo's own recorded measurements are quoted as historical reported measurements, not fresh measurements from this audit.

---

## 1. Executive summary

The most recent performance pass made meaningful improvements, but the app has **not reached a smooth, reliable result yet**. The repo's own report still records poor frame consistency during the Home scroll, no measurable improvement claimed for Home TBT/LCP, and a remaining Home → Work delay. It also explicitly says that real laptop/phone GPU behavior was not measured.

The most important remaining findings are:

1. **Confirmed code/report mismatch in `HeroPill.tsx`:** `reach` only increases. As each capsule cycles, more videos are permanently mounted. Every mounted `PillVideo` uses `preload="auto"`, which can fetch video data even when the shared budget has paused that video. The shared budget limits *playback*, not *network preloading*. The current video for a new slide is also not mounted until the 750 ms handover timeout, so the intended video warm-up occurs late.
2. **Home scrolling is still objectively rough in the report:** the reported production/headless 4× CPU test saw about 18–19 FPS and 32–40% jank on a 7,000 px Home scroll. The hero-only trace improved substantially, but the wider page still has many slow frames and 49–58 long tasks in the reported run. The report's own `frames slower than 50ms` values are still 31.2% in the hero and 58.2% in the 3,000–7,000 px section test.
3. **`MethodBoard` creates a lot of independent character timelines when rows resolve.** Each non-space character gets a separate timeline with 4–6 flip cycles. This can create hundreds of tween/callback entries across the board and bunch work together when a fast scroll skips several rows. The setup also scrambles all row text and reveals the first row on initial mount, long before the visitor reaches the board.
4. **Potential GSAP lifecycle leak:** several asynchronous callbacks create new GSAP animations outside the original `useGSAP` execution context. Cleaning up an `IntersectionObserver` or `ScrollTrigger` does not automatically guarantee that later-created tweens/timelines are reverted. The most important review targets are `MethodBoard.tsx`, `Ladder.tsx`, `Reveal.tsx` group mode, `ScreeningMedia.tsx`, and the mobile manifesto callback in `Opening.tsx`.
5. **Home → Work still has a noticeable transition cost.** The repo's report records click-to-new-page-in-DOM at about 1.09–1.36 seconds under its 4× CPU scenario and a 496–646 ms view-transition update task. That is an improvement, but still leaves room to reduce the work done during navigation.
6. **Below-the-fold setup is only partially deferred.** `WorkShowcase`, `Marquee`, `Finale`, and the footer wordmark use `useGSAPNear`, but `Ladder`, `MethodBoard`, and `AiAmplifies` perform significant setup when Home mounts. `Ladder` is CSS-sticky, not ScrollTrigger-pinned; its section height is declared in CSS, so near-viewport initialization should be evaluated rather than assumed impossible.
7. **The current tests do not appear to protect the HeroPill carousel's long-session media behavior.** The test suite checks the takeover's loading time and several other video cases, but does not assert that HeroPill keeps a bounded number of mounted videos and bounded video requests after multiple carousel cycles.

Do not replace GSAP, Lenis, or Next.js and do not add an animation library. Fix the root causes, add regression tests, then compare a production baseline and final build on the same machine and on real hardware.

---

## 2. Evidence and limitations

The repo's `docs/reviews/performance-fixes-2026-10-15.md` says it used interleaved A/B production builds, headless Chromium, 4× CPU throttling, 1440×900 unless noted, and a software renderer. Its reported results include:

| Scenario | Repo-reported final result | Interpretation |
|---|---:|---|
| Home hero scroll | 31.2% of frame gaps >50 ms | Still many visibly slow frames in this stress test. |
| Home sections, scroll positions 3,000–7,000 px | 58.2% of frame gaps >50 ms | The wider Home page remains a major source of lag. |
| Home full scroll via `perf.mjs` | 18.0–19.4 FPS; 32–40% jank; 49–58 long tasks | Not yet a smooth result under the test's CPU constraints. |
| Home → Work click-to-new-page-in-DOM | 1,091–1,357 ms | Improved but still costly under 4× CPU. |
| Home → Work view-transition update task | 496–646 ms in two comparable runs | Large enough to investigate on slower devices. |
| Home load TBT/LCP | No improvement claimed | Initial page blocking was not proven fixed. |
| Real GPU testing | Not performed | Headless software rendering does not represent all laptop/phone GPUs. |

These results are useful for prioritization, but do not equate headless FPS directly with real-device FPS. Use Chrome DevTools Performance traces on the target laptop and a mid-range phone as a final check.

---

## 3. P0 — Fix the HeroPill carousel media-window bug

**File:** `src/components/home/HeroPill.tsx`  
**Status:** Confirmed by code inspection; no fresh browser request trace collected in this audit.

### What the source currently does

- `reach` starts at `0`.
- A slide advances on the interval (`1,400 ms` for the top capsule; `1,700 ms` for the lower capsule).
- After a transition has already started, a timeout of `HANDOVER_MS = 750` sets `reach` to at least `i + 1`.
- Each `<video>` is mounted whenever `k <= reach`.
- `reach` never decreases.
- Each mounted video is rendered by `PillVideo` with `preload="auto"`.

Consequently, after several cycles, all four videos in each capsule can be mounted, rather than just the current/next/transitioning slides. Once mounted, paused slides can still fetch because `preload="auto"` does not consult `video-budget.ts`. The shared budget's limit is a playback/decoder policy, not a bound on media requests.

There is a second timing issue: the *new current* video's element is not mounted until the 750 ms handover timeout after `i` changes. The visual slide transition lasts around 700 ms. That means the intended video warm-up is late; the new slide can show its poster through the transition and start requesting/playing its video near or after the transition finishes.

The current code comment says the current and next clip are the only fetches ahead of time, but the monotonic `reach` logic does not enforce that.

### Required fix

Implement a **sliding media window**, not a high-water-mark counter:

- Maintain the current slide, the outgoing slide during the transition, and the next slide to prewarm.
- Initial render should mount the current and next video only where the source is a video; other slides may retain lightweight poster markup only if the browser is not downloading all overlapping lazy images. Measure this in the network trace.
- On each transition, the current becomes the outgoing slide, the next becomes current, and one subsequent slide becomes the next prewarm target.
- After the outgoing transition ends, unmount/recycle it so the window does not grow over time.
- Give `PillVideo` an explicit preload policy. Use preloading only for the single upcoming slide per capsule. Let the current clip start by playback, and don't use `preload="auto"` indiscriminately for outgoing/inactive clips.
- Keep the existing visual design, interval rhythm, reduced-motion behavior, `hold` behavior during the takeover, and shared playback budget.
- If a new clip is not ready when its turn arrives, keep the poster visible until a usable video frame is available; do not flash a black frame or hide the poster too early.
- Do not aggressively remove every source on every cycle without measuring repeat-download effects.

### Acceptance criteria

1. After at least 20 seconds on Home, mounted HeroPill video count remains bounded and does not increase on every cycle.
2. Only current/outgoing clips play subject to the global budget; only the next clip is intentionally preloaded per capsule.
3. Media audit reports no progressive increase in unique video requests simply from leaving Home idle.
4. No blank flash, black frame, or poster-to-video snap appears during slide changes.
5. `hold`, reduced motion, tab visibility changes, route exit, and returning to Home all work correctly.
6. Add a Playwright regression test that waits through at least 5–6 transitions and asserts bounded video mounts/requests. Existing takeover tests alone do not cover this.

---

## 4. P0 — Reduce the remaining Home scroll jank instead of accepting the partial improvement

**Files:** `src/components/home/Opening.tsx`, `src/components/fx/HeroGlare.tsx`, `src/components/home/MethodBoard.tsx`, `src/components/home/Ladder.tsx`, `src/components/home/AiAmplifies.tsx`, `src/lib/motion/defer.ts`.

The most recent report shows the hero has improved but the full-page scroll still has an unacceptably high proportion of slow frames. Treat this as unresolved, not as a completed performance phase.

### 4.1 Profile the exact sections first

Run the same production profile for separate scroll ranges, not just one 7,000 px script:

- Top of Home through the end of the takeover.
- Ladder section.
- Work showcase.
- Marquee.
- Services/DivisionBoard.
- MethodBoard.
- Audience and AI sections.

Use Chrome DevTools Performance on a real GPU-enabled browser. Record `Long Task`, `Recalculate Style`, `Layout`, `Paint`, rasterization, frame gaps, and whether CPU script or compositing dominates. Add temporary user-timing marks around section entry/exit if needed, then remove them after the trace.

Do not infer that the page is fixed because the hero-only raster cost improved. The overall section trace remains bad.

### 4.2 Review `Opening.tsx`'s per-frame `fit()`

The takeover is now transform-based, which is good, but `fit()` still runs during the card tween. Each call reads the card's animated `scaleX/scaleY`, writes inverse scales to the media, computes the corner radius, and directly mutates `card.style.borderRadius`.

Dynamic `border-radius` changes on a large overflow-clipped video can still trigger repaint/raster work. This is not proven to be the main remaining bottleneck, so profile it instead of blindly rewriting it.

If trace evidence shows paint/raster from this path:

- Keep transform-based geometry.
- Avoid repeatedly writing the same radius when the value has not changed meaningfully.
- Compare the current radius treatment with a pre-sized clipping/mask approach that preserves rounded-to-square motion.
- Test exact alignment at start, midpoint, full screen, reverse scroll, resize, reload mid-scene, and reduced motion.
- Retain `data-dim`'s optimized opacity layer unless testing shows a better alternative.

### 4.3 Revisit desktop glare with real hardware evidence

`HeroGlare.tsx` still has a 900×1050 blurred hotspot, 1600 px and 1500 px blended shadow layers, five 1350 px beam layers, masks, and large blur filters. The animation pauses when `data-still` is set, but the static filtered/blended layers are still part of the visual/compositing stack.

The repo rejected a flat texture because it did not reproduce the multiply-blended shadow slats faithfully. Do not reintroduce that rejected flat texture without comparing fidelity.

Instead, compare:

- Current live layers with drift paused during the takeover.
- A layered/static texture that preserves both beams **and** the louver shadows at multiple viewport widths.
- A reduced-beam desktop variant that retains the signature look.

Use screenshot differences and real-GPU Performance traces. If the glare isn't a meaningful current bottleneck, leave its visual treatment alone and move to the section identified by the trace.

### 4.4 Keep nonessential motion from overlapping

The hero pauses glare drift, orbit movement and capsule cycling during the takeover. Preserve this behavior. Check whether the adjacent section initializes or animates heavily at the same time as the hero exits, which can cause a hitch precisely at the section seam.

Do not globally disable animations. Reduce work only where two effects overlap and the profile demonstrates a cost.

---

## 5. P0 — Simplify MethodBoard's character animation workload

**File:** `src/components/home/MethodBoard.tsx`  
**Status:** The workload is evident from the code; the amount it contributes to real-device lag requires profiling.

### Current issue

`flap()` creates one independent GSAP timeline for every non-space character. Each timeline loops 4–6 times through a rotate-out, text replacement callback, and rotate-in. Across the seven station names this produces roughly 50 per-character timelines and many hundreds of tween/callback steps across the full board. When a fast scroll skips multiple stations, `setState()` can reveal multiple rows in a short time, bunching the work together.

Additionally, `scramble(rows)` randomizes all row text immediately when the Home page mounts, then `setState(rows, 0)` starts the first row's flip sequence while the section is far below the fold.

The comment says initialization must happen at load to avoid a layout shift. The character spans have explicit width and height classes, so that claim should be re-tested rather than assumed. The active row's details can change the row height, however, so any deferred activation needs stable reserved geometry.

### Required fix

Preserve the split-flap idea, but reduce the amount of animation work:

- Use one small timeline per row (or one timeline for the row batch), with a restrained number of flips. Avoid a separate 4–6-cycle timeline for every character.
- Use deterministic or precomputed scramble states when possible rather than repeated random work at scroll time.
- Ensure a fast scroll that skips rows resolves every row correctly, but does not start all skipped rows' full animations at once. Skipped rows can resolve directly to their final text/state.
- Defer the expensive scramble/animation setup until the board is approaching the viewport **only after** proving that its section height and later layout stay stable. Reserve the detail-row height or use a stable first-row state so activation does not shift the whole page.
- On reload at a restored scroll position, initialize the board from the current ScrollTrigger progress, not always from station 1.
- Respect reduced motion and no-JS behavior.

### Cleanup is required

`flap()` creates timelines from `ScrollTrigger.onUpdate` callbacks. Those callbacks execute after the outer `useGSAP` setup has returned. Do not assume all such newly created timelines are automatically tracked by the original GSAP context.

Keep references to the character/row timelines or use `contextSafe`/`context.add` correctly, and explicitly kill all active flap timelines on cleanup. Killing only the tweens of each tile is not a strong guarantee that the parent timelines' `.call()` callbacks cannot keep running.

### Acceptance criteria

- The first Home load does not start the board's full flap animation while it is far below the fold.
- A normal station-to-station scroll creates a small bounded number of timelines.
- Fast scroll forward/backward results in correct final text and state.
- Navigating away mid-flip leaves no live timelines/callbacks touching old nodes.
- No layout shift is introduced; test direct anchor/back-to-top/reload-mid-board cases.

---

## 6. P1 — Review animation ownership and cleanup across async callbacks

**Why this matters:** GSAP's context tracks animations created while its callback/context is active. Animations created later by `IntersectionObserver`, `ScrollTrigger.onUpdate`, pointer events, or timers should be explicitly wrapped in `contextSafe`/`context.add`, or tracked and killed manually. Disconnecting the observer stops future notifications; it does not by itself kill animations that the callback already created.

### Review these exact paths

1. `src/components/home/MethodBoard.tsx`: `ScrollTrigger.onUpdate` → `setState` → `reveal` → `flap` creates timelines later.
2. `src/components/home/Ladder.tsx`: the `ScrollTrigger.onUpdate` calls `show()`, which creates `gsap.fromTo`, `gsap.to`, and `gsap.set` animations later. Its cleanup kills the ScrollTrigger and observer but does not explicitly kill the dynamic word/layer tweens.
3. `src/components/motion/Reveal.tsx`: `group` mode's `observeOnce` callback creates a new `gsap.to(batch, ...)` after setup. The single-element mode is safer because it plays an already-created tween.
4. `src/components/work/ScreeningMedia.tsx`: the `observeOnce` callback creates rise tweens later. The photo parallax triggers are separate and should remain if needed.
5. `src/components/home/Opening.tsx`: the mobile manifesto observer creates a new timeline inside the observer callback.
6. Any `Nav`/pointer/hover callback that creates tweens on persistent or soon-to-be-removed elements should be checked for ownership, especially if navigation occurs during the tween.

### Implementation rule

For every async callback that starts animation work, choose one of these patterns and use it consistently:

- Create the animation in the original context while paused, then only call `.play()` later; or
- Wrap the callback's animation creation with GSAP `contextSafe`/`context.add`; or
- Store animations in refs/sets and explicitly `kill()`/revert them in cleanup.

Do not mix patterns without a reason. Add tests that trigger a reveal/flip, navigate away immediately, then assert no active triggers/tweens remain for the removed route and no console errors occur.

---

## 7. P1 — Reduce Home's below-the-fold setup cost

**Files:** `src/components/home/Ladder.tsx`, `src/components/home/MethodBoard.tsx`, `src/components/home/AiAmplifies.tsx`, `src/lib/motion/defer.ts`.

The repo's report explicitly states that Home load TBT/LCP did not measurably improve. The prior pass deferred `WorkShowcase`, `Marquee`, `Finale`, and `FooterWordmark`, but the page still initializes other animated sections at mount.

### Ladder

`Ladder` uses CSS sticky with a CSS-defined height (`340svh` under motion) and a ScrollTrigger only to derive progress. It is **not** a GSAP-pinned section. It also mounts five `Reel` components in stacked layers, although only one is active at a time (during a transition, two layers can be visible).

Evaluate two optimizations:

- Defer ScrollTrigger/animation setup until the root is within roughly one viewport of the current scroll position, while preserving a correct current step for restored/deep links.
- Mount only the active and transitioning adjacent media layers instead of five full `Reel` component trees. Keep poster/layout placeholders stable so the frame does not change size.

Do not assume these automatically improve FPS: compare first-load long tasks, JS setup time, poster downloads, and scroll traces.

### MethodBoard

Defer the expensive text scramble/flip work as described in section 5, after reserving stable row geometry.

### AiAmplifies

`AiAmplifies` creates paused timelines for all pairs during page setup even though playback is deferred to `observeOnce`. Profile whether this setup contributes to Home TBT. If so, delay timeline construction until the section is near view or create each pair's timeline as it becomes relevant; keep the observer one-shot and ensure cleanup remains correct.

### Acceptance criteria

- Show a before/after Home load TBT, LCP, and total JavaScript long tasks. The current report did not claim a loading improvement.
- First paint and the hero animation remain correct.
- Direct reload/scroll restoration works when landing mid-way down Home.
- No content is hidden indefinitely if observer/setup fails.

---

## 8. P1 — Home → Selected Work still needs a navigation A/B test

**Files:** `src/components/layout/PageShell.tsx`, `src/components/layout/RouteExit.tsx`, `src/components/motion/SmoothScroll.tsx`, `src/components/layout/NavProgress.tsx`.

The report shows a significant improvement after `RouteExit` made page teardown cheaper, but the click-to-new-page-in-DOM figure is still around 1.1–1.36 seconds under the recorded 4× CPU condition. The view-transition update task still measures around 0.5–0.65 seconds.

Do not assume the route transition is now harmless solely because one teardown bottleneck was reduced.

### Required diagnostic

Measure these as separate spans:

1. Click accepted / `pointerup`.
2. Navigation begins.
3. `startViewTransition` update callback begins.
4. Old-page animation/GSAP teardown starts and ends.
5. New route DOM is committed.
6. First meaningful paint of the Work title and poster grid.
7. Route entrance finishes.

Compare interleaved production A/B runs for:

- Current 440 ms page transition.
- A short, simple fade for Home → Work.
- No whole-page ViewTransition snapshot for Home → Work, while retaining the current treatment for light inner routes if useful.

If snapshotting isn't the bottleneck, don't remove the effect just to make a change. If the new DOM is late due to old-page cleanup, fix the remaining long task and inspect async GSAP work from sections the visitor leaves mid-animation.

### `ScrollTrigger.refresh()`

`SmoothScroll.tsx` still waits about 520 ms after a route change, then waits for fonts and browser idle before calling global `ScrollTrigger.refresh()`. The report measures Home refresh at 103–191 ms under 4× CPU and inner routes at ≤34 ms. This may cause a delayed hitch on return to Home, though it doesn't alone explain a four-to-five-second initial navigation.

- Keep one owner for refresh; do not add competing route-level refresh calls.
- Test whether Home actually requires a full refresh after a route return.
- Narrow `invalidateOnRefresh` on the hero timeline only if tests confirm its geometry remains correct; the report notes roughly 70 ms at 4× CPU from reinitializing the entire manifesto SplitText timeline on Home return.
- Preserve page anchors, reload-mid-scene, resize, and browser back/forward.

### Development vs production

`DevWarmup.tsx` runs only in development and should not be used to benchmark production. Confirm the owner's symptom in both `npm run dev` and `npm run build && npm run start`. If only dev is slow, report it as a development compilation/warm-up experience; if production is also slow, investigate the spans above.

---

## 9. P1 — Make the shared video budget respond to viewport changes

**File:** `src/components/media/video-budget.ts`.

`limit()` returns two slots below 768 px and three above, but `rebalance()` only runs when videos are requested/released or visibility changes. There is no resize/breakpoint listener in the current module. If the viewport crosses from desktop to mobile while three video claims are active, the current playing set may exceed the new limit until another claim/release event occurs.

### Fix

- Listen to the `(max-width: 767px)` media query's `change` event and call `rebalance()` when the breakpoint changes (this is preferable to rebalance on every pixel of resize).
- Register the listener exactly once, matching the existing singleton model, and clean it up if the module lifecycle/design is changed.
- Add a regression test that starts three videos at desktop width, changes viewport below 768 px, and checks that no more than two are playing; reverse the resize and check that claims recover correctly.
- Keep the priority ordering and “waiting video resumes when a slot frees” semantics.

Also clarify in comments and tests that this is a playback/decoder budget, not a download budget. `preload="auto"` or a fetch started before a slot is granted can still download media.

---

## 10. P2 — Review the remaining media/compositing workload on the ladder and Home cards

### Ladder media stack

`src/components/home/Ladder.tsx` maps all five philosophy steps to five `Reel` components. Although only the active one is intended to play, all five video elements and poster structures exist. Poster images share the same on-screen box even if a layer has `opacity: 0`; lazy loading does not necessarily prevent those images from being fetched if the browser considers their boxes near the viewport.

After the higher-impact changes, test whether poster image requests/decode and five media component lifecycles contribute to startup or scroll costs. If yes, reduce the stage to current + outgoing/next layer with a static poster placeholder for inactive steps.

### HeroPill blur

HeroPill animates `filter: blur(2px)` along with translate/scale/opacity on outgoing video slides. This may create additional intermediate compositing work. A/B test opacity + transform without animated blur. Keep blur only if it makes a visible difference and has negligible measured cost.

### WorkIndex filter

The report's `/work` filter task remains around 110–129 ms and was left unchanged. This may be acceptable for the current list on desktop, but verify it with a real interaction trace on a mid-range phone. If it causes noticeable tap latency, simplify Flip's `absolute/stagger/scale` effects or use a shorter/less elaborate layout transition; don't rewrite it without measurement.

### Work detail page

`src/components/work/ScreeningMedia.tsx` creates one ScrollTrigger per photo drift frame, plus visible-media/reveal behavior. For screening pages with a lot of photos, measure trigger count and refresh cost. Keep scrubbed parallax only where it adds visible value, and consider a single shared scroll driver or static photo frames if trigger count is high.

---

## 11. Regression coverage that is currently missing or should be strengthened

Review `tests/regressions.spec.ts` and the QA scripts before adding more tests. Add focused tests for:

1. **HeroPill bounded media window:** after 20 seconds, assert the number of mounted video elements is bounded and doesn't climb each time the carousel cycles.
2. **HeroPill request budget:** collect `.mp4`/`.webm` requests while Home remains idle through multiple cycles; assert all carousel clips do not download simply because `reach` climbed.
3. **HeroPill transition readiness:** record `loadeddata`/first frame for a slide and ensure the slide doesn't transition to an indefinitely empty or black video surface.
4. **Mid-animation navigation:** start MethodBoard/Ladder/Reveal animations, navigate to another route immediately, then check for console errors, active GSAP tweens targeting disconnected nodes, and stable ScrollTrigger counts.
5. **Fast scroll through MethodBoard:** skip several rows and verify all names/statuses settle to the correct state without a large long task.
6. **Video-budget breakpoint switch:** desktop → mobile enforces two active videos; mobile → desktop can resume eligible queued claims.
7. **Return-to-Home refresh:** navigate Home → Work → Home several times, check ScrollTrigger count stays flat, scroll position/state are correct, and no post-navigation hitch worsens with each visit.
8. **Production route timing:** capture click-to-heading and click-to-first-poster timings separately from animation end.

The current suite's existing 56-pass report is a useful baseline, but passing tests don't establish that every performance symptom is solved. The missing tests above target behavior that the current assertions don't directly protect.

---

## 12. Required measurement protocol

Do all A/B measurements on production builds, with the same browser/viewport, device, CPU setting, route sequence and warm/cold cache conditions. Alternate baseline and candidate runs when the machine has variable load. Do not compare a quiet-machine before run with a busy-machine after run.

### Local commands

```bash
npm ci
npm run build
npm run start -- --port 3100
```

In another terminal:

```bash
node scripts/qa/perf.mjs --url=/ --cpu=4 --scroll=7000
node scripts/qa/perf.mjs --url=/work --cpu=4 --scroll=4000
node scripts/qa/media-audit.mjs --routes=/,/work,/capabilities --detail --json
node scripts/qa/check-shift.mjs
node scripts/qa/check-flow.mjs
npm test -- --workers=1
```

Use `PW_CHROMIUM_PATH` if Playwright needs an explicit installed Chromium path. Repeat the main Home trace on a normal (unthrottled) run and on a physical phone. Capture Chrome Performance traces around the exact moments the user reports: switching from hero to Ladder/Work showcase/MethodBoard, and Home → Work navigation.

### Minimum evidence before saying “fixed”

- Current vs candidate production numbers for the exact symptom.
- A Chrome trace showing which long task/render work decreased.
- Media request counts/bytes after Home sits idle and cycles through several slides.
- No new layout shift or visual regression in screenshots.
- Typecheck/lint/build/Playwright regression results from the final source.
- Real laptop/phone spot-check; headless software-renderer results alone are not enough.

Do not claim a precise FPS or percentage improvement from a code read alone.

---

## 13. Strict Claude Code execution prompt

Copy this prompt into Claude Code Desktop with the current repository open.

> You are auditing and fixing performance regressions in the existing SOCIALxBRAND PILOT Next.js website. Read `SocialxBrand_Pilot_PostPhase_Audit.md`, `docs/reviews/performance-fixes-2026-10-15.md`, and `HANDOVER.md` first.
>
> **Do not rewrite the website. Do not redesign the site. Do not install/upgrade/downgrade packages. Do not replace GSAP, Lenis, Next.js, or React. Do not remove signature effects globally. Do not invent results, clients, testimonials, or content. Do not change public URLs, metadata, business copy, layout, or branding unless the user approves.**
>
> Phase 0 is read-only: inspect the exact source and tests, identify which findings in the audit still reproduce, and provide a short evidence table with file/line, observed behavior, proposed fix, test, and risk. Do not edit code during Phase 0.
>
> Then implement only the approved phases, in this order: (1) fix HeroPill's monotonically increasing media window and add regression tests; (2) profile and simplify MethodBoard's character flip workload while preserving visuals/layout and explicitly cleaning up async-created GSAP timelines; (3) audit dynamic GSAP animations created inside IntersectionObserver/ScrollTrigger callbacks and make their ownership/cleanup reliable; (4) evaluate deferring Ladder/MethodBoard/AiAmplifies setup and reducing Ladder's mounted media only with layout-stability tests; (5) measure and A/B test Home → Work transition/refresh; (6) add the video-budget breakpoint listener and tests; (7) run full verification.
>
> **One phase at a time.** At the end of each phase, stop and report exactly what changed, tests run, measurements before/after, visual behaviors checked, and anything not verified. Do not continue to the next phase without approval. If the required browser/tool or measurement isn't available, say so and do not fake results. If a proposed change risks layout shift, visual changes, or regressions on mobile/reduced motion, stop and explain the risk before changing it.
>
> Use existing repo patterns and dependencies. Prefer minimal, evidence-driven diffs. Keep the existing design. Add no speculative “optimizations.” Do not mark an issue fixed merely because code changed: prove it with a regression test and comparable measurement where applicable.

---

## 14. Suggested phase plan

### Phase 0 — Read-only confirmation
- Verify each issue against current source.
- Run any available current production report/tests or state why they cannot run.
- Output a findings table and wait.

### Phase 1 — HeroPill carousel correctness and bounded media
- Fix the sliding window and preloading policy.
- Add multi-cycle Playwright regression tests.
- Measure media bytes/requests during 20–30 seconds of idle Home use.
- Stop for review.

### Phase 2 — MethodBoard performance and cleanup
- Reduce per-character timeline churn.
- Avoid running the flip workload on initial mount while far below the fold.
- Explicitly own/kill dynamic timelines.
- Add fast-scroll and mid-animation route-exit tests.
- Stop for review.

### Phase 3 — Async GSAP ownership audit
- Audit `MethodBoard`, `Ladder`, `Reveal`, `ScreeningMedia`, `Opening`, and callbacks in `Nav`.
- Use context-safe creation or stored animation handles and cleanup.
- Test trigger counts and detached targets after repeated navigation.
- Stop for review.

### Phase 4 — Reduce below-fold setup/media
- Experiment with near-viewport setup for Ladder/MethodBoard/AiAmplifies.
- Test only current and adjacent Ladder media layers if it reduces measurable work.
- Prove stable section height, restored-scroll behavior, and reduced-motion behavior.
- Stop for review.

### Phase 5 — Home → Work navigation
- Capture route timing spans.
- A/B current vs simple transition vs no whole-page transition for Home → Work.
- Narrow refresh/invalidation only if the trace proves it helps.
- Stop for review.

### Phase 6 — Video budget and remaining route-specific costs
- Add breakpoint-change rebalance/test.
- Profile Work filter and long screening pages only if they remain noticeable after the higher-priority fixes.
- Stop for review.

### Phase 7 — Final validation
- Run typecheck, lint, build and all tests.
- Run production media/performance/shift/flow QA.
- Repeat on a physical laptop/phone.
- Provide a concise changelog plus unresolved items. Do not claim “smooth” unless the measured symptom improves.

---

## 15. Final diagnosis

The previous phase made several useful fixes—especially the old Nav ScrollTrigger leak, the expensive dim-field repaint, touch preview behavior, and the Home → Work teardown stall. However, the new repository's own measurements show that the main experience is still not smooth under its stress test, and the current source still contains a HeroPill media-window bug inconsistent with the reported bounded-preload behavior.

The next work should **not** be another broad optimization sweep. First fix the HeroPill sliding-window bug and missing regression test. Then attack the Home section spikes, starting with MethodBoard's character timeline workload and async GSAP cleanup. Finally, use a production trace to decide whether the remaining route-transition and refresh work deserves a simpler transition.

No new runtime library is required. The goal is bounded media, bounded animation work, reliable cleanup, and measurements that match what the visitor actually feels.
