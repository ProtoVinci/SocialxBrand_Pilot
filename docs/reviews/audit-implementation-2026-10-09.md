# Audit implementation report — 2026-10-09

Source plan: `docs/briefs/SocialxBrand_Complete_Audit_and_Claude_Code_Plan.md` (37 technical items, 12 client-perspective items, phases 0–6).
Starting point: commit `9a5cbbb` (baseline measured on it). Nothing is committed by this work; `git diff` shows all of it.
No dependency was added or removed (`package.json` / lockfile untouched).

## How things were measured (read before trusting any number)

- **Production build** (`npm run build`, `next start -p 3101`), headless Chromium from Playwright on a Windows laptop that was also running the owner's own Chrome. Headless Chromium draws with a **software renderer**, so GPU behaviour on real phones and laptops is *not* measured here.
- Load and scroll: `scripts/qa/perf.mjs`, 4× CPU throttle, 3 runs per route, medians. Frame rate on this machine swings ±10 fps run to run (one session showed two clusters, ~3300ms and ~1600ms, for the same scripted scroll), so differences smaller than that are **not** claimed.
- Compositor work (draw and raster time from trace events for an identical scripted scroll, alternating A/B runs) was the steadier signal and is used where a frame-rate comparison would be noise.
- Media: `scripts/qa/media-audit.mjs` (new): mounted/playing `<video>` elements and video requests per route, desktop and touch.

## Results

### Load and scroll, 4× CPU, medians of 3 (baseline → final)

| Route | Load blocking time (ms) | Scroll fps | Jank % | Media at load (KB) |
|---|---|---|---|---|
| `/` | 2060 → 1158 | 23.5 → 21.2 (noise; ranges 12.9–25.2 → 19.2–22.6) | 20.7 → 27.9 (noise) | 2686 → 408 |
| `/work` | 370 → 294 | 47.4 → 52.5 | 2.9 → 1.1 | 0 → 0 |
| `/work/restaurant-hospitality` | 306 → 246 | 51.2 → 55.1 | 1.8 → 0.7 | 1932 → 1932 |
| `/capabilities` | 316 → 253 | 52.0 → 57.5 | 1.1 → 0 | 0 → 0 |
| `/capabilities/performance-marketing` | 320 → 270 | 53.5 → 55.8 | 0.4 → 0.7 | 0 → 0 |
| `/approach` | 446 → 353 | 29.2 → 32.4 | 17.3 → 12.0 | 0 → 0 |
| `/route` | 375 → 284 | 58.1 → 59.6 | 0 → 0 | 0 → 0 |

**Home scrolling did not measurably improve.** The first 3000px (hero + takeover scene) dominate its cost (about 3.0s draw and 2.9s raster for the first 1500px, against 0.2–0.5s raster for later sections). The hero glare accounts for roughly 40% of that draw time on desktop (hidden-vs-shown test), but it is the signature effect, so it was left unchanged (see "Not done").

### Media (desktop 1440×900 unless noted; baseline → final)

| Route | `<video>` elements at load | max mounted | Video KB moved during a full scroll |
|---|---|---|---|
| `/` | 33 → 11 | 36 → 13 | 10486 → 10207 (the ladder and takeover play as you scroll through them) |
| `/work` | 16 → 11 | 16 → 11 | 8544 → 8544 (hover previews) |
| `/work/restaurant-hospitality` | 12 → 7 | 12 → 7 | 9097 → 8203 |
| `/capabilities` | 17 → 0 | 17 → 0 | 0 → 0 |
| other inner routes | 5 → 0 | 5 → 0 | 0 → 0 |
| `/` on a phone (390×844, touch) | n/a → 12 | n/a → 14 | (measured after the first fixes) 3529 → **1703** with the phone-size clips |
| `/work/restaurant-hospitality` on a phone | n/a | n/a | 10172 → **4218** |

Hero takeover reel: requested and playing at load (2.5MB) → not requested until the scroll scene starts (test #2).
Playing at once: unchanged by design on desktop (hero capsules 2 pills × current/outgoing, plus budgeted reels).

### Bundle (client JS, gzipped)

Shared by every route: 244KB → 234KB. Per-route totals (shared + own): `/` 277 → 278, `/work` 256 → 246, `/work/[slug]` 246 → 236, `/capabilities` 257 → 247, `/capabilities/[slug]` 247 → 237, `/approach` 262 → 263, `/route` 261 → 250. (`/` and `/approach` are flat because Turbopack merges their route chunks; the saving is real on the other five.)

### Layout shift (`scripts/qa/check-shift.mjs`)

All 21 route × viewport pairs stable except home at 768px (CLS ≈ 0.032), which is **pre-existing** (0.033 on the previous commit): the hero takeover card animates `left/top/width/height` with the scroll. Deferring the Method board's setup made `/` and `/approach` worse at 768px (0.049 / 0.036), so that one section was taken back out of the deferral (now 0.032 / 0.014, equal to or better than before).

## The 37 technical items

Status words: FIXED (verified), ALREADY FIXED (before this work), NOT REPRODUCED, KEPT (measured, no change warranted), BLOCKED (needs something not available), NOT DONE (reason given).

| # | Item | Status | Evidence / what changed |
|---|---|---|---|
| 1 | HeroPill preload and concurrent slides | ALREADY FIXED + kept | Clips are created once, the next is warmed after each handover, the outgoing one is parked (earlier session). Remaining by design: `preload="auto"` on the capsule clips and they bypass the shared video budget (≤4 playing: 2 capsules × current + outgoing for 750ms). Poster first. At load only the first clip of each capsule downloads (82–132KB). |
| 2 | Takeover reel starts before needed | FIXED | `Reel mode="manual"`, played from the pinned scene's `onUpdate` a few px past its start, paused at the end and on leaving the cinema layout. 2.5MB no longer fetched at load. Test #2. |
| 3 | `gsap.to` inside `ScrollTrigger.onUpdate` | FIXED | `WorkShowcase`: one paused tween restarted per update; the same pattern in `Marquee` (a `delayedCall` per update) now reuses one call. |
| 4 | Blur on WorkShowcase cards | FIXED (measured) | The backdrop is the pipeline's 16×28 placeholder stretched over the tile instead of the full poster under a 40px blur filter. Raster work for a 2400px scroll through that section: 1182ms → 863ms median (ranges do not overlap); draw unchanged. Visually near-identical, slightly softer saturation. |
| 5 | Touch pointers triggering hover | FIXED | `pointerType !== "touch"` in `WorkShowcase`, `DivisionBoard`, `DivisionIndex`, `DivisionTicker`, `PointerFx`. Test #5 (fails on the old code). |
| 6 | DivisionIndex creates too many Reels | FIXED | A `PreviewStage` with its own state mounts the shown reel + the previous one (was up to 18); 360p clip (176px wide). Test #6. |
| 7 | DivisionBoard keeps inactive stage videos | FIXED | Active + previous layer only (was 18), new `layer-in` keyframe for the entering layer; 360p clip below 1024px. Test #7. |
| 8 | Cursor-follow delay | FIXED | `quickTo` 0.6s → 0.22s (capabilities preview, cursor dot). |
| 9 | DivisionTicker listener cleanup | FIXED | `AbortController`; touch ignored. Test #9 (fails on the old code: 4× the listeners after 3 reduced-motion toggles). |
| 10 | One-shot reveals as ScrollTriggers | FIXED | `ScreeningMedia` rises and `AiAmplifies` pairs use `observeOnce`. Two tests (end states fully visible, desktop and reduced motion). |
| 11 | Refresh lifecycle | ALREADY FIXED | One call site (`SmoothScroll`), after the page transition + fonts + idle, once per route change. Settle delay 700 → 520ms to match the shorter transition. |
| 12 | RouteBuilder: Lenis + native smooth | FIXED | Uses `useLenis().scrollTo` when Lenis runs, native smooth only when it does not. Two tests (Lenis: page moves, no native smooth call; touch: native kept). |
| 13 | Lenis global | KEPT | Already off for touch and reduced motion; no measurable cost shown. |
| 14 | HeroGlare cost | FIXED on phones only | Phones: hotspot blur 80→32px, overlay sheen dropped, drift stopped: compositor draw for the hero scroll 408 → 284ms median (390×844), visually identical in side-by-side screenshots. **Desktop unchanged.** GPU cost not measurable here. |
| 15 | Global CSS transitions too broad | FIXED | Global: colour/border/text-decoration only; the press `scale` only on buttons and `.magnetic`. |
| 16 | Unused GSAP plugin | NOT REPRODUCED | `DrawSVG` is used (Finale's underline), `Flip` (Audiences, WorkIndex). They were moved out of the shared bundle instead (`lib/gsap-flip.ts`, `lib/gsap-drawsvg.ts`). |
| 17 | GSAP in the shared bundle via Nav | KEPT | Measured: GSAP core + ScrollTrigger + SplitText + CustomEase + Lenis ≈ 65KB gz of 234KB; every route uses ScrollTrigger/SplitText anyway, so rewriting Nav in CSS would save nothing. |
| 18 | PointerFx per-event work | FIXED | One `requestAnimationFrame` per frame, target lookups only when the target changes, magnet geometry measured once per entry (re-measured after scroll/resize), `quickTo` per magnet cached, one `AbortController`. |
| 19 | DevWarmup contaminating measurements | NOT REPRODUCED | Dev-only; the fetch code is in **0** production chunks. |
| 20 | Route transitions long | FIXED | Longest sequence 670ms → 440ms (page 180/320 out, 240+70/440 in, menu wipe 440). Reduced motion removes it as before. |
| 21 | Preserve the media pipeline | KEPT | Pipeline untouched; no media regenerated. |
| 22 | Video resolution tiers | PARTIAL / BLOCKED | The existing 360p preview clip is now used where the display is ≤176px or phone-sized (cursor preview, phone stage, next-screening thumbnail, ladder and work-detail grid below md): phone home video 3529 → 1703KB, phone work-detail 10172 → 4218KB. A mid tier for larger tiles needs `ffmpeg` and the raw sources, neither in the repo or on this machine. |
| 23 | Do not preload because nearby | FIXED + guarded | Found and fixed a real bug: calling `video.load()` on a `preload="none"` video **fetches the whole file** in Chromium (measured). The earlier AV1 switch called it on mount, so on any hardware-AV1 device every reel on a page downloaded immediately. `Reel` now selects its clip through the `src` attribute (no fetch until `play()`). Tests #2 and #23 (simulates a hardware-AV1 device). |
| 24 | Unloading distant videos | NOT DONE | No memory evidence; unloading would cause repeat downloads on scroll-back. |
| 25 | Defer below-the-fold setup | PARTIAL | `useGSAPNear` for Marquee, WorkShowcase, Finale, FooterWordmark (non-pinned; the hero pin is created first). An isolated A/B showed startup blocking 1784 → 1171ms median; the final comparison against the previous commit shows 901 → 840ms, within noise. The Method board is excluded: deferring it caused layout shift. Possible one-frame flash if a page is jumped to those sections instantly. |
| 26 | CSS for simple animations | NO CHANGE | Policy: GSAP stays for pinned/scrubbed/Flip/SplitText; simple hovers were CSS already. |
| 27 | Measure bundle composition | DONE | See Bundle above. `next experimental-analyze` is interactive; chunk contents were read from the production output instead. |
| 28–34 | No new runtime packages, no replacement of GSAP/Lenis/image pipeline, no Three.js, no blanket memoization | KEPT | No dependency changes; no memoization added. |
| 35 | Production baseline and comparison | DONE | Tables above; baseline commit `9a5cbbb`. |
| 36 | Routes × viewports × input modes × reduced motion | DONE | Playwright projects desktop/mobile/reduced; touch emulation for the video and contact tests; `check-flow`, `check-shift`. |
| 37 | Verified changelog, stop after phase | DONE | This file; the owner approved all phases in one go, so the phases were run in sequence with the checks of each. |

Extra, not in the plan's list: `PrincipleStack` cards were dimmed with opacity (cards ghosting through each other, fixed earlier with an overlay); `.grid-paper` promoted to its own layer: raster work on `/approach` for a 7000px scroll **16.7s → 7.8s** median (the largest single measured gain); promoting the textured colour sections was tried and rejected (raster −23%, draw +20%).

## The 12 client-perspective items

What changed uses only text already on the site (`src/content/*`); nothing was invented.

| # | Item | Status |
|---|---|---|
| 1 | Concrete value proposition | DONE (limited): hero lede is now the site description's own sentence ("Strategy, creativity, technology and execution across 18 marketing divisions, built around what your business actually needs." — `heroLede` in `site.ts`); CTAs "Build your marketing brief" and "See selected work". The headline and "We will show, you will grow" are unchanged. |
| 2 | Portfolio relevance | PARTIAL: every work page keeps the partner credit and states "categories, not invented case studies". **Needs owner input:** what SxBP did versus the production partner on each piece, and which pieces are the business work to lead with. |
| 3 | Case studies | NOT DONE, needs owner evidence (goals, deliverables, permitted outcomes). Nothing fabricated. |
| 4 | Core offers | ALREADY THERE: four clusters from the company profile; `/capabilities` already has the "not sure where to start" path to the route builder. |
| 5 | Deliverables and exclusions | PARTIAL: every division page already lists "Key deliverables" from the source documents. **Needs owner input:** exclusions, quantities, revisions, reporting cadence. |
| 6 | Real engagement process | ALREADY THERE at the level the documents support (the 7-station method). **Needs owner input** for timelines, meeting frequency, client responsibilities. |
| 7 | People and trust evidence | NOT DONE, needs owner input (team, testimonials with permission). |
| 8 | Contact identity | PARTIAL: contact links verified (tel, mailto, wa.me; tests). The brief no longer signs itself "sxbp.com" (it names the host it was built on), and the email in the status message comes from `site.ts`. **Needs owner input:** verified social URLs, a domain-branded mailbox, a privacy statement. |
| 9 | Enquiry conversion | DONE within the approved architecture: WhatsApp / mailto / copy kept; phones get a direct "WhatsApp · Call · Email" row above the builder; the Pilot Route is explained in plain words; the details step states that the site neither stores nor sends the details; the adapters have tests (mailto, copy) for the first time. No backend added. |
| 10 | Wording and hierarchy | DONE (labels): "Capabilities" → "Services", "Work" → "Selected work" in nav, footer, crumbs, page labels, titles and links. URLs, slugs and structure unchanged. |
| 11 | Mobile performance and reliability | See the technical results (phone clips, hero glare, touch handling, video playback on phones fixed earlier). |
| 12 | Discovery and measurement | NOT DONE, needs owner decisions (analytics vendor and privacy approach, industry pages with real experience). |

## Not done, and why

- Hero glare on desktop and the takeover card's layout-property animation: the visible signature; changing them needs design sign-off (a baked bitmap of the glare would cut draw time ~40% but must be generated per layout width). Recommend profiling on a real laptop and phone first.
- Mid-resolution video tier (item 22): needs ffmpeg and the raw media.
- Items needing owner evidence (client items 2, 3, 5, 6, 7, 8, 12 as listed above).
- Open reviewer items already recorded in `HANDOVER.md` (footer tap targets, AI struck-line contrast, hero→ladder seam) were not part of this plan and were not touched.

## Checks run (final)

`npx next typegen`, `npx tsc --noEmit`, `npx eslint src tests`, `npm run build` (43 pages), `npm test --workers=1`: **51 passed, 0 failed, 30 skipped by design** (was 33 passed, 6 skipped), production smoke over all 37 sitemap URLs (200, title, canonical, og:image, h1), `/opengraph-image.jpg` (200, JPEG), `/robots.txt`, 404 page, `/contact` → `/route`, `scripts/qa/check-flow.mjs` (all pages offer a way on and a way home; the home → work → screening → home journey), `scripts/qa/check-shift.mjs` run in full on the final build (all 21 route × viewport pairs stable except `/` at 768px, 0.032, which the previous commit also had).
Known flake: Playwright run with more than one worker intermittently times out on `networkidle` for a random page on this loaded machine; the same tests pass singly and with `--workers=1`. It also occurred before these changes.
