# SOCIALxBRAND PILOT — Complete Website Improvement Plan

**Purpose:** A controlled, evidence-led implementation brief for Claude Code Desktop to improve website smoothness, reliability, client trust, clarity, and enquiry conversion without random redesigns or invented facts.

**Project:** SOCIALxBRAND PILOT (SxBP)  
**Website repo:** `SocialxBrand_Pilot-main`  
**Prepared for:** Implementation inside the existing repository  
**Execution rule:** Work phase by phase. Do not silently skip ahead.

---


## Important repository constraints

The repository's `HANDOVER.md` describes binding project decisions. At the start of every new session, read it completely, then read any applicable `AGENTS.md`, `CLAUDE.md`, and project instructions. Also inspect `docs/design-brief.md`, `docs/motion-system.md`, and relevant content/source documents before changing design or copy.

The existing project brief says:

- The site is for an Indian digital marketing agency, SOCIALxBRAND PILOT (SxBP).
- Motion and visual quality are core parts of the identity. Do not flatten the design or remove its distinctive motion simply to make implementation easier.
- Preserve the approved light theme, warm canvas, textured surfaces, logo-derived red/cobalt palette, typography and current design-system rules unless the owner explicitly approves a change.
- Never invent clients, performance metrics, ROI, testimonials, awards, follower counts, years in business, team members, certifications, partnerships, prices or a city/location. The content audit exists to guard against unsupported claims.
- Use real, approved work only. Preserve the production-partner credit where required. Do not letterbox portrait 9:16 reels.
- Reduced-motion and no-JavaScript states must keep meaningful content available.
- The current contact decision uses the route builder's WhatsApp, email (`mailto`) and copy adapters. Do **not** add a backend/API/CRM submission path unless the owner explicitly approves it.
- `HANDOVER.md` currently records completed work and open tasks. Treat it and current source code as primary evidence; don't undo completed fixes because an older audit mentions them.

If this file's recommendation conflicts with a binding repo instruction, stop, explain the conflict and follow the binding instruction unless the owner decides otherwise.

---

# MASTER INSTRUCTION FOR CLAUDE CODE

> You are modifying an existing production-intended Next.js website, not starting a new project. Read this plan in full, then read `HANDOVER.md`, all applicable `AGENTS.md`/`CLAUDE.md` instructions, `docs/design-brief.md`, `docs/motion-system.md`, `package.json`, relevant source files, and current tests before editing.
>
> Before changes, inspect Git status and preserve any user modifications. Do not revert, overwrite, format or clean up unrelated user work. Do not push, commit, change branches, delete files or alter project configuration unless explicitly approved.
>
> For every confirmed issue, make the smallest targeted fix, explain why it solves the demonstrated issue, and add or update a regression test when practical. Preserve existing behavior, content, design tokens, accessibility, keyboard support, reduced-motion support, Next.js/React conventions, and the media pipeline. Do not replace GSAP or Lenis or add a competing animation/scroll library.
>
> **No hallucination rule:** do not invent business facts, claims, client names, project results, testimonials, prices, staff, certifications, awards, locations, partnerships or service commitments. New website copy must be traceable to approved `src/content/*`, `docs/source/*`, the current website, or explicit owner approval. Where evidence is missing, leave a clearly identified TODO in the report—not fake published content.
>
> **No random-work rule:** do not add new sections, pages, features, dependencies, design systems, packages, analytics vendors, API routes, CMSs, forms that submit to an unconfigured destination, or content not requested by the active phase. Before installing any package, state the measurable need, alternatives using existing dependencies/browser APIs, package size/runtime implications, and ask for approval. Do not install anything merely because it is popular.
>
> Work through this sequence: (1) inspect and report; (2) implement only the approved phase; (3) run relevant type, lint, build, test and browser/QA checks that are available; (4) report exact commands and outcomes; (5) list changed files and any remaining risks; (6) stop and wait for explicit approval before the next phase. If a check cannot run, explain why and do not claim it passed.
>
> Do not fix unrelated warnings opportunistically. Do not silence lint, TypeScript, accessibility or test failures just to achieve a green run. Do not weaken or delete tests to make a change pass. Do not use arbitrary timeouts as a substitute for a reproducible loading/state fix. Do not assert performance improved without before/after measurements under comparable conditions.

---

# NEGATIVE PROMPT — WHAT CLAUDE MUST NOT DO

Use this as a strict negative prompt. It is intentionally explicit.

- **Do not redesign the website from scratch.** No new visual direction, no template replacement, no generic SaaS look, no flattening of the textured red/blue creative identity, and no removing motion-led storytelling wholesale.
- **Do not improvise new requirements.** Do not add sections such as pricing, FAQ, team, newsletter, blog, client logos, testimonials, live chat, chatbot, quiz, API form or CRM unless the active phase requires it and the owner has approved it.
- **Do not fabricate credibility.** Never make up brands, customer names, metrics, campaign results, budgets, ROI, testimonials, awards, client logos, follower counts, staff names, offices, prices, response-time promises or service guarantees.
- **Do not invent missing work.** Don't generate fake case studies, substitute stock imagery for client work, relabel unrelated media as proof for a service, or imply that SxBP performed work actually done by a partner.
- **Do not install another motion or scroll library.** No Framer Motion, Motion One, React Spring, Locomotive Scroll, Barba, Three.js or equivalent as a performance “fix.” Existing GSAP and Lenis are sufficient unless a measured, specific limitation proves otherwise and the owner approves a replacement.
- **Do not add packages by default.** Do not install a lazy-loading plugin, image optimization library, UI kit, state-management framework or analytics package without a documented requirement and approval.
- **Do not replace working custom media logic wholesale.** Inspect the video budget, media helpers and existing responsive AVIF/WebP/media pipeline first. Improve how many elements load and play concurrently before replacing components.
- **Do not broadly memoize everything.** `React.memo`, `useMemo` and `useCallback` are not blanket performance fixes. Profile first and target demonstrated re-render costs.
- **Do not use preload=`auto` on large offscreen video elements without measured justification.** Do not preload hidden/visibility-gated clips simply because they are nearby in the DOM.
- **Do not start invisible takeover videos early.** Video activation must reflect actual intent/visibility, not just an element's layout box if it is visually hidden.
- **Do not create GSAP tweens on every scroll update.** Reuse a tween or quick setter, or use a measured and appropriate alternative.
- **Do not add nested or competing smooth-scroll behaviors.** Lenis should own programmatic animated scrolling where it is active; avoid layering native `behavior: "smooth"` on top of it.
- **Do not call `ScrollTrigger.refresh()` repeatedly or globally without need.** Avoid refresh loops, unnecessary route-wide measuring, and new triggers for effects that only need to reveal once.
- **Do not remove keyboard, focus, touch, reduced-motion or no-JS behavior.** Do not make hover the only way to access important content. Touch interactions must not accidentally trigger mouse-only effects.
- **Do not create accessibility regressions.** Do not remove labels, semantic headings, useful alt text, visible focus, contrast, screen-reader status or inert/aria-hidden safeguards.
- **Do not change all copy to generic marketing jargon.** Preserve the brand voice, but make client-facing labels understandable. Every claim must be supported.
- **Do not alter route URLs, slugs, metadata, canonicals, structured data or navigation behavior without an explicit need and regression tests.** Preserve deep links and all 14 work slugs/18 capability slugs unless the repo has changed and verification shows otherwise.
- **Do not change the documented contact architecture without permission.** Improve the user journey but retain WhatsApp, `mailto` and copy adapters unless an API/CRM adapter is approved.
- **Do not rewrite or delete `HANDOVER.md` to make the status look better.** Update it only after real work is complete and consistent with its format.
- **Do not report “fixed,” “faster,” “accessible,” “no bugs,” or “all tests pass” unless the corresponding change/check was actually completed and evidence is available.**
- **Do not continue to the next phase automatically.** Stop after the current phase and wait for the owner's explicit go-ahead.

---

# PHASE PLAN

## Phase 0 — Repository discovery and baseline only (no code edits)

**Goal:** Establish what is actually present and measure the current state before changing anything.

### Required actions

1. Read `HANDOVER.md` fully and inspect applicable `AGENTS.md`, `CLAUDE.md`, and `.claude/` instructions.
2. Read `package.json`, lockfile, `docs/design-brief.md`, `docs/motion-system.md`, `docs/site-architecture.md`, content maps and current QA/test configuration.
3. Inspect Git status and identify existing uncommitted changes. Do not overwrite them.
4. Map the key files for the current site: home hero/showcase, global layout/nav/footer, media `Reel` and `Photo`, video budget, `SmoothScroll`, `PointerFx`, route builder, capability pages, work pages, CSS and tests.
5. Establish a clean baseline where tools are available: `npx next typegen`, `npx tsc --noEmit`, `npx eslint src`, `npm test`, and `npm run build`. Follow the repo's exact environment notes; do not install or download browsers if project instructions prohibit it.
6. Use the project's own QA scripts documented in `HANDOVER.md` where possible. Measure production mode, not only `next dev`. Capture screenshots at representative desktop/mobile sizes and test reduced motion.
7. Record route load behavior, console errors, failed requests, video count/requests, layout shifts, long tasks, main-thread blocking, scroll FPS/jank and route transition behavior. Capture a repeatable baseline for `/`, `/work`, one `/work/[slug]`, `/capabilities`, one `/capabilities/[slug]`, `/approach` and `/route`.
8. Audit the 37 items below and mark each `CONFIRMED`, `NOT REPRODUCED`, `ALREADY FIXED` or `NEEDS MEASUREMENT` with file/line evidence.
9. Audit all 12 client-perspective areas below. Separate factual gaps requiring owner/source evidence from changes that can safely be implemented using current approved content.

### Phase 0 deliverable

Return a short report with: baseline commands/results; measured current metrics; exact confirmed issues; already-fixed/non-reproduced items; proposed files to change by phase; risks or owner decisions needed. **Do not edit files during Phase 0. Stop and wait.**

---

## Phase 1 — Fix high-confidence runtime bugs and scroll-time work

**Goal:** Remove repeat work or event-handling bugs that occur during normal interaction, without changing the visual direction.

Start with the items below if confirmed:

- #3 Work showcase tween creation during scroll updates.
- #5 Mouse-only handling for touch/pointer interactions.
- #8 Cursor smoothing duration and response.
- #9 DivisionTicker event-listener cleanup.
- #10 One-shot effects that unnecessarily use ScrollTrigger.
- #11 Refresh lifecycle and duplicate/unnecessary refresh calls.
- #12 Lenis/native smooth-scroll conflict in RouteBuilder.
- #18 PointerFx frame scheduling and geometry reads.

### Acceptance criteria

- No new GSAP tween is created on every high-frequency `ScrollTrigger.onUpdate` call.
- All manually registered listeners have matching cleanup, including on breakpoint changes/unmount.
- Touch, pen and mouse behavior is deliberate and tested separately.
- No visible cursor/scroll regressions, no stuck pinned scenes, and no stale ScrollTriggers after navigation.
- Reduced motion works and no-JS/reduced-motion content remains visible.
- `npx tsc --noEmit`, `npx eslint src`, relevant Playwright tests and production build pass, or pre-existing failures are documented without masking them.

Stop after this phase. Report what changed and wait.

---

## Phase 2 — Control media mounting, fetching and playback

**Goal:** Reduce simultaneous video element, network, decoder and memory work while keeping the creative effect.

Relevant items: #1, #2, #6, #7, #21, #22, #23 and #24.

### Acceptance criteria

- Offscreen/inactive videos do not start playback or eagerly download without an evidenced reason.
- Hero's active/outgoing/prewarmed video count is understood and bounded. Any intentional exception to the shared video budget is documented and measured.
- The takeover reel begins loading/playing at the correct visual transition, not merely because it is geometrically inside an observer root.
- Capability index/stage pages do not maintain 18 fully active reel instances if only one or two are required; use one/two reusable layers if that preserves the transition and is simpler/safer.
- Poster-first loading continues to work. Portrait work is not letterboxed or cropped incorrectly.
- Video sources are only unloaded when useful and tested; don't introduce repeated downloads or flashing when revisiting sections.
- Mobile and reduced-motion behavior remain correct.

Stop after this phase. Report before/after media requests, number of mounted/playing videos on each relevant route and any quality trade-offs. Wait.

---

## Phase 3 — Reduce expensive visual compositing and defer below-the-fold motion

**Goal:** Preserve the signature visual direction while reducing the cost of effects that cover large screen areas or execute unnecessarily early.

Relevant items: #4, #13, #14, #15, #20, #25 and #26.

### Acceptance criteria

- Heavy blur/mix-blend effects are profiled and tuned based on actual device behavior. Do not remove the aesthetic without testing alternatives.
- Mobile effects have appropriate lighter variants where data supports it; desktop quality remains intact.
- Global CSS transitions don't animate expensive properties on every interactive element without a need.
- Below-the-fold motion setup is deferred only where doing so doesn't break ScrollTrigger pin order, measurements or initial visual layout.
- Simple transitions use CSS only where this genuinely lowers work and preserves existing behavior.
- Reduced-motion and keyboard navigation remain correct.

Stop after this phase. Provide visual comparison screenshots and performance results. Wait.

---

## Phase 4 — Bundle and runtime architecture review

**Goal:** Verify whether shared client code or dependencies materially affect initial load and only then make targeted import changes.

Relevant items: #16, #17, #27, #28, #29, #30, #31, #32, #33 and #34.

### Guardrails

- Do not assume bundle size is the bottleneck without inspecting real client chunks.
- Do not add an analyzer package if the built-in Next.js/Turbopack analyzer or existing scripts meet the need.
- Do not split `gsap.ts` into several modules unless bundle traces show a useful reduction and regression risk is justified.
- Do not remove a plugin based only on a grep search that misses dynamic imports/registered usage. Search and verify before removal.
- Do not replace Next.js image/media patterns wholesale; evaluate existing `srcset`, AVIF/WebP and custom media-generation output first.
- Do not install another runtime animation or scrolling library.

### Acceptance criteria

Provide a before/after client-bundle report, identify actual shared vs route-specific modules, and justify each architecture change in terms of measured bytes, blocking time or runtime work. If there is no proven benefit, keep the existing implementation.

Stop after this phase. Wait.

---

## Phase 5 — Client perspective and conversion improvements

**Goal:** Make the site easier for a prospective client to understand, assess, trust and contact SxBP. Preserve the design system and use only supported claims.

Implement the 12 client-facing improvements later in this document, starting with #1–#5 and #9–#10 (positioning, portfolio relevance, offer clarity, practical process, enquiry journey, language clarity and mobile speed). Items requiring evidence/owner input must be raised, not fabricated.

### Specific approvals needed before publishing new factual content

- Target industries/client fit if not clearly documented.
- Approved project context and proof for case studies.
- Actual roles and identity for founder/team section, if any.
- Actual deliverables and exclusions for each recurring offer.
- Prices or price ranges, if the business chooses to publish them.
- Testimonials/reviews and permission to use them.
- Verified social profile URLs and the branded email address.
- Any response-time promise, service guarantee or engagement timeline.

Do not use generated filler to make empty sections look complete. Where content isn't approved, improve hierarchy and UX around existing content and report the missing information.

### Acceptance criteria

- A first-time visitor can identify what SxBP does and find a relevant work example quickly.
- Core offer structure matches services that are genuinely available.
- Contact actions are easy to understand, reachable on mobile and preserve the approved adapters.
- Existing route slugs and portfolio/capability links work.
- No invented proof or unsupported promise was added.
- Content audit, accessibility checks, route tests and all available build checks pass.

Stop after this phase. Wait.

---

## Phase 6 — Final regression, measurement and handover

**Goal:** Prove that the changes improved the site and didn't damage routes, visuals, access or content integrity.

### Required tests

1. `npx next typegen` (if required for this checkout), then `npx tsc --noEmit`.
2. `npx eslint src` or the repository's exact lint script.
3. `npm test` with the documented Playwright/browser environment.
4. `npm run build`.
5. Production smoke test: run the built server and verify all required routes/slugs, metadata, sitemap, OG image and 404 behavior.
6. Run project QA scripts for desktop and mobile, plus reduced-motion screenshots/sweeps.
7. Test at least one full user journey from each page family to the work detail or `/route` and back to Home.
8. Test no-JS or reduced-motion behavior where project tests support it.
9. Re-run performance collection under the same CPU throttling, device/viewport, route and warm/cold-cache setup as the baseline. Compare equivalent metrics.
10. Review `git diff` for unrelated file changes, debug logging, accidental assets, secrets, copy drift, route changes and new dependencies.
11. Update `HANDOVER.md` only with confirmed changes, actual command results, measured numbers and remaining next steps.

### Required final report

- Summary of actual changes, grouped by phase.
- Files changed and why.
- Tests run and exact pass/fail/blocked outcomes.
- Before/after performance measurements with setup details.
- Issues not fixed and why.
- Any pending owner decisions/data required.
- New dependencies, if any, with justification.
- Confirmation that the next phase was not started without approval.

Never state “perfect,” “bug-free” or “fully optimized.” Report evidence, limitations and remaining work.

---

# PART A — 37 TECHNICAL PERFORMANCE / RELIABILITY ITEMS

These are the 37 topics from the technical audit, rewritten as actionable checks. For each item, verify the current implementation before changing it. The priority marks are suggested, not proof that the issue remains present.

## 1. HeroPill video preload and concurrent slides — P0

**Likely area:** `src/components/home/HeroPill.tsx`

**Why this matters:** Hero pills rotate through portrait clips. Preloading videos eagerly and maintaining too many mounted/decoded slides can compete with first paint and the other hero media.

**Inspect:** The current code, `PillVideo`, `reach`/`prev` behavior, video budget, network waterfall and number of clips downloaded before the slide becomes active. The code may deliberately keep current/outgoing clips alive for a smooth handover, so preserve that behavior unless measurements show excess work.

**Solution:** Use poster-first behavior; do not fetch a video just because its element has mounted. Consider `preload="none"` or carefully controlled activation, but test the prewarm timing because the component currently uses a prewarmed outgoing/incoming transition. Keep the current/outgoing count small and document any bypass of the shared video budget. Reuse existing elements where it avoids fetch/decoder startup on each transition.

**Acceptance:** Initial hero shows immediately; no blank flash at the capsule transition; network waterfall proves inactive clips aren't unnecessarily downloading; concurrent video playback is bounded and observed on mobile/desktop.

## 2. Hero takeover video activates before it is actually needed — P0

**Likely area:** `src/components/home/Opening.tsx`, `src/components/media/Reel.tsx`

**Why this matters:** An intersection observer follows layout geometry, not visual opacity. A takeover reel visually concealed inside the hero may count as intersecting and begin media work early.

**Solution:** Inspect its activation mode. If it begins fetching/playing before the scroll transition, make it explicitly activated by the intended hero transition or the existing video-budget/activation mechanism. Do not switch to manual mode without wiring and testing the correct trigger.

**Acceptance:** The intro poster and first frame render promptly; the takeover video activates at the intended point; scroll back/reduced motion still behave properly.

## 3. Repeated `gsap.to()` inside `ScrollTrigger.onUpdate` — P0

**Likely area:** `src/components/home/WorkShowcase.tsx`

**Why this matters:** The current audit observed code that sets a boost value and creates a new tween to restore it on every update. High-frequency callbacks can continually allocate and overwrite tweens.

**Solution:** Reuse a single tween, a `gsap.quickTo()` setter, or a single scheduled settle operation. Let the scroll callback update the target value without creating another tween per frame. Ensure teardown kills the reused animation and that the velocity mapping remains bounded.

**Acceptance:** Scroll stress produces no growing tween count or callback backlog; the effect still eases back to normal speed; scroll FPS/long-task measurement improves or, at minimum, no regressions are introduced.

## 4. Heavy backdrop blur on WorkShowcase cards — P1

**Likely area:** `src/components/home/WorkShowcase.tsx`

**Why this matters:** Large scaled images with blur and saturation behind multiple moving cards can require significant compositing and paint work, especially when the duplicated infinite-loop tracks are visible.

**Solution:** Measure before removing effects. Test a smaller pre-blurred poster generated through the existing media pipeline, reduced blur, lower-resolution backdrop, or a lighter mobile-only treatment. Don't introduce a new image dependency without approval.

**Acceptance:** Portrait content retains the approved layout; desktop still looks intentional; lower-end/mobile scrolling is smoother; visual and performance comparison is recorded.

## 5. Touch pointer events triggering mouse-hover behavior — P1

**Likely area:** `src/components/home/WorkShowcase.tsx` and other pointer-driven UI

**Why this matters:** `pointermove` can fire for touch and pen input. Treating every pointer as a mouse can activate hover styles, extra media or React state updates during scroll.

**Solution:** Gate mouse-only effects using `event.pointerType === "mouse"` or the appropriate existing media-query condition. Keep the separate intended touch behavior, such as playing a visible preview if that is part of the design. Ensure focus remains a valid keyboard-accessible path.

**Acceptance:** Test mouse, touch, pen where available, keyboard focus and reduced motion separately. Touch scrolling must not trigger desktop hover styling.

## 6. DivisionIndex creates too many video/Reel instances — P1

**Likely area:** `src/components/capabilities/DivisionIndex.tsx`

**Why this matters:** Eighteen cards can create many `Reel` instances, refs, effects and potential media elements. Even paused videos may add DOM/lifecycle/memory overhead.

**Solution:** First verify what the current code mounts. If all 18 preview elements are mounted, use poster-only cards and one reusable active preview, or a tightly bounded active/incoming pair. Preserve hover-intent delays, focus behavior, and the established note that large-list hover should not trigger React rerenders for all reels.

**Acceptance:** Only the required preview video(s) mount/play; all division cards remain usable; no 2-second hover freeze; reduced-motion view is poster-based and complete.

## 7. DivisionBoard keeps inactive stage videos alive — P1

**Likely area:** `src/components/capabilities/DivisionBoard.tsx`

**Why this matters:** If 18 `Reel` instances stay mounted when one division is selected, the DOM/media lifecycle work is higher than the visible effect needs.

**Solution:** If confirmed, retain the static board/tile content but render only the active stage reel plus at most one transition layer. Reuse a video element or crossfade two controlled layers; do not mount all 18 hidden videos merely to make selection easy.

**Acceptance:** Correct active selection via mouse and keyboard; the stage transition still looks deliberate; video count and initial client work fall without introducing flashing or incorrect source/poster pairing.

## 8. Cursor-follow animation feels delayed — P2

**Likely area:** `src/components/capabilities/DivisionIndex.tsx` or cursor-follow utility

**Why this matters:** A long smoothing duration can make a cursor preview lag behind the pointer, which users perceive as latency even if FPS is acceptable.

**Solution:** Measure the existing duration and try a controlled reduction (the previous audit suggested approximately 0.16–0.25 seconds, with about 0.2 seconds as a starting experiment). Keep motion elegant and avoid following the pointer on devices that don't have a fine pointer.

**Acceptance:** Cursor tracks naturally at slow and fast pointer speeds; no oscillation or snapping; reduced-motion behavior remains appropriate.

## 9. DivisionTicker event listener cleanup — P1

**Likely area:** `src/components/capabilities/DivisionTicker.tsx`

**Why this matters:** Every manually attached event listener must be removed with the same function reference. Incorrect cleanup, particularly around `matchMedia` setup, can duplicate handlers after breakpoints change or components remount.

**Solution:** Inspect the current effect. Store named handler references and remove the exact same references in cleanup, or use React event props if equivalent. Ensure `matchMedia` listener cleanup is also paired.

**Acceptance:** Resize repeatedly across breakpoints and mount/unmount the page; each interaction fires once; no duplicated animation or console error.

## 10. One-shot reveals implemented as ScrollTriggers — P1

**Likely area:** `src/components/work/ScreeningMedia.tsx`, `src/components/home/AiAmplifies.tsx`, and other reveals

**Why this matters:** A reveal that only needs to happen once after entering the viewport doesn't require participating in every ScrollTrigger update/refresh.

**Solution:** Use the existing `observeOnce` helper from `src/lib/motion/observe.ts` for genuinely one-shot effects. Keep ScrollTrigger for pinned sequences, scrubbed animation and continuous scroll progress. Do not convert a genuine scroll-linked scene to IntersectionObserver.

**Acceptance:** Reveals fire once at the correct point, hidden content doesn't flash prematurely, content is visible for reduced motion/no-JS, and trigger counts/refresh time are reduced where appropriate.

## 11. Route-level/global ScrollTrigger refresh cost — P1

**Likely area:** `src/components/motion/SmoothScroll.tsx`, route transition lifecycle

**Why this matters:** `ScrollTrigger.refresh()` recalculates trigger positions. Multiple or poorly timed refreshes can cause layout work, especially on a page with pinned scenes.

**Solution:** Identify all refresh call sites and prove when each is needed. Coalesce necessary refreshes into one after the new route/layout is ready, avoid recursive refresh patterns, and do not introduce arbitrary long delays as a substitute for correct DOM/media layout readiness. Respect trigger order and refresh priorities for pinned sections.

**Acceptance:** No duplicate refresh storm during navigation; pinned section starts remain correct; no layout jump; route transition and page responsiveness are tested across viewport sizes.

## 12. RouteBuilder combines Lenis with native smooth scrolling — P1

**Likely area:** `src/components/route/RouteBuilder.tsx`, `src/components/motion/SmoothScroll.tsx`

**Why this matters:** Browser-native `scrollTo({ behavior: "smooth" })` and an active Lenis scroll loop may both attempt to animate the same movement.

**Solution:** If Lenis is controlling the page, use its documented scroll API via the existing context/integration, or use immediate native scrolling when Lenis should not animate. Avoid creating a competing scroll animation. Follow the actual Lenis API version installed in the repo.

**Acceptance:** The route journey arrives at the intended section without double easing, overshoot or inconsistent timing; native behavior still works on pages/devices where Lenis is disabled.

## 13. Lenis active globally where it may not be necessary — P2 / measure first

**Likely area:** `src/components/motion/SmoothScroll.tsx`, root layout

**Why this matters:** A permanent smooth-scroll loop adds runtime behavior even for pages whose interactions may not need it.

**Solution:** Do not replace Lenis by default. First measure its real runtime cost and verify whether it is already conditionally disabled for reduced motion, mobile or simple routes. Only consider page-scoped/native scrolling if the difference is measurable, the user experience is consistent and pinned scene behavior remains correct.

**Acceptance:** No regression in wheel/touch scrolling, focus scrolling, anchors, route restoration or pinned sequences. If no measured benefit exists, retain the current setup.

## 14. HeroGlare uses large blur/blend/mask layers — P1

**Likely area:** `src/components/fx/HeroGlare.tsx`, hero CSS

**Why this matters:** Oversized blurred layers, masks, gradients and mix-blend modes moving continuously can be costly on weaker GPUs and mobile devices.

**Solution:** Profile the actual hero. Test fewer/lighter layers on smaller screens or replace some animated diffuse light with a static/pre-rendered texture. Preserve the distinctive hero effect on capable devices. Hide or simplify effects only when the visual fallback remains coherent.

**Acceptance:** First viewport remains visually on-brand; no flashing on resize; motion respects reduced-motion; compare scroll/render performance on desktop and phone-sized viewports.

## 15. Global CSS transitions animate expensive properties too broadly — P1/P2

**Likely area:** `src/app/globals.css`

**Why this matters:** A global transition rule covering box-shadow, opacity or scale can cause unnecessary animation/paint work across many interactive elements.

**Solution:** Audit the global selector. Keep inexpensive color/border transitions global only if needed; opt into shadow/scale/opacity transitions on specific components that need them. Do not blanket-remove intentional brand motion.

**Acceptance:** Hover, active and focus states remain intentional; no abrupt visual regressions; profiling shows less unnecessary transition work on card-heavy pages.

## 16. GSAP plugin module includes unused or unnecessary plugins — P2 / verify

**Likely area:** `src/lib/gsap.ts`

**Why this matters:** Central registration can make plugin dependencies harder to reason about. The previous audit called out `DrawSVGPlugin`, but it must be rechecked against all current imports and uses before removal.

**Solution:** Search the complete repo, including dynamic code, for each plugin API and registration. Remove an unused plugin only when it is confirmed unused and the production build/tests pass. Split GSAP entry modules only if bundle evidence supports it.

**Acceptance:** No runtime `registerPlugin`/undefined plugin issue; before/after bundle data is recorded; no page loses an animation.

## 17. GSAP enters shared client infrastructure via global components — P2 / measure first

**Likely area:** `src/app/layout.tsx`, `src/components/layout/Nav.tsx`, `src/lib/gsap.ts`

**Why this matters:** A globally rendered component importing GSAP may cause animation code to be part of shared client chunks. Actual behavior depends on Next.js/Turbopack chunking, so it must be measured.

**Solution:** Inspect bundle output before changing architecture. If shared code materially raises initial client JS, consider CSS or Web Animations API for very simple nav effects, or isolate genuinely heavy route animation modules. Don't rewrite the nav just to pursue theoretical savings.

**Acceptance:** Real client chunks demonstrate a useful reduction and all navigation/animation behavior still works.

## 18. PointerFx does expensive work on high-frequency pointer events — P1/P2

**Likely area:** `src/components/fx/PointerFx.tsx`

**Why this matters:** Pointer events can fire much faster than a frame. Repeated target traversal, geometry reads and tween creation can make the main thread busy.

**Solution:** Inspect actual handler frequency and work. Consider a single `requestAnimationFrame` scheduler, caching geometry until target/resize/scroll changes, and reusing GSAP setters/tweens. Avoid unbounded per-event `gsap.to()` calls. Keep fine-pointer and reduced-motion gating.

**Acceptance:** Magnetic/cursor effects remain responsive; no layout thrashing from read/write interleaving; event work is limited to roughly one update per animation frame.

## 19. DevWarmup can contaminate development performance measurements — P2

**Likely area:** `src/components/layout/DevWarmup.tsx`

**Why this matters:** A dev-only delayed route-prefetch routine can compete with requests and CPU after initial page render, making local development appear slower than the production site.

**Solution:** Verify it runs only in development and is not included in production behavior. Disable it during benchmark collection or make it idle-aware if it is a demonstrated interference source. Do not treat development metrics as production metrics.

**Acceptance:** Production traces exclude dev-only warmup; measurements use repeatable production build/server mode.

## 20. Route transitions are long relative to destination readiness — P2

**Likely area:** route/view-transition styles in `src/app/globals.css`, navigation components

**Why this matters:** A lengthy exit/enter animation plus page initialization/refresh can feel like the site is slow even when the route has loaded.

**Solution:** Measure current total transition duration and timing against actual page readiness. Trial shorter transitions (the previous audit suggested around 250–400 ms vs a longest sequence around 560 ms) without making the visual identity generic. Ensure reduced-motion styles remove/simplify the transition.

**Acceptance:** Destination content feels responsive; no overlap, flicker or unreadable state; route navigation and back/forward work.

## 21. Preserve the existing media pipeline unless a measured issue requires change — KEEP / verify

**Likely area:** `src/components/media/Photo.tsx`, `Reel.tsx`, `codec.ts`, `src/content/media.generated.json`, `scripts/media/*`

**Why this matters:** The repo already includes responsive image/media generation and poster logic. Replacing it blindly can undo useful AVIF/WebP, sizing, poster and video behavior.

**Solution:** Inventory real source sizes, generated variants, dimensions and how routes use them. Fix inappropriate element loading and over-mounting first. Improve generated media only for demonstrated cases.

**Acceptance:** Existing responsive variants/posters still resolve; no missing assets or aspect-ratio regression; any changes include the right media manifest/metadata update.

## 22. Video-resolution tiers may reduce download/decode work — P2 / measure and preserve quality

**Likely area:** `scripts/media/transcode.mjs`, generated media metadata and component source selection

**Why this matters:** The same high-resolution clip may be used for a full-screen hero and a small preview card where the smaller use doesn't need that bitrate/resolution.

**Solution:** Audit available encodes and their quality/size. If useful, introduce carefully managed resolution tiers for actual use cases (e.g. full hero vs card/phone preview). Do not encode arbitrary variants without checking the current pipeline, codec support, source quality, storage and content manifest.

**Acceptance:** Quality remains acceptable for each displayed size; bytes transferred decrease for target contexts; codec fallbacks and posters work; no additional runtime package is added just to choose a source.

## 23. Do not preload video solely because it is nearby or visible in layout — policy + verify

**Likely area:** all `<video>` elements, `Reel`, `HeroPill`, `WorkShowcase`, capability previews

**Why this matters:** Video preload behavior should be driven by actual user intent and visibility. A hidden element can be geometrically intersecting, and `preload="auto"` can compete with critical content.

**Solution:** Use the existing video budget and intended active/visibility state; posters remain the initial representation. Start the download/playback when the established interaction says it is needed. Prewarming is allowed only when bounded and measured to avoid transition hitching.

**Acceptance:** A cold-load network trace shows only intended media loading; no obvious blank transition or repeated fetches.

## 24. Consider unloading very distant videos on long pages — optional / measure first

**Likely area:** `Reel` and long work/capability feeds

**Why this matters:** Pausing a video stops playback but may not release all decoder and buffer resources. Long sessions on memory-constrained devices can accumulate resource pressure.

**Solution:** Only for long/offscreen feeds where memory evidence supports it, consider removing the source and calling `load()` after an appropriate inactive period. Do not do this globally if it triggers repeated downloads or visible pauses when scrolling back. Respect the shared video-budget component.

**Acceptance:** Memory/resource behavior improves in a long scroll test; returning to a card has a graceful poster-to-video transition; no unnecessary repeated transfer.

## 25. Defer setup for below-the-fold motion where safe — P1/P2

**Likely area:** `src/app/page.tsx`, home sections, `useGSAP` hooks and pin timelines

**Why this matters:** Initializing all pinned scenes, hover systems and lower-page effects before the visitor reaches them increases startup work.

**Solution:** Profile home first. Defer only sections whose initialization can safely happen later, e.g. at idle or when approaching the viewport. Home has pinned sections, so preserve trigger creation order/refresh priorities and ensure deferred triggers don't mismeasure pin positions. Don't defer the hero or first-frame-critical interactions.

**Acceptance:** Initial blocking time reduces without pin offsets/jumps, late flashing, broken scroll progress or layout shifts. Test slow scroll and fast jump-to-anchor cases.

## 26. Use CSS for simple animations; retain GSAP for complex timelines — policy / targeted refactor

**Likely area:** simple hover/fade/scale/marquee interactions across components

**Why this matters:** A heavyweight timeline engine is not needed for every basic state transition. But replacing complex sequences casually can also create bugs.

**Solution:** Keep GSAP for pinned/scrubbed/Flip/SplitText/coordinated sequences. Use CSS for simple deterministic hover/focus/fade/translate effects only when it reduces overhead or simplifies state. Don't create a sweeping animation rewrite.

**Acceptance:** Reduced code/runtime complexity for the specific interaction; same keyboard/reduced-motion behavior; all screenshots and user journeys stay coherent.

## 27. Measure actual bundle/chunk composition before splitting modules — P1 / diagnostic

**Likely area:** Next.js client bundles and imports

**Why this matters:** Assumptions about shared JS are not a substitute for seeing which modules are in each client chunk.

**Solution:** Use the repository's existing tooling or the built-in analyzer available in the installed Next.js version. If that isn't available or sufficient, propose a development-only analyzer package with cost/benefit before installing it. Compare initial route JS vs page-specific chunks, including GSAP plugins and icons.

**Acceptance:** Reported bundle findings identify real packages/chunks and lead to a specific change or a documented decision not to change anything.

## 28. No new runtime package is needed unless measurement proves a gap — policy

**Likely area:** `package.json`

**Why this matters:** The stack already includes Next.js, React, GSAP, `@gsap/react`, Lenis and media helpers. New runtime code adds bytes and maintenance burden.

**Solution:** Before package installation, document the requirement, current-stack alternative, compatibility, bundle impact and approval. Bundle-analyzer tooling may be a dev-only option, but try current Next.js tools first.

**Acceptance:** No unapproved dependency changes. If installed, lockfile/package manifest changes are intentional and tests/build pass.

## 29. Do not install a lazy-loading package to solve native media-loading issues — policy

**Why this matters:** The site already has browser-native loading controls, `IntersectionObserver` patterns, posters and media-budget code.

**Solution:** Fix when elements mount, which source is assigned, preload settings, observer state and playback-budget logic using existing APIs. Add a dependency only if a documented feature is impossible or significantly unsafe with the current stack.

**Acceptance:** No new lazy-loading dependency without an explicit case; loading behavior is tested in the network panel.

## 30. Do not blindly replace custom image rendering with another image library — policy

**Why this matters:** Existing media variants and poster pipeline may already provide responsive AVIF/WebP, explicit dimensions and correct aspect ratios.

**Solution:** Inspect `Photo`, `Reel`, generated media metadata and usage before changing rendering. Use Next.js image features only where they fit the current pipeline and measurably improve an identified issue. Avoid double-optimizing pre-generated media.

**Acceptance:** Correct dimensions, layout stability, modern-format/fallback behavior, no duplicated transformations or broken source paths.

## 31. Do not replace GSAP as a general performance fix — policy

**Why this matters:** GSAP is capable of smooth animation. Excessive work, poor lifecycle management and too many simultaneous elements are more plausible causes than the package itself.

**Solution:** Fix tween creation, trigger counts, visual compositing, active elements and hydration/runtime setup first. A library replacement requires a demonstrated unfixable limitation and explicit owner approval.

**Acceptance:** Targeted fixes reduce measured work without a wholesale animation rewrite or loss of the site's signature interactions.

## 32. Do not replace Lenis or add a second scroll library by default — policy

**Why this matters:** Two scrolling engines can compete and create more bugs. Lenis + GSAP integration is already part of the current architecture.

**Solution:** Maintain the existing integration unless current documentation/source reveals a concrete defect. Use one owner for programmatic animated scrolling and verify native behavior on devices/pages where Lenis is disabled.

**Acceptance:** No competing scroll library, no double easing, no regression in anchors/pins/touch scrolling.

## 33. Do not add Three.js or a 3D rendering stack to “make it smoother” — policy

**Why this matters:** The current design relies on DOM, CSS, video and GSAP. A 3D stack adds runtime and GPU cost and does not solve excessive media/scroll work.

**Solution:** Preserve the existing render stack. A future, explicit 3D requirement must be considered separately with measured value and graceful fallback.

**Acceptance:** No 3D dependency added during this performance project.

## 34. Do not blanket-wrap components with React.memo/useMemo/useCallback — policy

**Why this matters:** Memoization can add code and complexity without removing the expensive work. Large video lists, decoding and main-thread animations may dominate instead.

**Solution:** Use React Profiler or a repeatable reproduction to identify excessive renders. Optimize only components with demonstrated unnecessary renders and maintain correct dependency/cleanup behavior.

**Acceptance:** A real render/cost reduction is shown and all behavior is correct; no new stale props, refs or hook bugs.

## 35. Establish and compare a production performance baseline — required diagnostic

**Existing reference only:** `HANDOVER.md` reports a prior pass at 4× CPU throttling: home blocking time ~2.4 s, home scrolling ~30 FPS, capabilities ~50 FPS, work ~53 FPS and approach ~45 FPS. These are historical measurements, not guaranteed current results.

**Solution:** Re-run current QA on the current commit with the same script, server mode, CPU throttling, viewport, route and cache conditions. Report both absolute metrics and change vs baseline. Capture cold and warm behavior where appropriate. Avoid claiming improvements from subjective impressions alone.

**Acceptance:** A repeatable report with date/environment, route, CPU/device emulation, metric definition, before/after values and known variance.

## 36. Test across routes, viewports, input modes and reduced motion — required diagnostic

**Why this matters:** Fixes can solve desktop performance but break mobile touch, sticky/pinned layout, page navigation, screen readers or reduced-motion behavior.

**Solution:** Re-test `/`, `/work`, a work detail route, `/capabilities`, a capability detail route, `/approach` and `/route`; test  desktop/mobile widths, mouse and touch, keyboard focus, reduced motion, back/forward navigation and slow/fast scrolling. Keep existing tests and add narrow regressions for confirmed bugs.

**Acceptance:** No new page errors, broken links, horizontal overflow, layout shifts, inaccessible actions or lost media behavior. If a test can't run in the environment, mark it blocked, not passed.

## 37. Maintain a verified changelog and stop after the approved phase — required process

**Why this matters:** Performance work becomes risky when the model changes unrelated components, loses track of what changed, or reports unmeasured claims.

**Solution:** For each phase, list confirmed issue IDs, changed files, the reason for each change, commands and results, screenshots/measurements and remaining risks. Update project handover notes only with verified facts. Keep the diff minimal, don't introduce debug remnants, and stop for approval after the phase.

**Acceptance:** The owner can audit each change; no unrelated design/content/dependency changes; no unsupported “fixed” claims; the model waits before proceeding.

---

# PART B — 12 CLIENT-PERSPECTIVE IMPROVEMENTS

These changes are about what an actual prospective client needs to understand before entrusting SxBP with marketing work. Implement them using approved facts only. Some require owner-supplied evidence before publication.

## 1. Make the homepage value proposition concrete — P0

**Client question:** “What do you actually do, and why should I care?”

**Changes:** Explain the core service and business benefit in the hero. Keep the slogan “We will show, you will grow” as a brand line if appropriate, but do not make it the only explanation. Use one primary CTA with a clear action and one secondary route to relevant work. Show the core offer quickly.

**Copy direction (not publish-ready without confirming exact scope):** “Make your brand easier to discover, trust and choose.” Supporting copy can describe social strategy, content and campaigns only to the extent those are confirmed services.

**Acceptance:** A first-time visitor can explain what SxBP offers after reading the first screen. No invented growth promise or guarantee.

## 2. Make the portfolio prove relevance, not just visual quality — P0

**Client question:** “Have you done work relevant to my business and goals?”

**Changes:** Prioritize business-relevant projects for the agency's main buyer. Organize by service, industry or goal where the real portfolio supports it. Keep event/personal work if commercially relevant, but do not let it obscure social media/business work. Make project role and partner credits clear.

**Acceptance:** A visitor can find a relevant project within a short scan, understand what SxBP contributed and distinguish SxBP work from partner work. Never claim an outcome that isn't verified.

## 3. Add real project case studies when evidence exists — P0

**Client question:** “What was the goal, what did you do, and what happened?”

**Changes:** Use a consistent structure: context, objective, challenge, strategy, execution, duration, deliverables, outcomes, attribution and learning. Use actual metrics only when supported by source material, a reliable analytics record and permission to publish. If a project can't disclose its client name, use a permitted anonymized description. If evidence doesn't exist, label it “Selected work” or “Project overview,” not a performance case study.

**Acceptance:** Every fact has a source or approval. No fabricated numbers, logos, testimonials or causal claims.

## 4. Package the service catalogue into a few understandable offers — P0

**Client question:** “Which service should I buy?”

**Changes:** Present a small set of core offers first, based on current approved scope—for example, social media management, content production, performance campaigns and brand/creative work only if SxBP genuinely supplies them. Preserve detailed service pages underneath. Add an “I'm not sure which service I need” path.

**Acceptance:** Offers map to actual service records and detail pages. No capability is implied solely because it appears in a visual placeholder.

## 5. Define deliverables and exclusions — P0

**Client question:** “What exactly will I get for the fee?”

**Changes:** Service pages should clarify platforms, content types/quantity where known, planning, approval workflow, revisions, publishing, community-management scope, reporting cadence, client responsibilities and exclusions. If a quantity, cadence or term is not defined internally, flag it for owner input instead of inventing a standard package.

**Acceptance:** Prospects can compare scope and understand what is or isn't included. No invented package, service-level promise or price.

## 6. Show the real engagement process and accountability — P1

**Client question:** “What happens after I pay?”

**Changes:** Explain discovery/audit, strategy, planning, creation, approvals, publishing, reporting and improvement using the real process. Identify what the client must provide and how feedback/approval happens. Describe reports in terms of goals and decisions, not just vanity metrics.

**Acceptance:** Process matches how SxBP actually operates. Timelines and meeting frequencies are published only if confirmed.

## 7. Add real people and genuine trust evidence — P1

**Client question:** “Who is doing the work, and why should I trust them?”

**Changes:** If approved, add authentic founder/team profiles, relevant experience and responsibilities. Request client approval for actual testimonials or reviews. If these don't exist or cannot be disclosed, use transparent process, quality work and accurate attribution instead.

**Acceptance:** No stock-person portraits presented as real staff, fake reviews, invented team size, awards, credentials or years of experience.

## 8. Improve business contact identity and validation — P1

**Client question:** “Can I reach a real business and verify its work?”

**Changes:** Link active official social profiles if supplied/verified. Consider a domain-branded email only after the owner configures and tests it. Ensure phone/WhatsApp/email are current. Publish accurate organization/contact details and service coverage only when confirmed. Make privacy information available wherever personal information is requested.

**Acceptance:** Every contact link opens correctly on desktop and mobile. Don't assume or invent a social URL, email mailbox, address or operating location.

## 9. Make enquiry conversion simple and reliable — P0

**Client question:** “How do I start without filling out a complicated brief?”

**Changes:** Present a clear contact action alongside the existing Pilot Route. Keep the detailed route builder for visitors who want guidance. Let visitors express their goal without requiring them to know the exact service division. Use plain-language labels. Explain how WhatsApp, `mailto` and copy actions work and give useful completion feedback.

**Important constraint:** The existing `HANDOVER.md` decision is to use the current WhatsApp/email/copy adapters and add an API adapter later only if approved. Do not implement a backend form, CRM or server-side storage without authorization.

**Acceptance:** Contact actions are keyboard-accessible, testable, mobile-friendly and honest about the next step. Test each adapter; do not say an inquiry was submitted if it only copied text or opened another app.

## 10. Improve the wording, page order and information hierarchy — P0/P1

**Client question:** “Can I understand the site without learning internal brand terminology?”

**Changes:** Prefer recognizable labels such as “Selected work,” “Services,” “What's included,” “Build a marketing brief” and “Discuss your goals.” Retain “Pilot Route” as the product/experience name if it is part of the brand, but explain its purpose. Reduce repeated brand philosophy where practical guidance would be more useful.

**Acceptance:** Navigation and CTAs tell users what happens next. Brand voice remains distinctive without replacing clarity with jargon.

## 11. Treat mobile performance, accessibility and reliability as client trust — P0

**Client question:** “If this agency sells digital marketing, does its own website work well?”

**Changes:** Optimize first paint, poster-first media, video concurrency, touch behavior, target sizes, readable text, keyboard focus, reduced motion and transition speed. Keep primary CTA visible and easy to tap. Avoid forcing motion or video to understand services. Test real responsive breakpoints and slower devices where possible.

**Acceptance:** No known broken mobile interactions, blank media, horizontal overflow, inaccessible buttons, reduced-motion regressions or unacceptable production performance. Report actual test devices/emulation and metrics.

## 12. Make discovery and measurement support qualified leads — P1/P2

**Client question:** “Can I find the agency when I need this service, and does the site convert?”

**Changes:** Strengthen high-intent service-page content, metadata and relevant internal links. Create industry-specific pages only where actual experience and approved content support them. Publish helpful insights only when SxBP can maintain them. Track key website actions (portfolio engagement, contact clicks, route completion and successful enquiries) using the site's approved analytics/privacy approach. Do not add a tracking vendor without approval.

**Acceptance:** SEO claims are grounded in real service scope. Measurement plan defines events and purpose, respects privacy requirements and doesn't invent traffic/conversion benchmarks.

---

# PAGE-BY-PAGE CLIENT CHECKLIST

| Page | What it should help a prospective client do |
|---|---|
| `/` Home | Understand the offer immediately, see relevant work, know why to keep exploring and find a clear CTA. |
| `/work` | Browse authentic, relevant creative work by understandable categories and open a project quickly. |
| `/work/[slug]` | Understand context, SxBP's role, deliverables and available evidence; know how to discuss similar work. |
| `/capabilities` | Understand the core offer groups first; explore the full division list when needed. |
| `/capabilities/[slug]` | Understand who the service is for, what is included, how it works, how progress is assessed and how to enquire. |
| `/approach` | Understand the actual working relationship, process, responsibilities and feedback/reporting approach without repeated slogans. |
| `/route` | Build an optional brief or contact SxBP directly through the approved adapters, with clear labels and completion feedback. |
| Global nav/footer | Provide predictable navigation, accurate contact details, useful social links when verified, privacy information and a reliable path home/contact. |

---

# PERFORMANCE AND PRODUCT ACCEPTANCE CHECKLIST

Use this as a final sign-off checklist. Each item must be tested or explicitly marked blocked/not applicable.

## Runtime and loading

- [ ] First viewport content and CTA appear without waiting for large video assets.
- [ ] Hero/takeover media activates at the correct time.
- [ ] Offscreen/inactive media doesn't fetch/play unnecessarily.
- [ ] Concurrent video playback respects the intended budget or has a measured, documented exception.
- [ ] No GSAP tween is created per high-frequency scroll update.
- [ ] No duplicate listener registrations after resize, remount or route changes.
- [ ] ScrollTrigger count and refresh behavior remain controlled.
- [ ] No competing Lenis/native smooth-scroll animation.
- [ ] Global effects and blur layers are tested on smaller screens.
- [ ] Dev-only warmup is excluded from production benchmark interpretation.

## UX, content and accessibility

- [ ] Core offer is easy to understand on the home hero.
- [ ] Portfolio attribution is clear.
- [ ] No unrelated sample media is presented as proof of a service.
- [ ] Case studies/metrics/testimonials have source evidence and publication approval.
- [ ] CTA copy matches the actual resulting action.
- [ ] WhatsApp, email and copy adapters work and provide honest feedback.
- [ ] Tap targets, focus styling, semantic structure, contrast and reduced motion are checked.
- [ ] Reduced-motion/no-JS experiences still expose meaningful content.
- [ ] All required slugs and routes remain functional.
- [ ] No new backend, runtime package or third-party service is added without approval.

## Build and measurement

- [ ] TypeScript passes or pre-existing errors are documented.
- [ ] ESLint passes or pre-existing errors are documented.
- [ ] Playwright tests pass or environment blockers are explicit.
- [ ] Production build passes.
- [ ] Mobile/desktop/reduced-motion screenshot/route QA is complete.
- [ ] Performance uses equivalent before/after production conditions.
- [ ] Metrics include measurement setup and known caveats.
- [ ] Git diff contains only approved, relevant changes.
- [ ] `HANDOVER.md` reflects the verified state, not an aspirational one.

---

# HOW TO START A PHASE IN CLAUDE CODE

Use one prompt at a time. The model must stop after each phase.

## Start Phase 0

> Read `SocialxBrand_Complete_Audit_and_Claude_Code_Plan.md` and all applicable repository instructions. Execute Phase 0 only. Do not edit files. Verify the current status of the 37 technical items and 12 client-perspective items against the code and documented content. Run available baseline checks with the repository's prescribed environment and report actual results. Label each issue CONFIRMED, NOT REPRODUCED, ALREADY FIXED or NEEDS MEASUREMENT with file/line evidence. Do not start implementation until I approve the next phase.

## Start an implementation phase

> Execute Phase [N] only from `SocialxBrand_Complete_Audit_and_Claude_Code_Plan.md`. Re-read the relevant repository instructions. Verify the issue is present, preserve my existing changes, implement the smallest targeted fix, run the acceptance checks for this phase, and report changed files, exact commands/results, before/after evidence and remaining risks. Do not work on future phases or unrelated cleanup. Do not invent content or install packages. Stop after reporting and wait for my explicit approval.

## Continue after a phase report

> I reviewed the previous phase report and approve Phase [N+1]. Read the previous results and the current diff, then do only the next phase defined in the plan. Do not repeat already-completed changes. Verify that the repo is still in the expected state before editing. Stop after the new phase and report evidence.

## If Claude proposes an unplanned change

> Do not implement that yet. Explain the concrete problem it solves, the repository evidence proving the problem, the smallest alternative, the risks, whether it needs a dependency or new content, and how success will be measured. Wait for approval.

---

# FINAL RULE

**The goal is not to do the most work. The goal is to make only verified, useful changes, in a controlled order, and prove what improved.** Preserve SxBP's existing identity. Improve responsiveness, clarity, trust and conversion without fabricating proof or expanding scope. One phase, one reviewed diff, one evidence-based report at a time.
