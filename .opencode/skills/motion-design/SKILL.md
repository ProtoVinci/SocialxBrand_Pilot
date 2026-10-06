---
name: motion-design
description: The SOCIALxBRAND PILOT motion system — scroll choreography, timing, easing, transitions, interaction hierarchy, media movement, typography motion, performance and reduced motion. Use before writing or changing ANY animation on this site.
---

# Motion design: SOCIALxBRAND PILOT

The full spec is in `docs/motion-system.md`. This skill is the working checklist.

## 0. Ask first

Before writing any animation, answer three questions: what does this motion communicate, why does it move, and what should the visitor understand or feel? If you can't answer, don't animate it.

## 1. Use only the grammar

- Import from `@/lib/gsap` and use tokens from `@/lib/motion/tokens`. Never invent durations or eases inline.
- **Entrances** use `ease: "pilot"`, durations `dur.base` (blocks) or `dur.slow` (display type).
- **Curtains, line draws and state swaps** use `ease: "glide"`.
- **Anything scrubbed** uses `ease: "none"` with `scrub: 0.6–0.8`.
- **Staggers**: chars 0.018 (hero only), words 0.04, lines 0.08, cards 0.07. Use `cappedStagger()` for lists; a group never exceeds 0.5s in total.
- **Reveals** trigger at `revealStart` ("top 82%"), `once: true`.

## 2. Hierarchy

| Level | Budget | Examples |
|---|---|---|
| Primary | one per act, memorable | opening takeover, route line, finale |
| Secondary | flow between moments | split reveals, tickers, Flip reflows, drifts |
| Micro | feedback only, ≤ 0.45s | label roll, toggle, CTA lift |

Never stack two primaries in one viewport. If everything moves, nothing reads.

## 3. Scroll choreography

- **Pin rules.** Pins are desktop-only (`MQ.cinema`). The home page already uses its pins (opening, screenings, route). Prefer CSS `sticky` plus progress-derived state for new sequences.
- **Pin lengths** are expressed in viewport heights. Each step should get about 70–110vh. Long pins drag, short ones whip.
- **Geometry** comes from layout boxes (`offsetWidth/offsetLeft`). Use function values plus `invalidateOnRefresh: true`, and never measure transformed rects.
- **Horizontal tracks** use `containerAnimation` for inner triggers; the outer tween must be `ease: "none"`.
- **Hand-offs.** End every set-piece in a state the next act can start from (for example, the dimmed reel becomes the manifesto backdrop).

## 4. Typography motion

- Use `SplitReveal`: `rise` (masked lines) for display, `blur` (words) for statements, `chars` for the hero only.
- Create animations inside SplitText's `onSplit` (autoSplit re-splits on resize and font load). Return the tween.
- One serif-italic accent word per headline, usually in signal red. It can also be what changes state (struck, filled, swapped).
- Never animate `letter-spacing` or `font-size` on long text.

## 5. Media movement

- Use `<Reel>` for video. It plays in view through VideoBudget (desktop 4, mobile 2), has `preload="none"` until visible, and shows a poster plus LQIP.
- Vary behaviour by asset: hero fan, ladder crossfade, rail scale-to-centre, hover-play tiles, photo drift. Don't give every asset the same move.
- Keep 9:16 work in 9:16 frames (crop to 4:5 only for wide grid tiles). Never letterbox reels in 16:9.

## 6. Transitions

- Page transitions use `PageShell` (`route-in` / `route-out`). Tag links with `transitionTypes={["nav-forward"|"nav-back"]}`.
- Shared elements use `<ViewTransition name=… share="morph" default="none">` on both sides. Names must be unique per page.

## 7. Performance

- Animate `transform`, `opacity`, `clip-path` and `filter` (short and small only). Never animate width, height, top or margin.
- Avoid long-running RAF loops; Lenis runs on `gsap.ticker`. Tickers pause off-screen.
- Every animation lives in `useGSAP` with `gsap.matchMedia()` and is reverted on cleanup.
- Pin `y: 0` when tweening `yPercent` on elements that may have been reverted, so a stray pixel offset can't stack on top.

## 8. Reduced motion and no JS

- Every `matchMedia` has an `MQ.reduce` branch that sets the final state.
- CSS hides `[data-reveal]` only under `html.js-motion`, with a 2.5s failsafe. Don't add new hide-until-animated CSS without a failsafe.
- Reduced motion means no pins, scrubs, tickers, smooth scroll or autoplay (posters with a Play button), and instant view transitions.

## 9. Verify in the browser

Run `node scripts/qa/shoot.mjs --url=<route> --at="0,40vh,80vh,…" --wait=1400` mid-sequence, then repeat with `--vp=390x844` and with `--reduce`. Then run the `motion-director` agent.
