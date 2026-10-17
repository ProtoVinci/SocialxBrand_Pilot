# Post-phase audit: report, 2026-10-15 (second pass)

Source brief: `docs/briefs/SocialxBrand_Pilot_PostPhase_Audit.md` (phases 0–7). The owner asked for all phases in one pass.
Baseline: commit `40c4fe1` (production build served on :3101). Candidate: the working tree (production build on :3102). Nothing is committed. No dependency was added or removed.

Method: as in `performance-fixes-2026-10-15.md`. Production builds only, headless Chromium (software renderer), 4× CPU, 1440×900 unless noted, baseline and candidate runs **interleaved**, medians. Diagnostic scripts lived in the session scratchpad, not in the repo. Real laptop/phone GPUs were **not** measured: there is no device in this environment.

## Phase 0: what still reproduced

| Audit claim | Finding |
|---|---|
| Home scroll still rough (18–19 fps, 32–40% jank) | **Not reproduced on a quiet machine.** Those figures came from the previous report's final run, recorded while the laptop was heavily loaded. On a quiet machine the baseline (`40c4fe1`) scrolls Home at 44–52 fps, 0–1.3% jank, 0–2 long tasks over 7000px (`perf.mjs`, 4× CPU). Per-section traces (hero, Ladder, showcase, marquee/board, MethodBoard, tail) all show ≤3% of frames over 50ms. One showcase run showed 22.5%; a four-variant A/B right after gave 2% for every variant (noise). |
| §3 HeroPill media window grows (`reach` only increases) | **Confirmed.** Capsule `<video>` count climbs 4 → 8 within 6s and stays at 8 (all clips mounted, `preload="auto"`). The "new current mounted late" part was not confirmed: the next clip was already warmed half a beat ahead. |
| §5 MethodBoard per-character timelines; flap at load | **Confirmed** in code (a timeline per tile, a pair of tweens and a callback per flip; row 1 flapped at load far below the fold). Measured cost: tween set-up ≈150ms of script over a 4000px board scroll. Most of the board's scroll script is ScrollTrigger's per-frame scroll read forcing layout (the row-detail `grid-template-rows` transition keeps layout dirty). |
| §6 animations created in async callbacks not owned | **Confirmed** in `MethodBoard`, `Ladder`, `Reveal` (group), `ScreeningMedia`, `Opening` (phone manifesto), plus `ApproachRoute` (phone). `SplitReveal` already did it right (`context.add`). |
| §7 below-the-fold set-up at load | **Partly confirmed.** Load CPU profile: Ladder set-up ≈206ms inclusive at 4× CPU; MethodBoard and AiAmplifies are each below the top 60 functions (small). Biggest items: React hydration/commit ≈1s, the load-time `ScrollTrigger.refresh` ≈385ms. |
| §8 Home → Work still costly | **Confirmed, attributed.** See phase 5. |
| §9 budget ignores breakpoint changes | **Confirmed** in code. |
| §10 Ladder mounts five reels; capsule blur; screening triggers; filter | Ladder: confirmed (5 posters fetched). Blur: no measurable cost. Screening triggers: at most 13 (logo-identity), which scrolls at 53 fps with 0% jank. Filter: unchanged from the last pass (110–129ms longest task). |

## What changed

| Phase | Change | Evidence |
|---|---|---|
| 1 | `HeroPill`: a **sliding media window**: per capsule only the current clip, the outgoing one during the 700ms handover, and the next one (warmed half a beat ahead, `preload="auto"`). Clips leave the window (unmounted) after their handover. | Capsule videos over 30s idle: baseline 4,6,8,8,8… (all 8 mounted); candidate 4–6 (≤3 per capsule). No repeat downloads: in 30s every clip gets a turn, so both builds fetch each clip once (1033KB); re-created clips come from the HTTP cache (media is served `immutable`). New test (fails on the baseline with 4 clips in one capsule). |
| 2 | `MethodBoard`: one **yoyo tween per tile** in **one timeline per row** (was a timeline per tile with 8–15 tweens/callbacks); deterministic letters; **only the row that becomes "Boarding" flaps**, and rows skipped by a fast scroll or a restored position land on their words directly; no flap at load; row timelines are tracked and killed on cleanup. Kept eager (not deferred): its load cost is small and deferring it caused CLS before. | Screenshots match baseline (only the scramble letters differ). Fast-scroll test: every station ends on its words and status. Board-section trace: within noise of baseline (the per-frame cost there is layout, not the flaps). |
| 3 | Animations created later by observers/scroll callbacks are now owned: `context.add` in `Reveal` (group), `ScreeningMedia`, `Opening` (phone manifesto) and `ApproachRoute` (phone), the same pattern `SplitReveal` uses; `Ladder` kills its word/layer tweens on cleanup; MethodBoard as above. A development-only `window.__gsap` hook (`src/lib/gsap.ts`, absent from production chunks) lets tests count triggers and tweens. | New test (run against `next dev`): scroll into the board, leave for /work at once, three times: 0 tweens on removed nodes, the same ScrollTrigger count on every return, no page errors. |
| 4 | `Ladder` set up through `useGSAPNear` (it is CSS-sticky with a CSS height, not pinned); the markup shows the first rung until then. Only the current rung's reel and its neighbours are mounted. | Load TBT (5 interleaved pairs): **1092 → 885ms median** (−19%; one candidate run at 1321). LCP unchanged (2608 → 2576ms, noise). Images at load **941 → 704–854KB**. CLS stable (home at 768px 0.0169 → 0.0148). Screenshots of the first and last rung match. |
| 5 | **No code change.** | See below. |
| 6 | `video-budget`: re-ranks when the viewport crosses 768px (`matchMedia` change listener, registered once); comments state that it limits playback, not downloads. | Breakpoint test 3 → ≤2 → 3 playing. It also passes on the baseline, because on that page a resize re-ranks through layout changes anyway: it guards the behaviour but does not isolate the listener. |

### Phase 5: Home → Work, measured (6 interleaved rounds, spans taken inside the page)

| Variant | click → Work grid in DOM | click → painted | longest task |
|---|---|---|---|
| baseline | 1114ms | 1275ms | 435ms |
| candidate | 1123ms | 1285ms | 453ms |
| candidate **without View Transitions** | **806ms** | **903ms** | 284ms |

The whole-page view transition costs about 300ms at 4× CPU (≈30% of click → content). Removing it from Home → Work would be a visible change to the site's signature motion, so it was **measured, not changed**: the owner decides. A test that only removed the `/work` tiles' shared-element names was inconclusive (machine load).

`ScrollTrigger.refresh()` after a return to Home is **needed**: at 1440px the Nav's `end: "max"` trigger is measured before the hero's pin spacer exists (12263 → 14333 after the refresh), and the pinned triggers are only finalised by it. One owner (`SmoothScroll`) kept.

Narrowing `invalidateOnRefresh` to the takeover card's tweens was **implemented, tested and reverted**: after a resize to 1024px and a reload mid-scene the card no longer sat on the capsule. A comment in `Opening.tsx` records this.

## Unchanged measurements (no regression)

- Full Home scroll (5 pairs): 45–52 fps, jank ≤1%, 0–2 long tasks, on both builds.
- Ladder and MethodBoard section traces: within noise of baseline.
- Media audit, home desktop: max 3 playing, both builds; phone: max 2.
- Capsule outgoing-blur A/B: draw 2967 vs 2896ms (noise), so the blur stays.

## Checks

`npx tsc --noEmit`, `npx eslint src tests`, `npm run build`: clean. Playwright against the candidate production build: **59 passed, 0 failed, 46 skipped by design**. The dev-hook leak test passed against `next dev`. `check-shift` and `check-flow`: all routes stable and reachable.

## Not done / for the owner

- **Real devices**: not measured (no physical laptop/phone here).
- **Home → Work view transition**: ~300ms at 4× CPU; dropping it for Home → Work is the one measured lever left, and it needs the owner's approval.
- MethodBoard's row-detail `grid-template-rows` transition is a layout animation; replacing it would change the board's look.
- The load-time `ScrollTrigger.refresh` (≈385ms at 4× CPU) includes the hero timeline's full re-initialisation; narrowing it failed the geometry checks (above).
