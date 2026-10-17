# SOCIALxBRAND PILOT — Full client, performance, and repository audit
**Audit snapshot:** `SocialxBrand_Pilot(6).zip`  
**Date:** 17 October 2026  
**Scope:** Source-code and repository snapshot review. No source files were changed by this audit.

## Executive summary

The site has a much clearer client-facing structure than earlier versions: the home page is shorter, navigation uses familiar labels, the service catalogue is grouped into four categories, work collections are named more honestly, and an About page now exists. The project also has a substantial QA setup and explicit performance documentation.

However, I would not call the website “fully client-ready and high-performance” yet. There are two important issues to address first:

1. **A likely source of the Home hero → Selected Work hitch is overlapping video activity.** The two hero capsules cycle quickly (1.4 s and 1.7 s), each can keep current/outgoing/next video elements mounted, and Selected Work begins asking the shared video budget to play card reels as they enter view. The shared budget limits concurrent playback, but it is explicitly a playback/decoder budget, not a network-download budget. The hero uses `preload="auto"` for mounted clips, so a video can still fetch while it is waiting for a playback slot. This is a credible, source-supported cause of a brief hitch as the first work cards appear; it needs a browser trace to confirm its exact contribution.
2. **Client feedback is marked publishable before the exact wording is confirmed by each client.** `src/content/feedback.ts` says the quotes were drafted by the agency on the clients’ behalf and “wording to be confirmed by the client”, but each item currently has `approved: true` and `approvedAt: "2026-10-17"`. This conflicts with the file’s own rule that quotes must be exact and approved. Do not display these as client quotes until each client has reviewed and approved the exact wording and attribution.

Other important items: the repository snapshot contains Drive inventory/resource-key data that should not be in a public repository; the ZIP is large because it includes 136.5 MB of public media and several development/reference directories; the contact route is intentionally a handoff to WhatsApp/email rather than a form submission; the full-site performance timings remain inconclusive in the latest report; and real-device testing has not been completed.

**Evidence levels used below**
- **Confirmed in source:** directly visible in the current files.
- **Likely / needs trace:** plausible from code and the symptoms, but requires browser profiling to confirm.
- **Owner input:** requires factual details or a decision from the agency.
- **Repository hygiene:** snapshot contents and organization, not necessarily a runtime bug.

---

# Phase 1 — Fix the Home hero → Selected Work transition

## P0.1 — Overlapping hero capsule and work-card video activity
**Status:** Likely performance issue; source pattern confirmed.  
**Files:** `src/components/home/Opening.tsx`, `src/components/home/HeroPill.tsx`, `src/components/sections/SelectedWork.tsx`, `src/components/sections/CardReel.tsx`, `src/components/media/Reel.tsx`, `src/components/media/video-budget.ts`.

### What happens
- The top capsule advances every 1,400 ms and the lower capsule every 1,700 ms.
- A transition lasts 750 ms, and the current and outgoing videos can both request playback.
- The next clip is deliberately mounted/warmed ahead of time and uses `preload="auto"`.
- Selected Work contains four featured cards; each video card uses `Reel` and requests playback once its intersection ratio passes 0.35.
- The shared budget allows up to three videos to play on desktop and two on smaller screens.
- The budget file explicitly documents that it limits playback/decoders, **not downloads**. A video that uses `preload="auto"` may still download while waiting for a slot.

As the bottom of the hero and the top of Selected Work share the viewport, the capsules can still be visible while work cards become eligible to play. The browser can be asked to fetch/decode video while the page is also revealing the card grid and loading posters.

### Fix
1. Make the capsule activity state respond to the hero’s useful visibility, not merely whether any part of each small capsule intersects the viewport. Stop cycling early enough that the outgoing hero media has settled before the work-card media begins.
2. Keep the capsule transition visually smooth, but reduce unnecessary simultaneous video work. Test a slightly slower interval or pause cycling while the visitor is scrolling through the hero/work boundary.
3. Change the next hero clip’s preparation strategy. Prefer poster-first and `preload="none"` or a bounded, explicitly measured preload. Do not assume the playback budget prevents network requests.
4. Give the first work-card videos a clear activation policy. Options to compare:
   - posters only until the card is clearly in view and scrolling has settled;
   - one featured card plays automatically while the remaining cards stay on posters;
   - preserve the current budgeted behavior if a trace proves it is not the cause.
5. When a video is no longer eligible, release its budget claim and pause it. Only unload its source if testing shows memory pressure justifies the trade-off; unloading can force re-downloads.
6. Avoid adding new timers to coordinate this if a state/visibility rule can express the behavior. Clean up every observer and timer.

### Acceptance criteria
- Hero headline, CTAs and section layout do not move or flash.
- The hero → work transition does not produce a long task or a noticeable frame drop on the test machine.
- At the boundary, no more than the intended number of videos are actively playing; video network requests are measured separately.
- The page still looks correct when the user scrolls quickly, reverses direction, opens the page with reduced motion, or switches tabs.
- Add a regression test for maximum mounted hero clips and a browser test that records video requests during the boundary.

## P0.2 — Do not confuse a playback cap with a download cap
**File:** `src/components/media/video-budget.ts`

The global budget is useful, but it is not a network budget. It pauses lower-ranked videos; it does not cancel their source requests or stop `preload="auto"` fetches already underway.

**Fix:** keep a separate policy for media loading:
- poster/image first;
- no automatic video preload by default;
- load/play only when the component is genuinely near/inside the viewport;
- only prewarm one next clip when the trace shows it prevents a visible stall;
- never preload every video in a grid or carousel;
- count requests/bytes in Playwright or DevTools, not just `video.paused`.

Do not add a media library. The current custom media system is adequate if each component follows the same policy.

## P1.3 — Hero capsule carousel cadence may be too aggressive
**File:** `src/components/home/Opening.tsx`

The capsules use intervals of 1.4 and 1.7 seconds with a 750 ms transition. That means a significant fraction of the time is spent transitioning, and the two capsules can overlap their transition work.

**Fix:** compare a slower cadence (for example 2.4–3.0 seconds) and/or pause capsule cycling during active scroll. This is a test candidate, not a universal rule. Compare visual feel and frame-time traces before choosing.

## P1.4 — First Selected Work cards may create a burst of intersection work
**Files:** `src/components/sections/SelectedWork.tsx`, `src/components/sections/CardReel.tsx`, `src/components/media/Reel.tsx`

Four featured cards are mounted, and their video elements begin requesting a playback slot as they cross the visibility threshold. The shared budget caps playback but still tracks waiting entries.

**Fix:** use a clear near-viewport policy and ensure card posters are available immediately. Test whether a one-at-a-time activation or a short scroll-settle gate reduces the hitch without making the cards feel unresponsive. Avoid arbitrary delays if measurements do not support them.

## P1.5 — `HeroGlare` should be profiled, not assumed fixed
**File:** `src/components/fx/HeroGlare.tsx`

The hero still uses large blurred, masked and blended layers. The hero root toggles `data-still` when it is out of view, which is good, but the effect may still be costly while visible on lower-end GPUs.

**Fix:** record a trace during the hero and section boundary. If raster/draw/composite time is high, compare current glare with a pre-rendered static texture plus one subtle moving layer. Keep the current effect if it is not a measurable bottleneck. Do not remove the brand treatment without screenshot comparison.

---

# Phase 2 — Make sure performance measurements are meaningful

## P1.6 — Latest timings are inconclusive
**Evidence:** `docs/reviews/deep-audit-2026-10-17.md`.

The latest report shows reduced image bytes, but its timing runs varied widely between paired tests. It explicitly makes no claim of a timing improvement or regression. It also says real phones and laptop GPUs were not measured.

**Fix:**
1. Use a production build, not `next dev`, for performance conclusions.
2. Run 5–10 paired tests with identical viewport, browser, CPU throttling, cache condition and interaction sequence.
3. Measure Home initial load, hero → Selected Work scroll, full Home scroll, Home → Work navigation, Work filter, one work collection, one service page, About and Contact.
4. Record median and range for LCP, INP/interaction latency where measurable, total blocking time, long tasks, dropped frames, CLS, image bytes, video bytes, and number of videos playing.
5. Run at least one physical mid-range phone and one ordinary laptop. A 4× CPU simulation is helpful but cannot reproduce all GPU, thermal and media-decoder behavior.
6. Capture a Chrome Performance trace at the exact scroll boundary. Look for long JavaScript tasks, style/layout, raster, paint, compositing, media decode and garbage collection.
7. Separate cold-cache and warm-cache tests. Do not compare a cold baseline against a warm candidate.

## P1.7 — Keep the production/dev distinction clear
**File:** `src/components/layout/DevWarmup.tsx`

The warmup component is development-only and deliberately requests routes to compile them while the visitor is idle. It can make `next dev` behave differently from production.

**Fix:** retain it only if it improves developer workflow. When profiling, use `npm run build` followed by `npm run start`. Do not optimize production code based on a development-only route compilation delay.

## P1.8 — Avoid speculative bundle splitting
**File:** `src/app/layout.tsx`

The root layout imports the shared navigation, global effects, scroll system and media metadata. The existing report measured similar route JS size and did not find evidence to justify a broad split.

**Fix:** do not split GSAP or rewrite the shared layout without a bundle trace showing a concrete benefit. First address media activity and the exact scrolling hitch.

---

# Phase 3 — Client trust and conversion

## P0.9 — Client feedback must not be published before exact wording approval
**File:** `src/content/feedback.ts`  
**Related:** `src/components/sections/ClientFeedback.tsx`, `src/components/sections/FeedbackCarousel.tsx`, `docs/reviews/deep-audit-2026-10-17.md`.

### Confirmed contradiction
The file’s header says feedback is quoted exactly as the client gave it and must not be edited without approval. Later, it says the quotes were written by the agency on the clients’ behalf and that wording is still to be confirmed. Yet the entries are currently marked `approved: true` and dated, which makes them publishable.

Permission to draft feedback on a client's behalf is not the same as confirmation that the exact words and attribution accurately represent what the client wants to say.

### Fix
- Until each person reviews and approves their exact quote, set `approved: false` and remove the publishable approval date, or keep the draft in a separate non-public draft source.
- Only set `approved: true` after the named client confirms the exact wording, attribution and use of their business name/logo in a recorded form.
- Keep the current server-side allowlist and public-field mapping. Never send `sourceRef`, internal notes or approval metadata to the browser.
- Keep star ratings and quantified results absent unless the client supplied them and the agency can substantiate them.
- Add a test that prevents entries marked “wording to be confirmed” from being publishable.

This is a high-priority trust issue. Do not use plausible but unconfirmed quotes to fill the section.

## P1.10 — Make the feedback carousel client-controlled
**File:** `src/components/sections/FeedbackCarousel.tsx`

The carousel automatically advances, although it has a pause control and reduced-motion handling. Auto-advancing testimonials can make it difficult to read, especially on phones.

**Fix:** prefer a static responsive row/grid when there are a small number of testimonials. If the owner wants a carousel, preserve the pause/play control, keyboard support, reduced-motion behavior, offscreen pause, clear button labels and focus stability. Never auto-advance while focus is inside the carousel. Verify screen-reader output and mobile touch scrolling.

## P1.11 — Portfolio items should clearly distinguish collections from individual client projects
**Files:** `src/content/work.ts`, `src/app/work/page.tsx`, `src/app/work/[slug]/page.tsx`, `src/components/sections/SelectedWork.tsx`.

The current “Work collection” wording is a good correction where a route contains a category/selection of media rather than one documented engagement.

**Fix:**
- Keep “collection” where the page is a collection.
- For each actual client project, add context only after the owner confirms client attribution and publication permission.
- State SxBP’s role and partner role accurately; do not imply SxBP did all production if a partner contributed.
- Add objective, deliverables, timeline or outcome only when the owner has verified them.
- Keep “Selected work” as the broad index label and give each card a descriptive title and format/category.
- Fix alt text from positional descriptions only with owner knowledge of the actual image; do not infer identities or details.

## P1.12 — Service pages need a clear buying decision path
**Files:** `src/content/divisions.ts`, `src/content/service-groups.ts`, `src/app/capabilities/page.tsx`, `src/app/capabilities/[slug]/page.tsx`.

The four-group service presentation is easier to understand than an unexplained list of 18 internal divisions. Keep the existing service URLs.

**Fix:**
- Put the client-friendly group label and plain-language description first.
- On every service page, answer: who it is for, what problem it helps with, typical deliverables, what the client needs to provide, how work is approved, how success is reviewed, and how to enquire.
- Keep “Typical deliverables” rather than implying a fixed package when scopes are not fixed.
- Do not invent prices, deliverable quantities, turnaround times, revision counts, ad spend inclusions or guaranteed outcomes. Add them only after the owner confirms the actual commercial terms.
- Avoid repeating the full service catalogue at the top of every detail page.

## P1.13 — Contact is transparent but not a true website submission
**Files:** `src/app/route/page.tsx`, `src/components/route/RouteBuilder.tsx`.

The page says that the visitor sends the brief through their own WhatsApp/email or copies it. This is honest, but it means the website itself does not receive a lead submission.

**Fix:** keep direct WhatsApp, phone and email easy to use. If the owner wants a website form, decide first where submissions go, who can access them, how long they are retained, what privacy notice is needed and how success/failure will be shown. Do not silently claim a form has been sent when it only opens another application.

## P1.14 — About page is present; verify founder facts and imagery
**Files:** `src/app/about/page.tsx`, `src/content/founders.ts`, `public/founders/*`, `docs/source/founders/*`.

The page includes the two founders, roles, bios, focus areas and portraits. The source comments say the text was condensed from owner-provided information and avoids unverified credentials.

**Fix/check:**
- Get each founder’s approval of name spelling, title, bio, focus areas and portrait.
- Ensure the portrait files are approved for public use and accurately described in alt text.
- Do not add years of experience, clients, awards, past employers or performance claims without evidence.
- Add official social profile links only after URLs are confirmed.
- Keep the page concise and useful: who does what, why the agency exists, and what a client can expect from working with the founders.

## P2.15 — Footer and social proof need verified links
**Files:** `src/components/layout/Footer.tsx`, `src/content/site.ts`.

The previous review notes that the footer’s “Visit” link points back to the same site and that social links are missing. This remains an owner-input item.

**Fix:** replace the redundant link with a useful destination, or remove it. Add only official, active social profiles supplied by the owner. Check email and phone links on mobile and make sure contact details match the actual business identity.

## P2.16 — The hero message should explain the service plainly
**Files:** `src/components/home/Opening.tsx`, `src/content/site.ts`.

The current brand line is intentionally retained. It is memorable, but the supporting copy must make the agency’s offer understandable without requiring a call.

**Fix:** keep the brand headline, then state in plain language what the agency actually helps businesses do and link to Work and Services. Do not add extra homepage sections just to explain the agency; use the existing pages.

---

# Phase 4 — Accessibility and behavior checks

## P1.17 — Verify carousel behavior and keyboard access
**Files:** `src/components/sections/FeedbackCarousel.tsx`, `src/components/layout/Nav.tsx`, `src/components/work/WorkIndex.tsx`.

The menu focus loop was previously fixed and tested in Chromium. Continue to test:
- Tab/Shift+Tab remains within an open modal menu.
- Escape closes the menu and restores focus.
- The filter buttons expose `aria-pressed` and remain keyboard-operable.
- Feedback carousel controls have clear accessible names and do not move focus unexpectedly.
- Motion respects `prefers-reduced-motion`.
- No content is hidden behind animation when JavaScript fails.
- Visible focus indicators remain present.
- Color contrast and text sizes work on small screens.

## P1.18 — Cross-browser transition code needs Firefox and WebKit coverage
**File:** `src/components/layout/NoExitTransition.tsx`.

The previous review explicitly says the monkey-patch/transition workaround was verified in Chromium only. It temporarily overrides `document.startViewTransition` while Home is mounted, then restores the prior property descriptor on cleanup.

**Fix:** keep the change narrowly scoped. Test Home → Work, Home → Services, browser back/forward and navigation through the menu in Chromium, Firefox and WebKit/Safari. Confirm the original property descriptor is restored and there are no console errors. If cross-browser behavior is brittle, prefer a documented, explicit route-transition mechanism rather than broad global overrides. Do not change this without reproducing a failure.

## P2.19 — Confirm image and media fallback behavior
**Files:** `src/components/media/Photo.tsx`, `src/components/media/Reel.tsx`, `src/components/home/HeroPill.tsx`.

Test AVIF/WebP fallback, failed video loads, slow network, reduced motion, hidden tabs, autoplay rejection and returning to a tab. A failed video must leave a useful poster rather than a blank card.

---

# Phase 5 — Repository and asset hygiene

## P0.20 — Review and remove Drive resource-key/inventory data from a public repo
**Files:**
- `docs/source/drive-contact-keys.json`
- `docs/source/drive-inventory.json`
- `docs/source/download-plan.json`

These files contain hundreds of records with Drive identifiers and key fields. Treat those keys as potentially access-bearing until the owner confirms their purpose.

**Fix:**
1. Determine whether the repository is public or private and whether these keys can grant access to source assets.
2. If the repo is public or the keys are not needed for builds, remove these files from the committed source and store any required inventory privately.
3. If a key may grant access and has been exposed, revoke or rotate the relevant sharing/resource access where applicable.
4. Removing a file in a new commit does not erase it from Git history. If secrets/access-bearing values were exposed, follow the hosting provider’s history-removal process and check forks/caches as appropriate.
5. Keep only non-sensitive asset IDs or a sanitized inventory if the scripts genuinely require it.
6. Do not print the actual key values into logs, reports or commit messages.

The ZIP does not include `.git`, so this audit cannot establish whether those values exist in prior commits or forks.

## P1.21 — Reduce unnecessary repository weight
**Snapshot facts:**
- ZIP: about 149 MB.
- Public assets: 522 files, about 136.5 MB.
- Public video encodes: 86 MP4 files (~74 MB) and 40 WebM files (~38.8 MB).
- Public image variants: 198 WebP (~14 MB) and 198 AVIF (~9.3 MB).
- `docs/source` is about 5.6 MB.
- `docs/assets/readme` is about 5.4 MB; `docs/assets/readme/work.webp` alone is about 2.6 MB.
- `.claude` is about 5.8 MB across 162 files; `.opencode` is also present.

These files do not all download on every website visit. The public media total affects repository clone/deploy/storage size; only requested assets affect page network traffic.

**Fix:**
- Keep production-required assets in `public/`.
- Keep originals required to regenerate media only if the team needs them; consider private object storage or Git LFS for large originals.
- Keep one generated output per format/resolution only when the site actually uses it.
- Recompress the README screenshot assets (especially `work.webp`) to a reasonable size; they are documentation, not hero-quality production media.
- Move old audit reports and generated reference documents to a clearly named archive or external project notes if they are no longer actively used.
- Keep `.claude` and `.opencode` if the team actively uses their skills/agents; otherwise remove unused tooling deliberately. Do not delete them simply because they are not runtime code.
- Do not commit `node_modules`, `.next`, test results, screenshots, logs, `.env` files or local build artifacts. The current ZIP scan found no `node_modules`, `.next`, `.DS_Store`, `Thumbs.db`, coverage, or Playwright report directories.
- Do not remove generated media or source files until a reference audit confirms they are unused or safely reproducible.

## P2.22 — Organize documentation so the canonical instructions are obvious
**Files:** `README.md`, `HANDOVER.md`, `docs/briefs/*`, `docs/reviews/*`.

There are several generations of audit/plan documents. They are useful history but can make it unclear which plan is current.

**Fix:** keep:
- `README.md`: setup, scripts, architecture and contributor instructions;
- `HANDOVER.md`: current state and next actions;
- `docs/reviews/`: dated evidence reports;
- `docs/briefs/archive/`: superseded plans, if they are retained.

Add a one-line status at the top of older briefs: “Historical reference; use [current doc] for current decisions.” Avoid copying old findings into the current task as if they were still open.

## P2.23 — Git snapshot limitation
The ZIP does not include a `.git` directory. This means I can audit the current snapshot, but cannot inspect commits, branches, untracked files, actual GitHub visibility, commit history or whether the Drive keys were previously exposed. Run `git status`, `git ls-files` and a secret scan in the real working repository before pushing.

---

# Phase 6 — Full performance verification matrix

Run against a production build. Use the existing scripts documented in `README.md`/`HANDOVER.md` where available.

```bash
npm ci
npx tsc --noEmit
npx eslint src tests
npm run build
npm run start -- --port 3100
```

Then run existing checks, adapting their URL/port options to the script help:
```bash
node scripts/qa/check-flow.mjs
node scripts/qa/check-shift.mjs
node scripts/qa/media-audit.mjs --detail
node scripts/qa/perf.mjs --url=/ --cpu=4 --scroll=7000
npm test -- --workers=1
```

If the script commands have changed, inspect `package.json` and each script’s help/source first. Do not claim these commands passed unless they were actually run.

### Required test journeys

| Journey | What to inspect |
|---|---|
| First cold Home load | headline/CTA visible, no layout shift, image bytes, long tasks |
| Home hero → Selected Work | frame drops, video requests, simultaneous playbacks, posters |
| Full Home scroll | frame-time distribution, observer/animation setup, jank |
| Home → Work | click-to-usable time, transition, network and main-thread trace |
| Work filters | correct counts, keyboard support, no layout freeze |
| Work collection detail | no eager video downloads, media fallback, accurate labels |
| Service index and service detail | plain-language clarity, navigation, content consistency |
| About | portraits load at appropriate sizes, factual copy, links |
| Feedback | only exact, approved quotes render; no empty placeholder |
| Contact | correct WhatsApp/phone/email links; no false “submitted” claim |
| Mobile viewport | touch scrolling, no accidental hover video, tap targets, no overflow |
| Reduced motion | no automatic capsule/feedback movement; content remains usable |
| Browser back/forward | correct scroll, menu and transition state, no console errors |

### Performance targets (guidelines, not claimed results)
- Aim for smooth frame pacing near 60 FPS on a typical modern laptop, with no repeated long tasks during the Home → Work boundary.
- Aim for Core Web Vitals in the “good” range at the 75th percentile when real-user data becomes available: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Keep video downloads limited to media that is genuinely visible or intentionally prewarmed.
- Prefer a stable, responsive poster-first experience over autoplaying every card.
- Compare median and variance across repeated runs, not one lucky result.

---

# Recommended execution order

## Phase A — Safety and trust
1. Set unconfirmed client feedback to unpublished.
2. Audit Drive keys/inventory files and repository visibility.
3. Confirm founder bios/photos and client-logo permissions.

## Phase B — Reproduce the scroll hitch
1. Production build.
2. Record Home hero → Selected Work trace.
3. Count network video requests and active decoders separately.
4. Apply one change at a time: pause capsule cycling earlier, limit prewarming, then adjust work-card activation only if the trace supports it.
5. Compare 5 paired runs and preserve screenshots.

## Phase C — Whole-site performance
1. Full Home scroll.
2. Work index and filters.
3. Work detail.
4. Service index/detail.
5. About and Contact.
6. Mobile and reduced-motion passes.

## Phase D — Repo hygiene
1. Sanitize/remove Drive key files.
2. Audit all public media references before removing any assets.
3. Compress documentation images.
4. Archive superseded briefs.
5. Keep only developer tools the team actually uses.

## Phase E — Client clarity
1. Confirm each service’s real scope and exclusions.
2. Publish only client-approved feedback.
3. Keep the work collection/project distinction accurate.
4. Add verified official social links if supplied.
5. Recheck every CTA and client journey on mobile.

## Negative prompt for Claude Code

> Do not redesign the entire website. Do not install new runtime libraries. Do not remove GSAP, Lenis or existing media infrastructure without measured evidence. Do not invent client quotes, founder credentials, services, pricing, deliverables, performance results or client attribution. Do not mark drafted feedback as approved. Do not delete media until a source-reference audit proves it is unused. Do not remove `.claude` or `.opencode` tools unless asked. Do not edit unrelated routes. Do not claim tests, performance gains or browser checks passed unless they were actually run. Work in one phase at a time, report exact files changed, show evidence, and stop for approval after each phase.

## Final verdict

The site’s information architecture is moving in the right direction, and the codebase has useful performance infrastructure. The immediate Home-to-video-section hitch is most plausibly connected to overlapping capsule/card media work, but that must be confirmed with a production trace rather than guessed at. The clearest non-performance issue is that drafted feedback is currently marked approved before exact client wording is confirmed. The clearest repository risk is the presence of Drive inventory/resource-key data in the source snapshot.

Fix those trust and safety issues first, then reproduce the scroll hitch under controlled production conditions and optimize only what the trace identifies.
