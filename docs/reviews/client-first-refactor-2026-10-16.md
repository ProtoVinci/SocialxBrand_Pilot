# Client-first layout refactor: report, 2026-10-16

Source brief: `docs/briefs/archive/SocialxBrand_Client_First_Layout_Refactor_Plan.md`. Starting point: commit `a8cdd53`. Nothing is committed.
No dependency was added or removed. All URLs, slugs, the 18 service routes, the 14 work routes, SEO metadata, breadcrumbs (visible and JSON-LD) and reduced-motion support stay.

## Owner decisions taken (2026-10-16)

- **Service groups:** the plan's four groups. Presentation only: each service keeps its page, slug, PDF wording and `cluster` field.
  - Strategy & social media (4)
  - Content & creative production (7)
  - Reach & enquiries (3)
  - Creators, community & digital tools (4)
- **Lead projects:** business-first. Restaurants & Hospitality, Brand & Business Films, Creator Content, and Menus/Posters/Festive Creatives (`featuredWork` in `src/content/work.ts`).
- **Hero:** keep the headline and capsules; remove the pinned takeover/manifesto scene and the tools orbit.
- **Pace:** all phases in one pass, one report.

## What changed, by phase

### 1. Language and navigation

- **Navigation, mobile menu and footer** now read Home · Work · Services · How we work · Contact us.
- **The bar's button** says "Contact us" (it was "Start your route").
- **Breadcrumbs, page labels, metadata titles and "where next" cards** use the same words.
- **Footer:** a short contact strip ("Talk to us about your business.") instead of the closing manifesto. The brand line "We will show, you will grow." moves to the bottom row.
- **Project brief (`RouteBuilder`):** "brief" and "services" instead of "route" and "divisions".
  - Choosing services is now optional ("Not sure yet? That's fine…").
  - Services are grouped in the four new groups.
  - The brief text says "Services we're interested in", or "not sure yet".

### 2. Home: hero → selected work → service groups → four steps → one closing call to action → footer

| Section before | Now |
|---|---|
| Hero + pinned takeover/manifesto (230% scroll) + tools orbit | **Hero kept** (headline, capsules, glare, intro curtain). Buttons: "See our work" and "Explore services". No scroll scene, no orbit. |
| Ladder (340svh philosophy scene) | Removed |
| WorkShowcase (looping panel of 10 tiles) | **Selected work**: the 4 owner-chosen projects as cards (title, category, format, "View project"), "View all work", partner credit. Each card's clip plays muted and looping while on screen (shared budget: 3 at once on desktop, 2 on a phone; 360p clips on phones). The Menus/Posters card is photos only, so it shows a still. |
| Marquee (slogan band) | Removed (the slogan is now in the footer) |
| DivisionBoard (18 chips + tour) | **Four service-group cards**, each with a summary and a few services, plus "Explore all services" |
| MethodBoard (7 stations, 400svh) | **Four steps**: Understand your business · Plan the right approach · Create and execute · Review and improve (the 7 method stages grouped; `steps` in `site.ts`) |
| Audiences tabs | Removed (the audience types are still the brief's first step) |
| AiAmplifies | Moved to the AI Marketing & Automation service page |
| Finale (giant closing) | **One closing CTA**: "Have a project in mind?" → Contact us |

Page height at 1440×900 went from 15233px to 4836px.

### 3. Work

- **Index:**
  - Label "Work", heading "Selected work.", and the plan's plain intro. The "not invented case studies" sentence is gone.
  - The partner credit stays.
  - Filter "All work" (was "Everything").
  - The owner's four lead projects come first.
  - Cards show title, "category · format" and "View project"; the piece count is gone.
- **Project page:**
  - A "Project overview" with type of work, production partner (Vishay Creations) and related services. The piece count is gone.
  - "Next project" (was "Next screening").
  - Nothing new is claimed: SxBP's role, the client, objectives and results are not in the records, so they are not shown.

### 4. Services

- **Index:**
  - "Our services." and the plan's intro line.
  - The four group cards, which jump to their group.
  - A plain directory of all 18 services (name plus each service's own one-line description).
  - "Not sure what you need?", with Contact us and an optional brief.
  - The cursor-following video previews, the ticker and the add-to-route toggles are gone.
- **Each of the 18 service pages follows the same order:**
  1. Name and its own summary, with "Discuss this service" (pre-fills the brief and opens Contact) and "See relevant work".
  2. What this service helps with.
  3. What's included: 6 deliverables shown, with "See the full scope" holding every capability group, all deliverables and the service's own process.
  4. Relevant work.
  5. How we work: the shared four steps.
  6. "Not the same as …" on the 10 look-alike services, quoting the other service's own description.
  7. Related services.
  8. Quiet previous/next links.
- **The decorative service number** is faint background now. The "N stations" counter and the boarding-pass deck are gone.

### 5. How we work and Contact

- **`/approach` ("How we work.")** now holds:
  - a plain intro (from `servicesIntro`);
  - the four steps, each listing the method stages behind it;
  - "What we stand for": the impact line plus three existing differentiators;
  - selected work and the next steps.
  - Removed: mission/vision cards, the principle stack, personality, the full differentiator list, MethodBoard, Audiences, AiAmplifies and Finale.
- **`/route` ("Contact us.")** now holds:
  - WhatsApp, Call and Email as three large cards at the top, for every screen size;
  - "Build a project brief", marked optional, which says exactly what happens: "At the end, choose WhatsApp or email to send the brief, or copy it. The website does not submit the message automatically."

### Removed files

These are no longer used anywhere: `Ladder`, `Marquee`, `MethodBoard`, `Audiences`, `Finale`, `WorkShowcase`, `DivisionBoard`, `DivisionIndex`, `DivisionTicker`, `ApproachRoute`, `PrincipleStack`, `ToolsOrbit`, `SpinBadge`, `RouteToggle`, `lib/previews.ts` and `lib/gsap-drawsvg.ts`. Their unused CSS is gone too. All of them are in git history (`a8cdd53`) if any piece is wanted back. Content in `site.ts` (mission, vision, principles, personality, ladder…) is kept.

### New files

- `src/content/service-groups.ts`: the four groups, and the look-alike pairs.
- `src/components/sections/` (`SelectedWork`, `ServiceGroups`, `ProcessSteps`, `ClosingCta`).
- `src/lib/category-line.ts`.

## Checks

- `npx tsc --noEmit`, `npx eslint src tests` and `npm run build` (43 pages) are clean.
- **Playwright, production build, 1 worker:** 57 passed, 0 failed, 39 skipped by design. The dev-only leak test passed against `next dev`.
- **Removed tests** (each tested a feature that no longer exists): #9 DivisionTicker, #5 showcase tiles, #2 takeover reel, #7 home DivisionBoard, #6 DivisionIndex preview, perf #1 takeover, audit §5 MethodBoard.
- **Retargeted tests:**
  - #23 AV1 now runs on a project page.
  - #10 AI pairs now run on the AI service page.
  - The leak test now uses the home sections.
  - The contact page test checks the new layout.
  - The brief tests use the new labels.
  - The reduced-motion test checks the new home sections.
- **New tests:**
  - First screen leads to Work and Services, and Home has five sections.
  - All 18 services are listed, and every service page follows the pattern.
  - No internal terms on the visible pages.
  - Services are optional in the brief.
  - Contact methods sit above the brief.
- **`check-flow`:** passes on all routes. Its journey now uses "View all work" instead of the removed disc.
- **`check-shift`:** CLS 0.0000 on every route at 1440, 768 and 390. Home at 768 was 0.0148 before.
- **Full-page screenshots:** 7 routes at 1440×900, 1280×720, 768×1024, 390×844 and 360×800 show no horizontal overflow and no console errors. Fixed after review: a repeated "Graphic Design · Graphic design" line, and the brief's step labels colliding on phones.

## Owner input needed (not published; nothing was invented to fill these)

1. **Selected projects:** for each lead project, SxBP's own role (vs Vishay Creations), what was delivered, permission to name the client, the objective, and any approved results.
2. **Work groups:** whether to add "Business & brand" vs "Events & personal" filters on `/work`.
3. **Services:** which of the 18 are actively offered today, and their standard inclusions and exclusions (especially social media management, content production, paid media and reporting).
4. **Look-alike services:** the "Not the same as" boxes quote each service's PDF description. A one-line contrast written by the owner would be clearer.
5. **Working relationship** (for How we work): approvals, revisions, reporting and meeting practices.
6. **Pricing or starting ranges,** if they can be public.
7. **FAQs** for service pages: client-approved questions and answers.
8. **Domain and social links:** confirm the canonical domain and contact channels, and the official social profile URLs.
9. **Testimonials,** if any, with permission.
10. **Hero copy:** the plan's draft headline ("Make your business easier to discover, trust and choose.") was not used; the existing headline stays unless the owner chooses otherwise.

## Limits

- The client-understanding acceptance test (plan §12) needs a person who doesn't know the agency; it hasn't been run.
- Real phone and laptop rendering was not checked (headless screenshots only).
