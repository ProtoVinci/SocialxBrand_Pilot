> **Historical reference.** Completed; what was done is in [docs/reviews/client-first-refactor-2026-10-16.md](../../reviews/client-first-refactor-2026-10-16.md). For current decisions use [HANDOVER.md](../../../HANDOVER.md) and the latest brief in [docs/briefs/](../).

# SOCIALxBRAND PILOT — Client-First Website Layout Refactor

**Purpose:** simplify the whole website so a first-time, non-technical prospective client can quickly understand what SOCIALxBRAND PILOT does, see relevant work, understand the services and what they include, and know how to make contact — without needing the agency owner to explain the site.

**Scope:** content hierarchy, page structure, plain-language labels, navigation, service discovery, portfolio presentation, and responsive layout. This is not a request for a new visual identity or another performance refactor.

**Repository reviewed:** `SocialxBrand_Pilot(4).zip`, particularly `src/app/*`, `src/components/home/*`, `src/components/work/*`, `src/components/capabilities/*`, `src/components/approach/*`, `src/components/route/RouteBuilder.tsx`, `src/components/layout/*`, `src/content/site.ts`, `src/content/divisions.ts`, `src/content/work.ts`, `README.md`, and `HANDOVER.md`.

---

## 1. The main diagnosis

The site has a distinctive brand and a substantial library of real creative work. The problem is that the information architecture currently serves the agency's creative concept more than the first-time client's buying journey.

A prospective client needs to answer these questions in this order:

1. **What does this agency do?**
2. **Can I see work relevant to my business?**
3. **What services can I hire it for?**
4. **What would I receive if I hire it?**
5. **How does the process work?**
6. **How do I get in touch?**

The redesigned website should make these answers easy to find, in ordinary language, without needing to understand the site's internal terminology.

### Verified layout/content problems in the current source

- The home page composes `Opening`, `Ladder`, `WorkShowcase`, `Marquee`, an 18-division `DivisionBoard`, `MethodBoard`, `Audiences`, `AiAmplifies`, and `Finale`. That is too many major narrative sections for a first-time visitor who primarily wants to understand services and see work.
- `Ladder` is a long scroll-led philosophy scene (`340svh` in its motion-enabled layout). It explains the marketing progression “Seen → Remembered → Trusted → Chosen → Moving forward”, but a visitor should not have to scroll through a large cinematic section to reach the offer.
- `MethodBoard` is another long, pinned/scroll-driven presentation (`400svh`) for seven process stages. A simpler four-step process can communicate the useful information faster.
- The home page then presents all 18 services in `DivisionBoard`, followed later by another explanation of the process, audience tabs, an AI marketing philosophy, and a separate large closing CTA.
- `ApproachPage` repeats `MethodBoard`, `Audiences`, `AiAmplifies`, and `Finale` while also containing who-we-are copy, philosophy/outcome cards, mission/vision, a six-principle section, personality traits, and eight differentiators. These overlap and make the page much longer than it needs to be.
- The 18 services are currently called “divisions” and sometimes “stations”; the portfolio is described as “screenings”; the contact flow is branded “Pilot Route”. These terms are meaningful internally but make the site harder for a new client to understand.
- The Work page headline is “The work, as it was made.” Its paragraph explains that the site shows categories rather than invented case studies. This is honest, but it sounds defensive and doesn't help a client navigate to the most relevant kind of work.
- The work index cards mostly show project/category title, format/kicker and media count. Individual work pages are largely a title, a short description, partner credit and a media gallery. They need clearer project context and accurate attribution where the agency owner can supply it.
- The services index uses the 18-item list, hover/cursor media previews, and a route toggle on every row. The large service list is not organized first around a plain-language client problem.
- Individual service pages can contain many groups and chips, a long deliverable list, a separate process presentation, work, related services, previous/next navigation and contact choices. Some pages may therefore feel like a catalogue of internal capability rather than a simple answer to “Is this the service I need, and what do I get?”
- `RouteBuilder` is a five-step, branded lead-brief flow. The code says that details are not submitted or stored by the website; the visitor must choose WhatsApp, email, or copying the brief. It should be optional, not the only obvious way for a prospective client to move forward.

### Important distinction

The README screenshots are design/reference captures and may not exactly match the latest running build. Use the current source files as the source of truth for labels and current component behavior. Do not treat a stale screenshot as proof that a current UI label is still present.

---

## 2. The target website experience

Keep the recognizable SxBP identity: logo, type, warm background, red/blue palette, grid details, and selected use of real work footage. Reduce the number of competing ideas. Make the design feel confident because it is clear — not because every section has a new interaction.

### New primary navigation

Use plain, familiar labels:

- **Home** → `/`
- **Work** → `/work`
- **Services** → `/capabilities`
- **How we work** → `/approach`
- **Contact us** → `/route`

Use the same labels consistently in the desktop nav, mobile menu, footer, breadcrumbs, CTAs and “where next” links. The prominent navigation CTA should say **Contact us** or **Discuss a project**, not “Start”, “Start your route”, or “Pilot Route”.

The `/route` path can remain unchanged internally. This is a copy/layout change, not a URL migration.

### Replace internal agency language in public UI

| Current/internal phrase | Client-friendly phrase |
|---|---|
| Capabilities | Services |
| 18 divisions | 18 services, shown under 4 service groups |
| Division | Service |
| Screening / next screening | Project / next project |
| Pilot Route / Plan your route | Project brief / Discuss a project |
| Station(s) | Step(s) |
| What it is | What this service helps with |
| What it covers | What’s included |
| Key deliverables | What you can receive |
| Often combined with | Related services |
| Approach | How we work, where used as a nav label |
| Build a route | Build a project brief |

Brand language can still appear as a light accent, but never at the expense of clarity. If a branded phrase is retained, immediately explain it in plain words.

---

## 3. New homepage structure — five sections maximum before the footer

The homepage should be a short orientation page, not the full company profile. It must explain the offer, show work, introduce services, explain the process, and give a clear next step.

### Section 1 — Clear hero

**Goal:** within a few seconds, a visitor should understand that SxBP is a digital marketing agency, see the broad type of work, and know where to click next.

**Suggested copy direction** (draft for owner review; keep aligned with the actual service scope):

- Eyebrow: `Digital marketing for businesses`
- H1: `Make your business easier to discover, trust and choose.`
- Supporting line: `SOCIALxBRAND PILOT helps businesses plan their digital marketing, create relevant content, and bring the right services together around their goals.`
- Primary CTA: `See our work`
- Secondary CTA: `Explore services`
- Keep a clear `Contact us` action in the global navigation.
- The existing “We will show, you will grow” line can remain as a brand statement lower on the page or in the footer, rather than doing all the explaining itself.

**Layout changes:**

- Keep the strong headline and selected real media, but do not put so many moving/decorative objects around the primary message that the text is hard to scan.
- Remove the live time/IST badge from the hero unless it has a demonstrated business purpose.
- Simplify the tools orbit; it is decorative and does not explain a service to a client. Remove it from the first screen or move it to a less prominent location.
- Reduce the media capsules to a deliberate visual accent. The main headline must still read cleanly when the clips are paused, loading, or motion is reduced.
- Ensure both CTA labels explain their destination without using internal brand terminology.
- The first screen must make sense on a phone without relying on hover, animation, or an autoplaying video.

### Section 2 — Selected work

**Goal:** give prospective clients immediate proof of creative capability.

- Place selected work immediately after the hero.
- Use **3–4 curated project cards**, not a continuously looping presentation of ten tiles.
- Each card needs a recognizable thumbnail, plain project title, simple category and a link to the full project page.
- Candidate categories already present in the repository include Restaurants & Hospitality, Creator Content, Brand & Business Films, Menus/Posters/Festive Creatives, Logo & Identity, Theatre & Culture, Wedding/Pre-Wedding Films and Photography. The business owner must decide which projects to lead with based on the clients they want; do not silently pick the “best clients” or invent project results.
- If business/social-media clients are the target, lead with relevant business work and keep weddings, family celebrations and personal work accessible in the archive under a clear category, rather than letting those projects define the first impression.
- CTA: `View all work`.
- Remove the defensive phrase “We show categories, not invented case studies” from the main sales flow. Keep the site honest by clearly labeling the content `Selected creative work`, accurately crediting partners, and only adding verified project context.

### Section 3 — Services at a glance

**Goal:** help the client find the type of help they need without reading 18 items first.

Show four service-family cards, each with a short, non-technical explanation and example services. Keep all 18 individual services discoverable on the full Services page.

Recommended initial grouping (validate the names and membership against the agency’s real offer):

1. **Strategy & social media** — Strategy & Consulting; Social Media Marketing; Social Media Management; Content Marketing.
2. **Content & creative production** — Content Creation; Graphic Design; Video Production; Video Editing & Animation; Photography; Branding & Brand Identity; Creative Advertising & Campaigns.
3. **Reach & enquiries** — Performance Marketing; SEO & Local SEO; WhatsApp Marketing.
4. **Creators, community & digital tools** — Creator / Brand Growth; YouTube & Video Marketing; Reputation, PR & Community; AI Marketing & Automation.

Every card should answer: “What kind of help does this group offer?” Use one short paragraph, a few example services and a link to the service group or full service directory.

Do not show all 18 service names as the main visual centerpiece on the homepage. Replace the home page’s 18-service `DivisionBoard` with four readable cards and a single `Explore all services` CTA.

### Section 4 — How we work

Replace the long seven-station `MethodBoard` on the homepage with a compact four-step explanation, readable in one screen or one short scroll:

1. **Understand your business** — goals, audience and current needs.
2. **Plan the right approach** — select services that match the objective.
3. **Create and execute** — produce the agreed work and carry out the plan.
4. **Review and improve** — understand what is working and refine next steps.

These consolidate the existing Understand, Strategize, Create, Execute, Measure, Optimize and Grow method. Preserve the underlying meaning without making visitors navigate a seven-step animation.

Use simple numbered columns/cards or a clean vertical list. No pinned scroll scene, split-flap presentation or long animation is required to understand the process. Link to `How we work` for visitors who want detail.

### Section 5 — One clear closing CTA

Use one simple section with a human title, short statement and one primary CTA:

- Heading: `Have a project in mind?`
- Support: `Tell us what your business needs help with. We’ll use that context to start the conversation.`
- CTA: `Contact us` or `Discuss a project`.

This should replace the need for a separate giant Finale plus another independent CTA further down. The global footer already provides contact details; avoid repeating the same message multiple times.

### Remove from the homepage or relocate

- **Ladder philosophy scene:** remove as a large pinned section. Its insight is optional brand philosophy, not a required conversion step. If retained, use a short static statement on `How we work`.
- **Marquee:** remove if it merely repeats the brand slogan. Repeated slogans consume space without adding service clarity.
- **18-service interactive board:** replace with four service-family cards and a link to Services.
- **Seven-step MethodBoard:** replace with four simple steps as above.
- **Interactive audience tabs:** remove from the homepage. If audience types are commercially useful, use a compact row or a dedicated audience section later on Services, not a large interactive scene.
- **Standalone AI philosophy section:** move it into the AI Marketing & Automation service page. It is too specialized to be a major homepage section unless AI is a primary acquisition offer approved by the owner.
- **Separate giant Finale:** combine with the one closing CTA.

**Result:** hero → selected work → service groups → four-step process → closing CTA → footer.

---

## 4. Work index (`/work`) — make the portfolio browsable and useful

### New page opening

- Label: `Work`
- H1: `Selected work`
- Supporting copy: `Explore video, photography and design created for businesses, brands and events.`
- Do not lead with explanations of what the agency has not published. Mention the work is a selection of creative projects only if that helps set expectations, in neutral language.
- Move production partner credit to a clear, accurate place where the relationship is understood; do not imply the agency performed work that belongs to a partner.

### Project browsing

- Keep a simple filter row with human-readable labels such as `All work`, `Reels & films`, `Photography`, `Design & identity`. Avoid a large animated filter system that distracts from the work.
- Group or tag projects so a business prospect can find relevant work quickly.
- Consider a clearly labeled `Business & brand content` group and an `Events & personal work` group if the owner confirms those distinctions reflect the portfolio. This keeps all real work available while allowing commercial prospects to prioritize the relevant material.
- Each card should show the project title, category, format and a clear `View project` affordance. Media count alone is not a meaningful client decision point; it may remain as quiet metadata but should not be a primary label.
- Ensure the first row contains the most relevant and strongest approved work, selected by the owner rather than guessed by the AI.

### Individual project page (`/work/[slug]`)

Keep the visual gallery, but add a compact **project overview** near the beginning. Use only information supported by the project record or explicitly provided by the owner.

Recommended fields (optional when verified; hide fields that have no approved value):

- Type of work / format.
- What was created (accurate deliverable description).
- SxBP’s role.
- Production partner or collaborator credit, when applicable.
- Related services involved, using existing service links.
- Project objective or outcome **only when actually known and approved**.

Use a readable order: title and short intro → project overview → featured piece/gallery → related services → next project/contact CTA.

Do not invent a client, campaign brief, objective, results, metrics, dates, revenue figures, testimonial or responsibility split. Add content fields to `src/content/work.ts` only when owner-approved facts are available. If a field is missing, omit it gracefully rather than displaying fake filler.

---

## 5. Services index (`/capabilities`) — show the offer in client language

### Page purpose

The Services page must help a visitor choose a service area without knowing the agency's internal operating model.

### New layout

1. Simple page header: **Services**.
2. One short paragraph: `You do not need every service. Start with the goal you want to work on and explore the services that may fit.`
3. Four service-family cards, using the groups described in Section 3.
4. A compact `All services` directory showing all 18 current services, grouped under plain-language headings.
5. A short “Not sure what you need?” prompt with an optional project brief/contact link.
6. Footer/next step.

### What to simplify

- Remove the animated `DivisionTicker` from the primary reading path if it adds motion without useful information.
- Remove cursor-following video previews from the services list; previews are decorative and make a list harder to scan. Use one relevant static thumbnail per group at most, not a new video preview as every row is hovered.
- Avoid showing a route-toggle beside every service row. The user does not yet know what all the services mean. First help them understand the service; offer an action on the detail page.
- Replace service families such as “Strategy & Creative”, “Direct Marketing”, and “Growth, PR & AI” with labels normal people can understand. Preserve the 18 underlying routes and content; this is a presentation-layer grouping, not a destructive merge.
- All 18 services must remain accessible; do not hide less-prominent services from navigation/search indexing.

### Service family summaries

Keep each description concise (one or two sentences). Do not use broad claims such as “guaranteed growth”, “best agency”, “expert in every industry” or specific outcomes unless verified.

---

## 6. Individual service pages — answer “Is this right for me?”

The 18 existing detail routes can remain. Standardize their structure so clients do not have to learn a new layout for every service.

### Recommended order

1. **Service title + plain-English summary** — explain what the service does and the kind of need it addresses.
2. **What this service can help with** — a short, relevant explanation from the existing service copy.
3. **What’s included** — show about 4–6 representative deliverables in a concise list or visual grid. Do not place every possible subtask and platform in a wall of tags above the fold. A longer comprehensive list may live in a `See full scope` disclosure if it is genuinely useful.
4. **Relevant work** — show the best-matched real projects that exist in `relatedWork`.
5. **How the engagement works** — use the same shared four-step process as the rest of the site; keep unique technical details secondary.
6. **Related services** — a small number of meaningful links, using plain-language titles.
7. **Questions clients commonly ask** — add only questions and answers that the owner can answer truthfully. Useful questions to collect include what is included, whether management/publishing is included, what the client must provide, how success is measured, and which costs fall outside the service.
8. **One primary CTA** — `Discuss this service` or `Contact us`; one secondary link to relevant work.

### Distinguish overlapping services clearly

Some current services are close enough in wording that a client may not understand why they are separate, notably:

- Social Media Marketing vs Social Media Management.
- Content Marketing vs Content Creation.
- Video Production vs Video Editing & Animation.
- Branding & Brand Identity vs Graphic Design.
- Performance Marketing vs SEO & Local SEO.

The copy should explain the difference with simple, truthful contrasts. For example, explain strategic campaign direction separately from day-to-day account/content management, and content planning separately from producing the actual assets. Validate every distinction against what SxBP actually sells before publishing. Do not merge services just to make the layout easier.

### Remove or demote

- Huge service-number typography should be decorative background only, not compete with the service name.
- “N stations” process counters are not useful client information; replace with the shared short process.
- Avoid several simultaneous actions such as a route toggle, plan-route link, related-service toggles and an unrelated primary CTA. Use one clear action to discuss the service and one link to see relevant work.
- Keep previous/next service links quiet and secondary, or remove them if they encourage browsing the catalogue instead of understanding the current service.

---

## 7. How we work page (`/approach`) — shorter, practical, non-repetitive

The current page stacks who-we-are copy, a positioning quote, philosophy outcomes, mission/vision, the long MethodBoard, principles, personality traits, differentiators, audience tabs, AI philosophy and another CTA. It repeats multiple homepage components. This is unnecessary for a prospect trying to understand how a project proceeds.

### New four-part page

1. **Opening:** `How we work` plus a short, plain introduction to business-first marketing.
2. **Four steps:** understand the business → agree the plan → create and execute → review and improve.
3. **What to expect from a working relationship:** describe planning, approvals, deliverables, communication and reporting only after the owner supplies the real working practices. Do not promise a response time, revision count, meeting schedule or report cadence that has not been agreed.
4. **Selected work + contact CTA:** give visitors an example and a clear next step.

### What to remove from this page

- The duplicate seven-step `MethodBoard` scene.
- Duplicate `Audiences`, `AiAmplifies`, and `Finale` components.
- Separate mission and vision quote cards unless the owner strongly wants them as a small brand statement.
- Repeating six principles and eight differentiators when many express the same idea. If needed, summarize the strongest two or three in a compact list, using existing approved statements.
- Multiple versions of the claim that SxBP is business-first, growth-driven, creative, tailored, and future-ready. Say it clearly once and demonstrate it with process and real work.

This page should be a practical explanation, not a second homepage.

---

## 8. Contact / project brief (`/route`) — do not force every visitor through the wizard

The five-step RouteBuilder is currently a lead-brief tool, not a backend form submission. Its own copy says details are not stored or sent by the site and that the visitor has to use WhatsApp/email or copy the brief.

### Recommended layout

- Rename the page heading and primary navigation label to **Contact us** or **Discuss a project**.
- Put the direct contact methods near the top: WhatsApp, call, and email, with clear labels and tap targets.
- Offer the guided brief as an optional secondary action: `Build a project brief`.
- Explain exactly what happens: `At the end, choose WhatsApp or email to send the brief, or copy it. The website does not submit the message automatically.` Keep this statement accurate unless a real backend submission is added.
- Do not claim that a form is submitted, an enquiry is stored or someone will respond in a certain time unless that behavior is actually implemented and staffed.
- Avoid requiring someone to choose from all 18 services before they can contact the agency. Keep `I'm not sure yet` or a simple general-enquiry path available.

### Useful business information

If the owner has approved it, show typical engagement types, pricing guidance/ranges, starting requirements, delivery steps, and answers to common questions. Never invent prices, timelines, minimum budgets, included deliverables or response SLAs. If that information is unavailable, explicitly leave it for owner input rather than fabricating a reassuring-sounding answer.

---

## 9. Footer and site-wide consistency

- Use the same navigation labels and ordering sitewide.
- Use the primary CTA language consistently (`Contact us` / `Discuss a project`). Avoid switching between Start, Pilot Route, Plan your route, and other variants unless one is a secondary branded feature.
- Keep a consistent `View selected work` / `Explore services` / `Contact us` action hierarchy.
- Keep email, phone, WhatsApp and website details readable and tappable on mobile.
- Verify the canonical public website domain with the owner before changing domain/address copy. Do not infer the final domain from a preview deployment URL.
- Add social links only when the official accounts are confirmed.
- Ensure the footer doesn't repeat a large manifesto after the homepage has already made the point. A concise contact strip, key links and correct business details are enough.

---

## 10. Content integrity rules — non-negotiable

The repository explicitly avoids invented content. Maintain this policy throughout the refactor.

Claude Code must not invent or imply any of the following:

- Client names or logos.
- Client testimonials or star reviews.
- Followers, reach, views, engagement rates, leads, conversion improvements, revenue, ROI or other metrics.
- Campaign objectives/results that have not been provided.
- A division of work between SxBP and production partners that has not been confirmed.
- Staff/team members or qualifications.
- Service guarantees, prices, package terms, revision limits, delivery timelines or reporting schedules.
- Social handles or external links that have not been verified.

Use existing factual content and asset relationships already in `src/content/site.ts`, `src/content/divisions.ts`, and `src/content/work.ts`. If the better layout requires a factual answer the repository does not contain, create a **clearly marked owner-input checklist in documentation**, not a visible invented website claim. Do not publish placeholders like `[insert price]` on the live site.

---

## 11. Recommended implementation phases

Do not do the whole redesign in one giant change. Make each phase reviewable and run existing checks before moving to the next phase.

### Phase 0 — Read-only layout/content inventory

- Confirm current routes, reusable page components, homepage section order, repeated components, and all current nav/CTA labels.
- Create a route-by-route inventory of what stays, what moves, what is shortened, and what is removed.
- List missing owner-provided information separately.
- Do not edit source files in this phase.
- Report the exact files that would be changed in each next phase.

**Exit gate:** the owner approves the proposed information architecture and content changes.

### Phase 1 — Global language and navigation

- Update nav, footer, crumbs, `WhereNext`, page labels and CTA copy consistently.
- Use Work / Services / How we work / Contact us.
- Keep URLs and route behavior unchanged.
- Do not redesign page content yet beyond labels required to keep the site coherent.

**Exit gate:** all global navigation and contact actions still work at desktop and phone sizes.

### Phase 2 — Simplify the homepage

- Rebuild `src/app/page.tsx` into hero → selected work → four service-family cards → four-step process → one closing CTA.
- Remove the long Ladder, redundant Marquee, home DivisionBoard, long MethodBoard, Audiences tabs, standalone AI block, and separate oversized Finale from the homepage composition. Reuse components on another page only when they clearly serve that page and do not duplicate content.
- Reuse the existing real work and current service data. Do not invent case studies or results.
- Keep the brand design, typography, colors and select real-media element, but simplify layout hierarchy and remove competing decorative UI from the first screen.

**Exit gate:** on the first screen, a non-technical reviewer can describe what SxBP does and locate Work and Services without scrolling. The homepage contains no more than five primary content sections before the footer.

### Phase 3 — Work index and project detail

- Simplify the Work header and filters.
- Choose leading projects only from an owner-approved shortlist.
- Improve cards to include plain titles, categories and formats.
- Add optional case/project metadata only where facts are available and approved.
- Clearly attribute production partner contributions.
- Never invent outcomes to make the layout feel more complete.

**Exit gate:** a visitor can find an appropriate project and understand what they are looking at without needing the owner to translate internal terms.

### Phase 4 — Services index and individual services

- Replace the interactive service-board-first layout with four service-family summaries, then a compact, accessible full directory of all 18 services.
- Remove or demote cursor-following video and route-toggle UI from the first listing view if it competes with clear service selection.
- Standardize the 18 detail pages into the same simple pattern.
- Keep full detail accessible while presenting the most useful information first.
- Clarify overlapping service names with accurate plain-language copy.

**Exit gate:** every one of the 18 services remains accessible, each detail page says what it is, what may be included, shows relevant work where available, and offers a clear next action.

### Phase 5 — How we work + Contact

- Shorten `/approach` to a practical process page without duplicated homepage scenes.
- Rename `/route` in visible text to Contact us / Discuss a project and make direct contact obvious.
- Keep the wizard as an optional project-brief tool and describe its manual handoff accurately.
- Add FAQ/pricing/process details only from owner-approved information.

**Exit gate:** the visitor can understand the working process and contact the agency without completing the wizard.

### Phase 6 — Responsive visual review and regression

Test at minimum:

- Desktop: 1440px wide and 1280×720 short laptop viewport.
- Tablet: around 768px wide.
- Phone: around 390px wide and around 360px wide.
- Reduced motion enabled.
- Keyboard navigation and visible focus.
- All routes including every service detail and work detail.
- All nav, CTA, filters, gallery interactions, route toggles (if retained), WhatsApp, tel and mailto links.
- No horizontal overflow, empty content sections, dead CTAs, duplicate headings or broken links.
- `npm run lint`, `npm run build`, and the existing Playwright tests.

Run the existing QA scripts listed in `HANDOVER.md` where available. Do not weaken or delete existing tests merely to make the redesign pass.

**Final exit gate:** provide a short change report listing modified files, removed/moved homepage sections, content that needs owner approval, test results and any known limitations. Do not commit unless explicitly requested.

---

## 12. Client-understanding acceptance test

Ask someone unfamiliar with the agency to inspect the website without explanation. They should be able to answer:

1. What does SOCIALxBRAND PILOT do?
2. Where can I see work relevant to my business?
3. What are the main service categories?
4. What is the difference between strategy, managing social accounts and creating content?
5. What can I expect from the service page I am viewing?
6. What does the working process look like?
7. How do I contact the agency, and what happens when I click the contact CTA?

The layout fails if the reviewer needs the owner to explain what “Pilot Route”, “screenings”, “stations” or “divisions” mean before they can continue.

Practical navigation goals:

- Within **10 seconds** on Home, understand the general offer and see the two paths to Work and Services.
- From Home, reach Work or Services in **one click**.
- From a service page, reach related work and Contact in **one clear action each**.
- Understand the service page without reading a list of every internal subtask.
- Contact the agency without being forced through the project brief builder.

---

## 13. Strict Claude Code prompt — layout refactor only

Copy and paste the following prompt into Claude Code Desktop after placing this document in the repository.

> Read `SocialxBrand_Client_First_Layout_Refactor_Plan.md` completely before editing. The task is to make the website's layout and information architecture client-first so a non-technical business owner can understand the agency's offer, view relevant work, understand services, and contact the agency without help.
>
> **Work phase by phase. Begin with Phase 0 only. Do not edit files yet.** Inspect the current repository and return: (1) the actual page/section inventory, (2) a list of repeated content/components, (3) the exact files likely to change in Phase 1, (4) facts missing that require owner input, and (5) a concise implementation plan. Stop and wait for my approval.
>
> After approval, implement only the approved phase. Do not continue automatically into the next phase. At the end of each phase, list files changed, explain how the layout changed, run relevant checks, report test outcomes honestly, and stop for review.
>
> The work is a **layout and information-architecture refactor**, not a new visual identity, not a performance audit, and not an excuse to rewrite unrelated code. Preserve the existing brand palette, typography, logo, real media, design tokens, responsive behavior, accessibility and motion/reduced-motion safeguards unless a specific approved layout change requires an adjustment.
>
> The homepage target is: **Hero → Selected work → Four service-family cards → Four-step “How we work” → one closing CTA → footer.** Remove the current long/redundant homepage sections from the homepage composition as described in the plan. Reuse existing content rather than generating fake content. Preserve all 18 service detail routes and all existing work routes.
>
> Apply client-friendly labels consistently: `Work`, `Services`, `How we work`, `Contact us`, `Project`, `Step`, and `What's included`. Internal URLs may remain unchanged. The five-step brief builder must stay optional and must accurately explain its WhatsApp/email/copy handoff.
>
> Do not add invented case studies, client logos, testimonials, metrics, prices, team members, guarantees, delivery times, revision limits, platform commitments or claims about SxBP's role in partner-produced work. If a layout needs information missing from the repo, record it in an owner-input list and omit the claim from the live page.
>
> Before implementing any phase, inspect the current code and current shared components. Do not recreate components that already exist. Do not blindly follow stale screenshots or README copy if it differs from the current source.
>
> **Stop conditions:** if service grouping changes meaning, a page requires owner-only facts, an existing route or key behavior might be removed, or a requested change would require inventing content, stop and ask rather than guessing.

### Negative prompt — never do these things

- Do not rewrite the whole codebase or replace Next.js, React, GSAP, Lenis, Tailwind or the existing component architecture.
- Do not install new libraries or packages for this layout task.
- Do not redesign the visual identity, introduce a new palette, add random gradients/3D elements, or add decorative animations to fill space.
- Do not create stock images, AI-generated portfolio work, fake client logos, mock dashboards, fabricated case studies or testimonial cards.
- Do not invent facts, metrics, pricing, package inclusions, client names, business locations, team bios, deadlines or guarantees.
- Do not remove any of the 18 service routes, work detail routes, required SEO metadata, breadcrumbs, accessibility labels, reduced-motion support or existing tests.
- Do not change unrelated animation/performance code as part of a layout-only phase.
- Do not silently change URL paths, canonical URLs, project slugs, media relationships or service slugs.
- Do not hide all detailed service information behind a wizard, modal or accordion. Keep important information visible and let advanced detail be secondary.
- Do not force users to select services before they can find contact details.
- Do not keep internal terminology just because it is part of the brand concept. Use a plain explanation wherever a branded term remains.
- Do not publish any placeholder text or an owner-input TODO on the live website.
- Do not declare the work complete just because the build passes. Review at desktop and phone sizes, and provide actual screenshots/test evidence where tooling supports it.
- Do not commit changes unless I explicitly ask you to.

---

## 14. Owner inputs needed before the site can fully answer every buying question

The design can be simplified without these inputs, but the site cannot honestly answer every commercial question unless the agency owner provides the facts. Keep a private checklist for:

- Which 3–4 projects should lead the Work page and why.
- For each selected project: SxBP's role, partner role, deliverables, client/name disclosure permission, objective and any approved measured results.
- Which of the 18 services are actively offered to new clients today.
- Any standard inclusions/exclusions, especially for social media management, content production, paid media and reporting.
- Whether public pricing or starting ranges can be shared.
- Actual approval/revision/reporting/meeting practices, if they should be stated publicly.
- Official social profile URLs.
- Confirmed canonical domain and contact channels.
- Client-approved FAQs and testimonials, if any.

Do not block the basic layout simplification on the owner having all of these details. Build the clearer structure first, publish only known facts, and add the approved information later.

---

## Final direction

The website should feel like a capable agency's simple, well-organized front door — not an interactive presentation that visitors must decode. Show the work early, group services by what a client needs, explain the service in plain terms, demonstrate a simple process, and make contact obvious. Keep the brand character; remove the extra layers that get in the way of understanding.
