# Performance fixes: report, 2026-10-15

Source brief: `docs/briefs/archive/SocialxBrand_Performance_Fixes_README.md` (issues 1–12, phases 0–7). The owner asked for all phases in one pass.
Starting point: commit `a92616c` plus the owner's uncommitted logo, font and footer work, which was left untouched. Nothing is committed by this work.
No dependency was added or removed.

## How it was measured (read before trusting any number)

- **Production builds only.** The baseline build was copied aside and served on :3101; the working build was served on :3102. Every comparison **alternates** baseline and new runs (interleaved A/B) and reports medians. This laptop's background load swings totals by up to 2× from one minute to the next, so sequential before/after numbers are not comparable.
- Headless Chromium from Playwright, 4× CPU throttle, 1440×900 unless noted. Headless uses a **software renderer**: `draw`/`raster` are CPU stand-ins for GPU work, and real-GPU frame rates were not measured.
- Metrics: trace-event totals (ms) for a scripted wheel scroll (`Layout`, `UpdateLayoutTree`, `Paint`, `RasterTask`, `DirectRenderer::DrawFrame`, script), frame gaps sampled with rAF, Long Tasks, CPU profiles for attribution, `scripts/qa/perf.mjs`, `scripts/qa/media-audit.mjs` and `scripts/qa/check-shift.mjs`.
- The diagnostic scripts (trace A/B driver, navigation trace, profiler) lived in the session scratchpad and are **not** in the repo.

## Results (baseline → final, interleaved medians)

| Scenario | Metric | Baseline | Final |
|---|---|---|---|
| Home hero scroll, 3000px, desktop (6 rounds) | raster | 3645 | **1111** (−70%) |
| | draw (compositor) | 5890 | **3730** (−37%) |
| | style recalc | 954 | 534 |
| | frames slower than 50ms | 52.9% | **31.2%** |
| Home sections 3000–7000px, desktop (4 rounds) | draw / script | 4137 / 4799 | 3720 / 3736 |
| | frames slower than 50ms | 84.4% | 58.2% |
| Home hero, phone 390×844 touch (4 rounds) | all | — | no change (expected: phones have no pinned scene) |
| `perf.mjs /` scroll 7000px (3 pairs) | long tasks during scroll | 89–97 | **49–58** |
| | fps / jank | 15.3–16.1 / 48–55% | 18.0–19.4 / 32–40% |
| `perf.mjs /work` scroll (3 pairs) | fps / jank / long tasks | 34–47 / 1.9–12.9% / 1–13 | 47–53 / 1.4–1.8% / 1–2 |
| `perf.mjs /` load | TBT, LCP | noisy, overlapping ranges | no change claimed |
| Home → Work: the view-transition update task (teardown + new page) | run A (6 rounds) | 1457ms | **646ms** |
| | run B (8 rounds, quieter machine) | 662ms | **496ms** |
| | run C (6 rounds, heavily loaded machine) | inconclusive (baseline task did not register) | |
| Home → Work: click → new page in the DOM | run A / run B | 2151 / 1302ms | **1357 / 1091ms** |
| Media, desktop `/` | most videos playing at once | 4 | **3** (the budget) |
| Media, phone `/` | most videos playing at once / KB | 3 / 1703 | **2** / 1444 |
| Media, desktop `/work`, wheel scroll with a resting cursor | clip requests / KB | 5 / 8544 | **0 / 0** |
| ScrollTriggers after 9 navigations | count | 13 (10 leaked) | **4** (stable) |
| CLS, home at 768×1024 | check-shift | flagged unstable (takeover card a source) | 0.0149, stable |
| `/work` filter | longest task | 119–122ms | 110–129ms (no change, none needed) |

Attribution for the navigation stall (CPU profile of the click, 4× CPU): ScrollTrigger kills reading the scroll position after each revert (forced layout of the whole outgoing home page) 422ms → 76ms; MethodBoard's per-character reset ~240ms → 0.

## Issue matrix

| # | Issue | Status | What changed / evidence |
|---|---|---|---|
| 1 | Takeover animates layout properties | **FIXED** | `Opening.tsx`: the window is laid out full size and only transformed (translate + scale + rotate); the reel inside gets the inverse of the uneven part of the scale, so it is never stretched; the corner radius is set in unscaled units. Geometry is measured once per refresh. Same composition at every checked scroll point (screenshots side by side); card rect equals baseline ±1px at rest, mid-scene, full screen, after reverse scroll, after resize 1440→1024, and after reload mid-scene. Layout itself was a small share; the real hero cost was the next item. |
| 1b | (found while profiling) The scene's textured `[data-dim]` field repainted on every frame | **FIXED** | Its opacity is scrubbed; the full-screen multi-gradient field was re-rasterised every frame (~70% of hero raster). `will-change: opacity` on it: raster 3289 → 977ms in isolation, no visual change. |
| 2 | Hero glare compositing | **FIXED (variant C)** | A/B: no glare −29% draw; pre-rendered texture (B) −34% draw; static glare (C) −15–27%. **B rejected**: the live louver shadows multiply-blend with the grid beneath, which a flat texture cannot reproduce (measured mean diff 3–7/255, beams visibly stronger lower right). Adopted: the drift and the tools orbit pause (`data-still`, `animation-play-state`) once the scene starts or the hero has scrolled away; at rest at the top they run as before. |
| 3 | Pinned sequence does too much | **PARTLY** | Ambient work during the scene now stops (glare drift, orbit, capsule cycling, capsule videos). The 230% pin length and the per-character manifesto were **kept**: pacing is a design decision, and no shorter length was asked for. |
| 4 | HeroPill bypasses the budget | **FIXED** | Capsule clips play through `video-budget` (current clip outranks the outgoing one); cycling stops on `hold` (scene live), offscreen, or in a hidden tab. Preloading stays deliberate and bounded: the current clip and the next one only; a clip that has played stays parked because its turn returns within seconds. |
| 5 | WorkShowcase bypasses the budget | **FIXED** | Previews are `preload="none"` and play through the budget (priority 5), released on hover end or unmount. Touch: one observer picks **one** tile (the first mostly on screen), where every 70%-visible tile used to play. Loop copies are never observed and never preview. |
| 6 | Overlapping continuous motion | **FIXED where evidenced** | Inventory: Marquee (GSAP ticker only while on screen, one reusable settle call), WorkShowcase loops (paused offscreen), Ladder (tweens only on a step change, IO-gated video) and DivisionBoard (tour only in view) were already correct. Changed: hero ambient pause (above), DivisionBoard tour skips hidden tabs. Offscreen SpinBadge and glare showed **no measurable idle cost** (idle trace A/B), so they were not touched. |
| 7 | Route transitions | **KEPT (measured)** | The stall was inside the transition's update callback (teardown), not the transition itself; see #12. The snapshot capture is a small share, so the transition design was not changed. |
| 8 | Delayed global `ScrollTrigger.refresh()` | **KEPT (measured), leak fixed** | Measured with temporary marks (removed): inner routes ≤34ms at 4× CPU, home 103–191ms. One owner (`SmoothScroll`), once per navigation, after the transition and fonts, at idle. It got slower with every page visited because of the Nav leak (#12); that is fixed. |
| 9 | Dev route warmup | **ADJUSTED (dev only)** | Confirmed absent from production chunks. It now warms only when the visitor has been idle for 1.5s and the tab is visible (verified: idle → starts ~3s; while scrolling → none until ~1.3s after the last input). Dev navigation was not benchmarked with the production metric (React's dev build does not produce the same view-transition task). |
| 10 | Work index | **FIXED (media), KEPT (filter)** | `Reel mode="hover"` woke on `pointerenter`, which fires when tiles slide under a resting cursor and when a finger starts a scroll: 8.5MB of previews fetched by scrolling `/work`. It now wakes on a real mouse movement; touch shows posters. The filter (Flip) costs the same on both builds, so it was left alone. |
| 11 | One media policy | **FIXED** | `video-budget.ts`: a waiting video resumes when a slot frees (it stayed paused before), claims on detached elements are dropped, nothing plays in a hidden tab, `play()` rejections are swallowed (poster stays), plus a `useBudgetedVideo` hook. Every `<video>` now goes through it (Reel, hero capsules, showcase previews). |
| 12 | Lifecycle and navigation regressions | **FIXED (2 real bugs)** | (a) `Nav` created its scroll trigger in `useGSAP(..., { dependencies: [pathname] })` without `revertOnUpdate`, so its `st.kill()` never ran: one more trigger and one more scroll handler per page visited. Now `revertOnUpdate: true`; counts stay flat. (b) Leaving a page reverted its GSAP contexts against a fully laid-out page: new `RouteExit` (first child of `PageShell`) hides the outgoing page before its effects are torn down (it has already been captured for the transition). MethodBoard's reset now touches only tiles caught mid-flip. |

## Files changed

- `src/components/home/Opening.tsx`: transform takeover, `data-still` + capsule `hold`, `onRefresh` sync.
- `src/app/globals.css`: `[data-still]` pauses glare drift and orbit.
- `src/components/media/video-budget.ts`: rebalance on release, detached-element cleanup, hidden-tab pause, `useBudgetedVideo`.
- `src/components/media/Reel.tsx`: hover previews wake on real mouse movement, not on touch.
- `src/components/home/HeroPill.tsx`: budgeted playback, `hold`, hidden-tab skip.
- `src/components/home/WorkShowcase.tsx`: budgeted `preload="none"` previews, one touch preview, inert loop copies.
- `src/components/home/MethodBoard.tsx`: cheap teardown.
- `src/components/layout/RouteExit.tsx` (new), `src/components/layout/PageShell.tsx`: hide the outgoing page before teardown.
- `src/components/layout/Nav.tsx`: `revertOnUpdate` (trigger leak).
- `src/components/capabilities/DivisionBoard.tsx`: tour skips hidden tabs.
- `src/components/layout/DevWarmup.tsx`: idle-only warmup (development only).
- `tests/regressions.spec.ts`: four guards (`perf #1`, `perf #4/#5`, `perf #10`, `perf #7/#12`).

(`Nav.tsx` also carries the owner's uncommitted logo change; only the `revertOnUpdate` line is from this work.)

## Checks

`npx tsc --noEmit`, `npx eslint src tests` and `npm run build` are clean. The full Playwright suite against the production build (`PORT=3102`): **56 passed, 0 failed, 37 skipped by design**. Twice, right after the spec file was edited while the owner's `next dev` was watching the folder, the first two home loads timed out in a 2-worker run; that could not be reproduced afterwards (two more parallel runs, plus 3×3 concurrent loads against both builds).

## Not done / limits

- Real-GPU behaviour (laptop and phone) was not measured; headless uses a software renderer.
- The pin length (230%) and the per-character manifesto are unchanged (design decisions).
- The glare texture variant (B) was rejected on fidelity; a texture that included the grid would have to be baked per viewport size.
- `invalidateOnRefresh` on the hero timeline re-initialises every manifesto character on each refresh (~70ms at 4× CPU on a return to home). Narrowing it to the card tweens is possible but was judged not worth the resize risk.
- Home load TBT/LCP did not measurably change (noisy, overlapping ranges).
