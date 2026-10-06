---
name: accessibility-performance
description: Accessibility and performance guardrails for the motion- and media-heavy SOCIALxBRAND PILOT site — semantics, focus, contrast, reduced motion, video/image budgets, GSAP hygiene and Core Web Vitals. Use when building components or before release.
---

# Accessibility + performance

## Accessibility

- **Landmarks**: one `<main id="main">` with a skip link, `<header>`/`<nav aria-label>` and `<footer>`. Every section has `aria-labelledby` pointing to its heading.
- **Headings**: one `h1` per page, in order. Bracketed labels are `<p>`, never headings.
- **Split text** uses SplitText with `aria: "auto"` (the default), which keeps a label on the parent. Slot-swapped words need an `sr-only` full sentence (see Ladder).
- **Media**: decorative reels are `aria-hidden`. Meaningful reels get a `label`. Photos get descriptive `alt` text. Never autoplay with sound (all reels are muted).
- **Interaction**: everything is reachable by keyboard. The menu closes on Escape and returns focus. Builder steps move focus to the step heading. Toggles use `aria-pressed`, tabs use `role="tab"` plus `aria-selected`, and errors are announced with `aria-live`.
- **Contrast**: paper on ink (~17:1) and fog on ink (≥7:1) are safe. Red on ink is about 5.4:1. **Red on paper is only about 3.2:1, so small text uses `signal-ink`.**
- **Motion**: honour `prefers-reduced-motion` everywhere (see the `motion-design` skill, section 8). Never put essential information in motion alone.

## Performance budgets

- **Video**: 8s loops at ≤ 1.5 MB (720p class). AV1 WebM is used only when it is ≥10% smaller than the MP4. `preload="none"` until visible. Concurrency is 4 on desktop and 2 on mobile (VideoBudget).
- **Images**: pre-processed AVIF/WebP at 480/960/1600 widths with an LQIP backdrop and correct `sizes`. Never ship originals.
- **First view**: only the hero reels load eagerly (posters). Everything else is lazy.
- **Fonts**: four families through `next/font` (variable, `display: swap`). Don't add a fifth without removing one.
- **JS**: GSAP is registered once (`lib/gsap.ts`). Keep server pages server components and push `"use client"` down to islands.
- **Runtime**: no layout-property animation, tickers paused off-screen, and Lenis on `gsap.ticker` (no second RAF loop). `ScrollTrigger.refresh()` runs after `document.fonts.ready`.
- **Cache**: `/media/*` is served `immutable`. A changed asset must get a new filename.

## Release checks

`npm run build` passes, then `npx eslint src` is clean, then Playwright frames show no overflow or errors at all six viewports, then the reduced-motion pass is complete.
