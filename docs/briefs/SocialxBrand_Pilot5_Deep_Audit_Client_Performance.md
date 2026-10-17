# SOCIALxBRAND PILOT — Deep Website Audit (Client Clarity, Trust, Functionality & Performance)

**Audited archive:** `SocialxBrand_Pilot(5).zip`  
**Audit date:** 16 October 2026  
**Primary goal:** Make the website understandable and persuasive to a non-technical business owner, while verifying the current performance and reliability risks.  
**Important:** This is a source-code and repository audit supplemented by the latest QA reports bundled in the ZIP. A new production browser run could not be completed in this environment because `npm ci` could not reach `registry.npmjs.org` (DNS `EAI_AGAIN`). This report therefore separates (a) confirmed code/content gaps, (b) likely performance issues that need network tracing, and (c) historical measurements. It does not pretend every runtime bug has been reproduced.

---

## Executive summary

The 16 October client-first refactor is a meaningful improvement. The homepage has been reduced from roughly 15,233 px to 4,836 px at 1440×900 according to `docs/reviews/client-first-refactor-2026-10-16.md`. The home page now presents the hero, selected work, four client-friendly service groups, a four-step process, and one closing contact CTA. The 18 service routes and 14 work collection routes remain.

However, the site is not yet a self-sufficient sales tool. It still has four major client-side gaps:

1. **There is no Feedback/Testimonials section or founder/about page in the current app routes.**
2. **The portfolio is visually useful, but the detail pages are presented as “Project” pages when the source data mostly describes broad work collections.** The page cannot tell a prospect which specific business hired SxBP, exactly what SxBP itself delivered, the objective, or the outcome. Those facts must come from the owner; they cannot be fabricated.
3. **Service pages describe capabilities more than a buying decision.** The visitor still needs confirmed details such as actual standard deliverables, exclusions, approval/revision practices, reporting, pricing approach, and which of the 18 services SxBP actively sells today.
4. **Current post-refactor performance is not independently re-measured in this audit.** Older headless tests passed, but they are not a substitute for a new production trace or a test on a real phone/laptop GPU.

The biggest actionable code findings in this pass are:

- Hero capsules limit videos to a sliding window, but all eight slide poster `<img>` elements are still rendered in each capsule. Because they overlap in the same visible geometry, lazy loading may still request more posters than the user sees. Confirm with a network trace and bound the poster window too if observed.
- The mobile navigation labels its panel `role="dialog"` and `aria-modal="true"`, but does not implement a conventional focus trap; the header controls and the pre-header skip link remain in the page tab order. Verify with keyboard/screen reader testing and fix the modal focus model.
- The work filter assigns one family per collection using a string test. Mixed-format collections such as “Photography & film” are assigned only to “Reels & films,” so the Photography filter can omit work that includes photography.
- There is a fragile `document.startViewTransition` monkey-patch in `NoExitTransition`. It is an intentional performance workaround, not a confirmed breakage, but it must be tested in browsers with native View Transitions and on navigation through the open menu/back-forward path.

No new runtime library is needed to fix these issues or add the proposed pages.

---

## Current site map and what exists

Current App Router pages found in `src/app`:

- `/` — Home
- `/work` — Work index
- `/work/[slug]` — 14 work collection/detail routes
- `/capabilities` — Services directory
- `/capabilities/[slug]` — 18 service detail routes
- `/approach` — How we work
- `/route` — Contact + optional project brief
- 404 page

**Not present in the current route tree:** `/feedback`, `/testimonials`, `/about`, or `/founders`.

The latest code report (`docs/reviews/client-first-refactor-2026-10-16.md`) says the client-first changes passed TypeScript, ESLint, build, and a Playwright run (57 passed, 0 failed, 39 skipped by design), and screenshot checks across desktop/tablet/mobile dimensions. It also explicitly says the “client-understanding” test by a person unfamiliar with the agency has not been run, and real phone/laptop rendering has not been checked.

The report’s green checks are valuable, but they do not verify that all content answers the customer’s buying questions or that the current ZIP performs well on real hardware.

---

# Part A — Client-perspective findings

## P0 — Fix before calling the site “ready to win clients”

### C1. Feedback/testimonials do not exist yet

**Evidence:** No feedback/testimonial component, content file, or page route was found under `src/app`, `src/components`, or `src/content`. Existing docs also list testimonials as owner input that has not been supplied.

**Why it matters:** The current site asks clients to trust the agency on the basis of visual work and the agency’s own descriptions. Genuine customer feedback would provide third-party evidence about communication, reliability, collaboration, or outcomes.

**Recommended solution:**

- Add a compact “Client feedback” section on the homepage, ideally after Selected Work and before the service list. This is the point where a visitor has seen examples and is ready to ask whether working with SxBP is a good experience.
- Start with **two or three approved quotes**. Do not build an elaborate, auto-rotating carousel. Static cards are faster to read, accessible, and keep control with the visitor.
- If SxBP has enough genuine feedback for a useful archive (for example, several distinct references), add a `/feedback` page later. Do not add a mostly-empty standalone page just to have another route.
- A card can include the approved quote, person’s public display name, role/business, the service or project involved, and the source/date where appropriate. Use initials/anonymous attribution only if the client has approved that form of attribution.
- Keep original wording faithful. Edit only with the client's approval. Do not create fabricated reviews, AI-generated quotes, star ratings, review counts, or implied results.
- Store quotes as structured data in a content file (e.g. `src/content/testimonials.ts`). Include a publication permission/approval status in the workflow. Only approved entries should render in production.
- If no approved feedback exists yet, do not show fake content or empty cards. Record the missing input and leave the section out until material is available.

**Acceptance checks:** all quotes have explicit approval; no unapproved personal/business data is exposed; section is readable with keyboard and screen readers; it does not auto-rotate; mobile layout does not overflow; and the site renders no blank testimonial section when no approved entries exist.

### C2. Add a founder/about page, but base it on the actual founders

**Evidence:** No `/about` or `/founders` route, founder content file, or founder profile component exists in the current source. `site.ts` includes an abstract agency vision/mission, but that is not the same as founder information.

**Why it matters:** A prospective client is often buying judgment, communication and accountability as much as creative output. Knowing who founded the agency, why it exists, and who will be responsible for the work makes the business more tangible.

**Recommended page:** `/about` with the public heading **“The people behind SOCIALxBRAND PILOT”**. The nav label should be “About” rather than the internal term “Founders,” because it is easier for a first-time visitor to recognize. The page itself can lead with founder(s).

Suggested content order:

1. **Founder portrait and introduction** — authentic approved photo(s), name(s), role(s), and one plain-language sentence about what they do.
2. **Why the agency was started** — the real problem or opportunity that motivated it, written in the founder’s own voice.
3. **Vision for clients** — translate the actual vision into clear language without adding guarantees of growth.
4. **Relevant experience and responsibilities** — only verified details. Explain who leads strategy, creative production, client communication, approvals, and reporting if that reflects the actual team.
5. **What working with the agency feels like** — real commitments about contact and process, only after the owner confirms them.
6. **A clear next step** — “Discuss your business” / Contact us.

Use responsive, optimized founder images with explicit dimensions. Do not invent years of experience, past employers, qualifications, previous clients, awards, a company origin story, team size, or a personal biography. These must come from the founder(s).

**Navigation recommendation:** the desktop header already shows four links because Home is currently part of the first four. Since the logo already links home, use desktop links **Work · Services · How we work · About**, with Contact us remaining the CTA. Keep Home in the full/mobile menu. Add About to the footer too. This adds discoverability without making the header crowded.

**Acceptance checks:** all biographical claims confirmed by the founders; image usage approved; no invented background; page metadata/canonical/breadcrumbs are correct; navigation and sitemap include the route; responsive checks pass.

### C3. Work detail pages imply more project-specific proof than the data supports

**Evidence:** `src/app/work/[slug]/page.tsx` labels every detail page `Project · {s.kicker}` and calls the metadata block “Project overview,” but currently displays only type of work, a generic production partner credit, and related services. `src/content/work.ts` explicitly says the supplied files do not carry client names or results. The 14 slugs are mainly collections/categories such as “Restaurants & Hospitality,” “Creator Content,” and “Brand & Business Films.”

**Why it matters:** A visitor can reasonably interpret “Project” as a specific brief delivered for one client. If the detail page is a curated collection of examples, that label risks overstating what the page proves. The current copy is honest about not inventing facts, but it still leaves the client wondering what SxBP did itself and whether the material represents a client engagement.

**Recommended solution:**

- Until each detail page has specific verified project information, label it **“Work collection”**, **“Selected examples”**, or **“Work sample”** rather than “Project” and stop implying that every collection is a case study.
- Add real project metadata when supplied: client/business name (or approved anonymization), project objective, SxBP’s role, production partner’s role, deliverables, platforms, period, and results if measured and approved.
- Distinguish SxBP’s own contribution from the production partner’s contribution on the individual work collection. Do not blindly assume the same exact credit is appropriate for every asset unless the owner confirms it.
- Keep results optional. A well-explained creative example is useful even without metrics, but it must be described accurately.
- If no client/project detail exists, use a clear summary of what the examples demonstrate and identify them as a collection—not a “case study.”

**Acceptance checks:** every page’s title matches what is actually being shown; no fabricated client or result; partner attribution is confirmed for the work shown; related-service links point to valid pages.

### C4. The service catalogue still does not give a full buying decision

**Evidence:** `src/app/capabilities/[slug]/page.tsx` says “What’s included” and displays six deliverables, but the supporting text says “What you can receive, depending on what your business needs.” All capability groups and deliverables are then revealed in a large “See the full scope” disclosure. The latest owner-input list asks which of the 18 services are actively offered and what the standard inclusions/exclusions are.

**Why it matters:** “What’s included” normally sounds like a defined package. A long list of possible work is not the same as what a client will actually receive, how much it costs, or what responsibilities are included in a retainer.

**Recommended solution:**

- Ask the owner to confirm which services are available now, whether some require a partner, and whether they are one-time or recurring engagements.
- Rename the generic section to **“Typical deliverables”** or **“Possible deliverables”** until a firm scope is defined. Keep the wording that exact deliverables depend on the agreed brief.
- For key offers (especially Social Media Management, Content Production, Performance Marketing and Search/SEO), provide a concise “Typical engagement” section with owner-approved inclusions, exclusions, client responsibilities, approval/revision policy, reporting/meeting cadence, platforms, and how paid-media budget/production expenses are handled.
- Publish a starting price or range only if the owner chooses to and can maintain it. If the service must be scoped individually, explain the factors that determine price and the process for receiving a proposal.
- Do not promise guaranteed follower, lead, sales, or revenue growth.

**Acceptance checks:** no item reads like a universal included deliverable unless it is one; all scope statements are approved; services that are not currently available are not marketed as bookable.

## P1 — High-value content and information-architecture changes

### C5. Keep the homepage short, but make the hero more literal for first-time visitors

**Evidence:** `src/app/page.tsx` now has the intended short structure: hero, selected work, services, four-step process, closing CTA. `src/components/home/Opening.tsx` retains the headline “Every business has something worth showing.” The lede uses “Strategy, creativity, technology and execution across 18 marketing services…”

**What improved:** the page no longer asks the visitor to scroll through the pinned takeover, long Ladder philosophy scene, moving showcase, 18-service animation board, seven-stage MethodBoard, audience tabs, and separate AI philosophy. The height reduction is substantial and directionally right.

**Remaining issue:** the headline is a brand idea, not a plain service explanation. The sub-line is still broad marketing language and leads with the number of services, not the client’s problem.

**Recommended solution:** keep the distinctive headline, but add a plain eyebrow such as **“Digital marketing and content for businesses”**, and make the supporting line state the real offer in everyday words. Draft direction (owner must verify it matches delivery): “We help businesses plan social media, create content and run digital campaigns around clear goals. Not sure what you need? We can help you decide.” Keep the two CTAs, “See our work” and “Explore services.”

Don't add more long hero effects or rebuild the previous sections. The short home page is a good decision.

### C6. The work filters can hide mixed-format work from people who expect it to appear

**Evidence:** `src/app/work/page.tsx` maps format to one exclusive family with `familyOf()`; `src/components/work/WorkIndex.tsx` filters one `family` value. The filter is “All work / Reels & films / Photography / Design & identity.” A format such as “Photography & film” is classified as motion because it is not exactly “Photography.”

**Why it matters:** a client filtering for Photography may expect to see portrait/fashion and celebration work that includes photography, but those collections can be absent from the Photography filter.

**Recommended solution:** change from one family value to a `families`/`formats` array, and include mixed-format collections in each relevant filter. Alternatively, rename the options to mutually exclusive categories (e.g. “Video & film,” “Photo-only,” “Design & identity,” “Mixed media”) and label them honestly. Do not solve this with loose text matching alone; define a deliberate category per collection in content data.

**Acceptance checks:** each item has explicit format tags; counts match the results; the same item appears in multiple filters only when intended; All work still contains all 14 collections.

### C7. Some images on work detail pages have weak alt text

**Evidence:** `src/components/work/ScreeningMedia.tsx` labels portfolio photographs as `${title} — image ${i + 1} of ${photos.length}`. That gives the item’s position, not meaningful information about the visual.

**Recommended solution:** provide descriptive alt text when the content is meaningful and the subject is known (e.g. “Restaurant plating close-up in warm lighting”), without inventing the client or image context. If a photo is purely decorative and adds no information beyond nearby content, use empty alt text. Do not use `image 1 of 5` as the only alternative text for meaningful work.

**Acceptance checks:** all meaningful images have useful, accurate alt text; decorative images remain silent to screen readers; no personal identity is inferred or invented.

### C8. The custom 404 page is too brand-metaphorical for an error state

**Evidence:** `src/app/not-found.tsx` says “Off route,” “Wrong turn,” and “This page isn’t on the route.”

**Why it matters:** a non-technical client who lands on an outdated link should immediately understand that the page could not be found.

**Recommended solution:** lead with **“Page not found”**, explain in one sentence that the link may be outdated, and keep two clear options: **Go to Home** and **See our work**. The creative tone can remain in a small eyebrow, not the actual explanation.

### C9. The “About” route should be discoverable without adding clutter

**Evidence:** navigation currently has Home, Work, Services, How we work and Contact us. Desktop shows `links.slice(0, 4)`, while the CTA independently links to Contact us. No About/Founders entry exists.

**Recommended solution:** use the logo as the Home link and show Work, Services, How we work, About as the four desktop text links. Keep Home available in the mobile/full menu; Contact us stays the prominent button. Add About in the footer. Use the public label “About” and the page title “The people behind SOCIALxBRAND PILOT.”

**Acceptance checks:** current-page states remain correct; no duplicate Contact link in the desktop list; no mobile overflow; page loads on direct URL; sitemap and breadcrumb paths are correct.

### C10. The homepage feedback section must not make the homepage feel bloated again

**Recommended solution:** once verified quotes are available, insert one compact section after Selected Work. Use two or three readable cards and a small section intro. Place no large carousel, giant slider, or separate animated scene there. If more reviews exist, link to `/feedback`; do not include the entire review archive on Home. If there are only one or two approved quotes, a separate page is unnecessary.

The homepage can then be: **Hero → Selected Work → Client Feedback → Services → How we work → Contact CTA → Footer.** This is one more short proof section, not a return to the old long scrolling experience.

### C11. The route/contact process is clear but remains a user-mediated handoff

**Evidence:** `/route` clearly says the user can message on WhatsApp, call, email, or optionally build a brief. It explicitly states the website does not automatically submit the brief. `src/lib/route/enquiry.ts` generates WhatsApp, mailto and clipboard output; it does not send the contact details to a server or CRM.

**This is not a bug if intentional.** It is transparent. But the agency will not receive a lead until the visitor actually sends the WhatsApp/email message.

**Recommended solution:** retain the direct contact methods; they are simple and useful. If reliable lead capture is required, add a short optional server-backed contact form (or reputable form provider/CRM) with success/error feedback, validation, spam protection, and a privacy notice. Do not add a fake “message sent” confirmation before the server confirms receipt. Do not add storage of names/emails until privacy/retention is defined.

### C12. Footer links and identity need a final owner-approved pass

**Evidence:** the footer provides email, phone/WhatsApp, website, navigation and the brand line. There are no active social profile links in the supplied content. “Visit” links back to the website the visitor is already using, so it has limited value.

**Recommended solution:** add official Instagram/LinkedIn/other relevant profiles once the owner supplies URLs and confirms that those profiles are active. Replace the redundant “Visit” item with useful verified information (e.g. About, social profiles, location/service coverage, or business hours), but only if it is true and useful. A branded mailbox can improve consistency, but only after the domain mailbox is configured and tested; don't break the currently working Gmail address before that.

---

# Part B — Performance findings and risks

## P0/P1 performance work

### P1. Hero capsule posters may still download in bulk

**Evidence:** `src/components/home/HeroPill.tsx` maps all `slides` to DOM nodes and renders a poster `<img>` for every slide. The video mount window is bounded to current/outgoing/next, but the poster `<img>` for all eight slides per capsule remains in the DOM. Every slide is absolutely positioned over the same capsule area; `loading="lazy"` is geometry-based and opacity alone does not reliably prevent the browser from considering an image near the viewport.

**Why this matters:** the previous tests prove that video element count stays bounded, not that poster image requests stay bounded. Two capsules may still prompt many small poster requests during first paint.

**How to verify:** on a production build, clear cache, load `/`, record image requests for hero poster files, and note how many requests occur before first interaction/after 1 second. Repeat with cache disabled and record transfer bytes. Also inspect decoded image count if tooling allows.

**Recommended fix if confirmed:** use the same sliding window for poster elements (current, outgoing, and next), or render one stable poster layer plus only the necessary transition layers. Keep a poster for every visible slide during the handover so no empty frame appears. Don't simply remove all posters or re-introduce video preloading.

**Regression test:** assert a bounded number of hero poster elements/requests in addition to the existing `≤3 videos per capsule` test.

### P1. Re-measure current performance after removing the long homepage sections

**Evidence:** the prior performance-fix report (`docs/reviews/performance-fixes-2026-10-15.md`) measured the older site. It reported load TBT/LCP as noisy/no improvement and 885 ms median TBT only in the post-phase report’s later measurement of that build. The client-first report records the new page height and successful tests, but does **not** provide a fresh post-refactor TBT/LCP/scroll comparison. Do not assume the older frame rate or TBT is the current value.

**Recommended solution:** run a production baseline on the current ZIP at `/`, `/work`, a media-heavy work collection (e.g. `/work/logo-identity`), `/capabilities`, a service detail page, `/approach`, `/route`, and `/about`/`/feedback` once created.

Measure:
- TTFB and document response time
- LCP and CLS
- Total Blocking Time/lab long tasks
- route click → first useful destination content painted
- frame gaps while scrolling the Home page and a media-heavy work detail page
- number of video/image requests and transferred bytes before/after scrolling
- console errors and failed asset requests

Run at real desktop dimensions and mobile dimensions, under both normal and throttled conditions. Use at least three consistent production runs and compare medians. A browser’s software-rendered headless draw/raster metrics are not real GPU FPS.

### P1. Large media library is a review point, not proof of over-downloading

**Measured from this ZIP:** `public/media` has 568 files, approximately **142.6 MB total on disk**:

| Asset type | Files | Approx. size |
|---|---:|---:|
| AVIF images | 198 | 9.3 MB |
| WebP images | 198 | 14.0 MB |
| JPG images | 43 | 3.6 MB |
| WebM videos | 43 | 41.7 MB |
| MP4 videos | 86 | 74.0 MB |

The MP4 count includes multiple derivatives/previews; it does not mean 86 independent clips are requested on one page. The generated manifest has 95 media assets (43 videos and 52 photos). **The 142.6 MB inventory is not the amount a visitor downloads.** Current lazy loading, `preload="none"`, the video playback budget, and poster variants reduce per-page transfer.

**Remaining check:** measure actual requests and bytes for each route. Prior reports show that `/work` scrolling no longer fetched previews while the pointer rested, and playback is limited to 3 desktop/2 phone decoders. Keep these wins. Optimize assets based on measured transfer/decode cost, not by deleting media indiscriminately.

### P1. Project detail pages mount all of that collection’s media elements

**Evidence:** `src/components/work/ScreeningMedia.tsx` maps all videos and photos for the selected collection into the DOM. The generated manifest’s larger collections contain up to 14 media entries (`logo-identity`), 12 (`portrait-fashion`), 11 (`wedding-photography`) and 10 (`family-celebrations`). The video budget caps active decoders, but the page still mounts all of the media elements/observers and all image markup for the collection.

**This is a measured-risk candidate, not a confirmed runtime bug.** Native lazy image loading and `preload="none"` already help, so do not implement complex virtualization unless traces show a problem.

**Recommended action:** profile the largest collection pages. If mount/hydration or observer setup is significant, keep the initial visible media immediately available and progressively mount below-the-fold groups only when approaching the viewport. Preserve the `aria` labels, anchor behavior, layout stability, and “no videos playing after navigation” guarantee.

### P1. Shared client-side infrastructure is loaded across every route

**Evidence:** `src/app/layout.tsx` wraps every route with `SmoothScroll`, `Nav`, `PointerFx`, `NavProgress`, and `DevWarmup`. `Nav` imports GSAP/ScrollTrigger and `Reel`; `SmoothScroll` imports Lenis and GSAP. The old reports found React hydration/commit and `ScrollTrigger.refresh()` to be a material part of earlier load blocking, but those values predate the short-homepage refactor.

**Recommended action:** do not immediately split or remove packages. First use a production bundle analyzer/Chrome Performance trace to understand current client JS and long-task attribution. If shared bundle/initialization remains large, simplify global `Nav` motion to CSS where practical, avoid pulling page-specific video/motion logic into the shared layout, and keep GSAP-heavy code only where it is needed. Measure after each change. No new animation library is warranted.

### P1. Global ScrollTrigger refresh must be re-tested on the new page layout

**Evidence:** `src/components/motion/SmoothScroll.tsx` schedules `ScrollTrigger.refresh()` after route transitions at about 520 ms, after fonts settle and at idle. Older reports found refresh cost varied by route and the old pinned Home scene needed remeasurement. The client-first refactor removed the pinned takeover and old long scenes; therefore older refresh-cost measurements no longer represent the same layout.

**Recommended action:** measure the refresh task on the current pages. Some work-detail pages still use scrubbed parallax in `ScreeningMedia`; the nav uses an `end: "max"` trigger. Keep the refresh if it is needed for correct geometry, but make sure it runs once per route and doesn't interrupt a visible interaction. If the refreshed page has no triggers needing geometry recalculation, skip it. Do not blindly remove the only refresh: test anchors, resize, back/forward and scroll progress first.

### P2. Work filter animation remains a small interaction cost

**Evidence:** `src/components/work/WorkIndex.tsx` uses GSAP Flip for changing the filter. The older post-phase report measured 110–129 ms longest task and did not find an improvement from the prior change.

**Recommendation:** keep Flip if it feels smooth on real devices. If a low-powered laptop visibly stalls during filter changes, add a simple transform/fade or immediate filter behavior for reduced-motion and/or lower-powered environments. Avoid spending time here before hero poster requests, real route timing and large detail pages are measured.

### P2. Page transition workaround needs cross-browser verification

**Evidence:** `src/components/layout/NoExitTransition.tsx` assigns a throwing own property to `document.startViewTransition` in an effect and deletes that property on cleanup. This deliberately pushes React to a no-transition fallback when leaving Home.

**Risk:** it is a global monkey-patch of a browser API. It is intentional but brittle if another script/polyfill uses an own property, or if React/browser behavior changes.

**Recommendation:** don't rewrite it merely because it looks unusual. Add/perform checks in a browser with native View Transitions and one without them, including Home → Work, Home → Services, navigation from the open menu, browser back/forward, reduced motion, and errors in the console. If issues appear, implement the no-exit behavior through a supported React/CSS transition mechanism rather than relying on a thrown exception, where possible. If retaining the patch, save and restore the exact previous own-property descriptor instead of unconditionally deleting it.

---

# Part C — Accessibility and interaction bugs

## A11Y-1. Mobile menu modal does not provide a conventional focus trap

**Evidence:** `src/components/layout/Nav.tsx` sets `role="dialog"` and `aria-modal="true"` on `#site-menu`; it focuses the first link and makes `#main` and the footer inert. It does not handle Tab/Shift+Tab to keep focus within the dialog, and the skip link/header controls remain outside the dialog in the focus order.

**Why it matters:** keyboard users can move focus to controls outside the declared modal while the menu is open, making the `aria-modal` behavior inconsistent.

**Fix:** implement a proper focus trap and restore focus on close, or use a well-tested accessible dialog implementation. If the header’s Close control is intended to remain available, include it deliberately in the modal interaction model and test with a keyboard and screen reader. Do not add a dependency unless the built-in implementation would be error-prone.

**Test:** open menu, Tab through every item, Shift+Tab backward, press Escape, click an internal link, navigate to another route, use browser back, and confirm focus never disappears behind the overlay and returns to a sensible element on close.

## A11Y-2. Verify the reduced-motion behavior of carousel previews

The `Reel` component offers play/pause for standalone reels when reduced motion is enabled, but suppresses the button for reels inside links. That is sensible for avoiding a nested button in an anchor, and `CardReel` claims poster-only behavior under reduced motion. Preserve that separation. Add a browser test confirming the hero capsules do not cycle/play under reduced motion and that media remains understandable as still imagery. Do not introduce a play button inside a linked work card.

## A11Y-3. Feedback and founder content must be accessible by default

When implementing the new sections/pages:

- Use real headings in order (`h1` then logical `h2`/`h3`).
- Do not use autoplaying testimonial carousels.
- Give founder photographs accurate alt text approved for the content.
- Ensure keyboard-visible focus and contrast for card links and buttons.
- Use decorative imagery with `alt=""` only when adjacent text communicates the same information.
- Testimonials must be text, not quotes embedded only in image assets.

---

# Part D — Recommended layout and content plan for Feedback + Founders

## Recommended homepage after adding feedback

Keep the refactored structure and add **one compact proof section** only when approved feedback exists:

1. **Hero:** clear what the agency does, with See our work and Explore services.
2. **Selected work:** four lead collections, clearly identified as selected examples/work collections until specific project facts exist.
3. **Client feedback:** two or three genuine quotes; link to more only if enough material exists.
4. **Services:** four groups; “Explore all services” leads to all 18.
5. **How we work:** four steps, with a link to the full process.
6. **Closing CTA:** Contact us.
7. **Footer.**

If no verified quotes are ready, keep the current homepage and don't show a blank feedback placeholder. Do not invent testimonials to fill the gap.

## Suggested Feedback content record

Each approved entry should have fields equivalent to:

- `id`
- exact `quote`
- `displayName` (or approved anonymous label)
- `role` and `business` only with permission
- `serviceOrProject`
- `date` (optional, if relevant)
- `sourceUrl` or internal source reference (internal-only verification if private)
- `permissionConfirmed` / publication status (do not output private admin data to the browser)
- `approvedAt` or owner sign-off in the content workflow

Do not add an aggregate star rating or `Review` schema unless the rating/review source, permissions, and structured-data conditions are genuinely met. A plain quote card is enough; don't optimize for review markup before the source is trustworthy.

## Founder/About page brief

**Public route:** `/about`  
**Navigation label:** About  
**Page H1:** “The people behind SOCIALxBRAND PILOT”

Recommended order:

1. Hero with approved founder portrait(s), name(s), actual roles, and a one-line description of the agency’s purpose.
2. The real origin story: why the founder(s) started the agency and whom they wanted to help.
3. Vision for clients, in everyday language.
4. What founder(s) personally take responsibility for (only if true).
5. Relevant experience/skills and how the agency approaches decisions.
6. How a client works with the founder(s), including actual communication/approval/reporting practices if confirmed.
7. A small selected-work reference, no large duplicate portfolio grid.
8. Contact CTA.

Avoid a page of generic brand adjectives. The strongest founder page is specific and personal without making unverifiable claims. A professional portrait and a clear “why” are more persuasive than an additional animation.

## Owner information needed before implementation

The AI must ask for or record missing details rather than filling blanks. Gather:

### For founders
- How many founders, their exact public names, preferred display names, roles and pronouns if they wish to share them.
- An approved portrait for each person and permission to publish it.
- A short founder-written or founder-approved biography.
- Why SxBP was created, in the founders’ actual words.
- The final vision statement for clients.
- Relevant experience/skills that can be verified and disclosed.
- What the founder personally handles vs what partners handle.
- Approved public social profiles.

### For feedback
- The exact quote/feedback and where it came from.
- Client name, role and business name (or permission for approved anonymous attribution).
- What service/project it relates to.
- Date/context if appropriate.
- Written permission to publish the exact quote and attribution.
- Whether the feedback contains measurable results—and records supporting them, if included.

### For projects and services
- SxBP’s own role per work collection and what the partner did.
- Which collections correspond to an individual client project vs a category/montage.
- Approved client attribution, objectives, deliverables, period and measurable results.
- Which of the 18 services SxBP currently offers, typical scope, exclusions, dependencies, revision rules, reporting and price approach.

---

# Part E — Phased implementation plan for Claude Code

**Work in one phase at a time. Stop at each checkpoint for the owner’s review.** Do not let the model fabricate missing source information.

## Phase 0 — Read-only inventory and current baseline

1. Inspect this exact current repository and `docs/reviews/client-first-refactor-2026-10-16.md`.
2. Confirm current routes, work data, service data, feedback/founder asset availability, and existing tests.
3. Do not change code.
4. Produce a table of findings labelled Confirmed / Likely / Needs real-device or browser trace.
5. If founder/testimonial content is missing, ask for it; don't create fake placeholders in production.
6. Get current production build measurements from the owner’s environment if dependencies cannot be installed here.

**Checkpoint:** approve content scope and measured issues before coding.

## Phase 1 — Correct client-facing terminology and portfolio taxonomy

1. If work records remain collection-level rather than project-level, replace visible “Project” labeling with “Work collection”/“Selected example” where appropriate.
2. Make format filtering use explicit data tags and cover mixed-format work correctly.
3. Improve work-detail alt text only where accurate descriptions can be supplied.
4. Make the 404 copy plain and helpful.
5. Do not change asset ordering, URLs, slugs, or partner credit unless the owner approves the data change.

**Checkpoint:** test all 14 work routes and all three filters.

## Phase 2 — Feedback component (only from approved testimonials)

1. Create a typed content file for genuine approved feedback.
2. Render a compact static section on Home after Selected Work.
3. Hide the section cleanly when there are no approved entries.
4. No autoplay, no invented star ratings, no fake clients, no fake results.
5. Optionally implement `/feedback` only if the owner has enough useful content for an archive.
6. Ensure quote approval, proper attribution, responsive layout, and accessible semantics.

**Checkpoint:** owner verifies every quote and attribution before public exposure.

## Phase 3 — Founder/About page

1. Create `/about` with only owner-provided facts and approved photos.
2. Add title, description, canonical URL, breadcrumb JSON-LD, sitemap entry, and sensible `AboutPage`/`Person` structured data only for confirmed facts.
3. Update desktop nav and full/mobile menu without crowding the header; use the brand logo as Home.
4. Add About to the footer.
5. Ensure image optimization, explicit dimensions, responsive crop, alt text, and no layout shift.

**Checkpoint:** founders approve names, descriptions, vision, roles, photos and public profiles.

## Phase 4 — Make service pages actionable

1. First get owner-confirmed service availability and engagement scope.
2. Rework “What’s included” vs “Possible deliverables” so the wording is not mistaken for a universal package.
3. Add standard inclusions/exclusions only where agreed.
4. Improve plain-language service summaries; retain specialist terms in secondary detail if necessary.
5. Do not publish unapproved prices, turnaround times, guarantees, or reporting promises.

**Checkpoint:** owner approves every service scope and pricing statement.

## Phase 5 — Performance profiling and narrowly scoped fixes

1. Run production measurements for Home, Work index, large Work detail, Services index, service detail, How we work, Contact, and new About/Feedback routes.
2. Measure hero image requests and bytes to see whether the overlapping capsule posters are over-fetched.
3. Profile work detail pages with the most media.
4. Measure click-to-visible navigation and the current `ScrollTrigger.refresh()` task.
5. Only fix bottlenecks confirmed by traces.
6. Preserve the playback budget, `preload="none"` previews, reduced-motion support, CLS stability and no-media-playing-after-navigation behavior.
7. Do not add an animation library.

**Checkpoint:** show before/after medians, test results, and remaining limitations.

## Phase 6 — Accessibility, SEO and regression

- Keyboard navigation and focus for menu/dialog.
- Reduced motion across all routes.
- Alt text review for work assets and founder images.
- No broken links or route regressions.
- Correct canonical metadata, breadcrumbs and sitemap for new pages.
- Mobile 360×800, 390×844, tablet 768×1024, desktop 1280×720 and 1440×900.
- Check console errors, failed requests, horizontal overflow, layout shifts and navigation/back-forward.
- Ensure public pages contain no empty placeholder cards or fabricated content.

**Checkpoint:** don't call the site complete until checks pass and the client-understanding test has been done by someone unfamiliar with the agency.

---

# Part F — Negative prompt for Claude Code

Paste the following into Claude Code before starting implementation:

> **STRICT SCOPE AND EVIDENCE RULES**
>
> You are editing the existing SOCIALxBRAND PILOT repository. Do not redesign the website from scratch. Preserve the current visual identity, typography, colors, spacing system, URLs, route slugs, content structure, media pipeline, and existing performance wins unless a specific approved task requires a change.
>
> **Do not invent or hallucinate:** founder names, founder backgrounds, qualifications, years of experience, client names, testimonials, quotes, star ratings, awards, metrics, business results, pricing, location, team size, response times, deliverables, guarantees, or partner roles. If any required information is missing, stop and ask the owner or record it as a content dependency. Never insert placeholder quotes or fake profiles into the public build.
>
> **No random work:** don't add unrelated sections, blogs, animations, packages, UI libraries, CRM integrations, forms, analytics, tracking pixels, or visual effects unless explicitly approved. Don't rewrite all 18 service descriptions as generic marketing copy. Do not remove pages or change URLs just to simplify the menu. Do not change logo/font assets or the brand palette.
>
> **Performance safety:** do not replace GSAP/Lenis, install Framer Motion or another animation library, remove the video budget, set every video to preload auto, or optimize based on assumptions. Profile first; make the smallest change that addresses a measured bottleneck. Keep reduced-motion support and ensure every animation/video is cleaned up on route changes.
>
> **Implementation rules:** start read-only, list exact files and evidence, then implement only the approved phase. Change as few files as practical. Keep TypeScript types strict. Preserve all valid internal links and service/work slugs. Do not report tests as passed if they were not run. Do not claim a performance gain without before/after results from comparable production runs.
>
> **Required end-of-phase report:** list files changed, exact behavior changed, tests actually run and results, visual screenshots/viewport sizes checked, performance before/after measurements if relevant, known risks, and owner-provided content still missing. Do not start the next phase without approval.

---

# Final priority list

| Priority | Item | Why it comes first |
|---|---|---|
| P0 | Get actual founder facts/photos and approved client feedback | Needed to build credible trust sections without inventing content |
| P0 | Correct Work collection vs Project representation | Prevents the portfolio from implying case-study proof that is not present |
| P0 | Confirm the real scope/availability of the 18 services | Helps prospects understand what the agency can actually sell and deliver |
| P1 | Add a compact, static feedback section on Home | Adds third-party trust while keeping the homepage short |
| P1 | Add `/about` and link it from nav/footer | Makes the people and vision behind the agency discoverable |
| P1 | Fix mixed-format Work filters and alt text | Improves discovery and accessibility |
| P1 | Verify hero capsule poster request volume | The existing test checks video elements, not poster request count |
| P1 | New production performance baseline on this layout | Earlier measurements came from previous layouts/builds |
| P1 | Fix/verify mobile menu modal focus behavior | Accessibility and keyboard reliability |
| P2 | Replace metaphorical 404 copy and improve footer utility | Helps visitors recover and navigate naturally |
| P2 | Consider a server-backed lead form if the business needs direct lead capture | Removes the manual app hand-off but adds privacy/maintenance responsibility |

## What “done” should mean

A business owner unfamiliar with SxBP can answer these questions without calling the agency just to understand the website:

1. What does the agency do?
2. Which services might fit my goal?
3. What kind of work has the agency actually produced?
4. What role did SxBP play in that work?
5. What will I typically receive, and what still needs to be scoped?
6. Who founded the agency, why does it exist, and who will I work with?
7. What have real clients said, with permission and honest attribution?
8. How do I make contact, and what happens after that?

The website does not need a larger number of sections to answer these questions. It needs specific content, trustworthy evidence, clear labels, and a low-friction path to contact.
