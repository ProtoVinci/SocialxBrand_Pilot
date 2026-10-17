# Deep audit (client clarity, trust, performance): report, 2026-10-17

Source brief: `SocialxBrand_Pilot5_Deep_Audit_Client_Performance.md`. Starting point: commit `6288e27`. Nothing is committed. No dependency was added.

## Owner decisions (2026-10-17)

- **Testimonials and founder details:** none supplied yet. So the feedback section is built but hidden until approved quotes exist, and `/about` is **not** created (a mostly empty page is worse than none).
- **Hero line:** the current one stays.
- **Work detail pages:** called "Work collection".
- **Service pages:** "What's included" becomes "Typical deliverables" until fixed scopes are confirmed.

## Findings and what was done

| # | Finding | Status | Evidence / change |
|---|---|---|---|
| P1 | All 8 hero capsule posters download at load | **Confirmed, fixed** | Posters now follow the video window (current, outgoing, next), served as AVIF with WebP fallback. Cold load, 1440×900: capsule posters **8 → 4 requests, 466 → 187KB**. All images at Home load **728 → 449KB** desktop, **733 → 341KB** phone. New test: ≤3 posters per capsule. |
| C3 | Work detail pages say "Project" but are collections | **Fixed** | "Work collection · {category}", "About this collection" (hidden heading), "Next collection", "View collection" on cards. No facts added or removed. |
| C6 | Mixed-format work missing from the Photography filter | **Confirmed, fixed** | Each collection now has explicit `formats` in `content/work.ts`, checked against its actual media. Portrait & Fashion and Celebrations hold photographs **and** films, so they appear under both. Counts: All 14 · Reels & films 11 · Photography 3 (was 1) · Design & identity 2. New test: counts match the tiles shown. |
| C8 | Metaphorical 404 page | **Fixed** | "Error 404 / Page not found. / The link may be out of date, or the page may have moved." with **Go to Home** and **See our work**. |
| C4 | "What's included" reads like a fixed package | **Fixed (wording)** | Now "Typical deliverables", followed by "Examples of what this service can produce. The exact deliverables depend on the brief we agree with you." Real scopes, exclusions and pricing are owner input. |
| C1 | No client feedback | **Built, hidden** | `content/feedback.ts` (typed, empty) and a `ClientFeedback` section placed after Selected work. It renders **nothing** until an entry is `approved` and has an `approvedAt` date. Only public fields reach the browser (server component). It's static cards: no carousel, no ratings. A content test enforces source and sign-off. The word "testimonial" stays banned in `src` (that guard was not relaxed). |
| C2/C9 | No founder/About page | **Not built (needs owner facts)** | Navigation and footer are unchanged until `/about` exists. |
| A11Y-1 | Menu is `aria-modal` but Tab can leave it | **Confirmed, fixed** | While open, Tab and Shift+Tab loop through the Close button and the menu's own links. Escape closes it and returns focus to the button. New test: 9 Tabs and 9 Shift+Tabs never leave. |
| A11Y-2 | Reduced-motion capsules | **Verified** | New test: under reduced motion both capsules hold slide 1 with its poster and no `<video>`. |
| P2 | `NoExitTransition` monkey-patch | **Hardened, verified (Chromium only)** | It now restores the exact previous own-property descriptor instead of deleting unconditionally. Tested with native View Transitions **and** with the API removed: Home → Work, Home → Services, browser back, via the open menu; no console errors, and no override left after leaving Home. Firefox/WebKit are **not installed** here and were not tested. |
| P1 | `ScrollTrigger.refresh()` after navigation | **Measured: keep** | ≤18ms at 4× CPU on every route (Home 2ms, was 103–191ms before the pinned scenes were removed). Once per navigation; no change needed. |
| P1 | Large work-collection pages mount all their media | **Measured: no change** | `/work/logo-identity` (14 images): 0 video requests at load, refresh 5ms; earlier scroll runs gave 53 fps, 0% jank. No virtualisation needed. |
| P1 | Shared JS on every route | **Not changed** | JS per route 234–239KB, unchanged. A bundle split was not justified by a measured problem. |
| C7 | Work photo alt text is positional | **Owner input** | Accurate descriptions need someone who knows each photo; not invented. |
| C11 | Contact is a hand-off, not a submission | **Unchanged (by design)** | The page already says so. A server form needs privacy/retention decisions first. |
| C12 | Footer "Visit" links to the same site; no social links | **Owner input** | Needs verified profile URLs. |

## Performance measurements (production builds, 4× CPU, interleaved baseline :3101 vs candidate :3102)

- **Bytes (deterministic):** Home images at load **733 → 453KB** desktop, **733 → 341KB** phone. Video requests and playback identical (max 3 playing desktop, 9 requests during a full Home scroll on both).
- **Timings: inconclusive.** Background load on this laptop swung TBT 2–4× between paired runs, even on pages this pass did not touch (one service page: 2917 vs 677ms). A cleaner five-pair Home run gave TBT medians 642 vs 714ms and LCP 2496 vs 3376ms, with FCP alone ranging 216–2836ms. The LCP element on Home is the **headline text** on both builds, not a capsule poster, so the poster change does not affect LCP. **No timing improvement or regression is claimed.**
- Real phones and laptops were not measured.

## Checks

- `npx tsc --noEmit`, `npx eslint src tests` and `npm run build` are clean.
- **Playwright, production build, 1 worker:** **68 passed, 0 failed, 55 skipped by design.** That includes 9 new tests: poster window, reduced-motion capsules, menu focus loop, format filters, collection/404 labels, no-feedback-placeholder, and leaving Home with View Transitions native and absent. The content audit also gained a feedback-approval guard.
- `check-flow`: all routes ok. `check-shift`: CLS 0.0000 on `/`, `/work`, `/work/portrait-fashion` and a service page at 1440, 768 and 390.

## Files changed

- `src/components/home/HeroPill.tsx` (poster window, AVIF)
- `src/content/work.ts` (`formats` tags)
- `src/components/work/WorkIndex.tsx`, `src/app/work/page.tsx` (filters, labels)
- `src/app/work/[slug]/page.tsx`, `src/components/sections/SelectedWork.tsx` (collection labels)
- `src/app/not-found.tsx`
- `src/app/capabilities/[slug]/page.tsx` (Typical deliverables)
- `src/content/feedback.ts`, `src/components/sections/ClientFeedback.tsx` (new), `src/app/page.tsx` (mounts it)
- `src/components/layout/Nav.tsx` (focus loop)
- `src/components/layout/NoExitTransition.tsx` (descriptor restore)
- `tests/regressions.spec.ts`, `tests/content-audit.spec.ts`

## Owner input needed (nothing below was invented)

1. **Client feedback:** exact quotes, who said them, role/business (with permission), which service or collection, the source, and written permission to publish. Add to `src/content/feedback.ts` with `approved: true` and `approvedAt`.
2. **Founders / About:** names, roles, approved portraits, a founder-approved bio, why SxBP was started, the vision for clients, verifiable experience, who handles what, and public profiles. `/about` plus the nav/footer link get built from these.
3. **Work collections:** which are single client projects vs category collections; for each, SxBP's role vs Vishay Creations', client attribution permission, deliverables, period, objective, and any measured, approved results.
4. **Services:** which of the 18 are sold today, typical scope, inclusions and exclusions, revision/approval rules, reporting cadence, paid-media budget handling, and the pricing approach (or a starting range if public).
5. **Alt text** for the 52 work photographs: short accurate descriptions (no inferred identities).
6. **Footer:** official social profile URLs; whether to replace "Visit" with something more useful.
7. **Lead capture:** whether a server-backed form is wanted (needs a privacy notice and retention decision).
8. **Browsers:** a check of Home → Work in Safari and Firefox on real devices (not available here).
