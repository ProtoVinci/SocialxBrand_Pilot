# SOCIALxBRAND PILOT — Complete SEO & AEO Implementation Plan

**Prepared for:** `SocialxBrand_Pilot(7).zip`  
**Stack:** Next.js App Router, React 19, TypeScript  
**Purpose:** Improve technical SEO, useful search content, social previews, crawlability, entity understanding, and answer-engine discoverability without keyword stuffing or invented claims.

> **Important:** No implementation can guarantee indexing, first-page rankings, traffic, leads, or AI citations. This plan builds a trustworthy and measurable foundation. Claude Code must verify each finding against the latest source and the rendered production HTML before editing.

---

## 0. Operating principles

### SEO and AEO use the same fundamentals

For this project, AEO means making the website's information clear, direct, attributable and easy for search/answer systems to understand. Prioritize accurate and distinctive content, clear page purpose, crawlable internal links, server-rendered text, consistent business identity, a usable page experience, and structured data that matches visible content.

Google's current guidance says there are no special markup requirements to appear in AI Overviews or AI Mode beyond standard Search eligibility and good SEO. Google also says `llms.txt` and other AI-only files are not required for Google Search AI features and should not be treated as ranking tricks.

Official references:
- Google AI features: https://developers.google.com/search/docs/appearance/ai-features
- Google's generative AI search guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- People-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### Non-negotiable accuracy rules

1. Never invent clients, results, testimonials, reviews, ratings, revenue, ROAS, leads, conversion rates, awards, certifications, years of experience, former employers, staff, partnerships, service locations, project facts or business credentials.
2. Do not create prices, timelines, deliverable quantities, response-time promises, contract terms or fixed packages without owner confirmation.
3. Do not add a location keyword such as Mumbai only because it may attract searches. The company profile says India and global markets; the agency's precise base and in-person service eligibility must be confirmed.
4. Never mark a testimonial approved merely because the agency or AI drafted it. Exact wording, name, role, business attribution and logo use need real approval.
5. Structured data is descriptive, not a guarantee of rich results or AI citations.
6. Do not mass-produce repetitive service pages, generic FAQs, city pages or AI articles for search traffic alone.
7. Preserve the brand and layout. This is an SEO/AEO project, not a redesign.
8. Do not add a new SEO package before checking the native Next.js setup. This repo already has `robots.ts`, `sitemap.ts`, canonical metadata, dynamic page metadata and JSON-LD helpers.
9. Work phase by phase, show exact diffs and evidence, and stop after each phase for approval.

---

# 1. Current repository: what already exists

## 1.1 Public routes

- `/` — homepage
- `/work` — work index
- `/work/[slug]` — curated work collections
- `/capabilities` — service directory grouped into four client-friendly categories
- `/capabilities/[slug]` — 18 service pages
- `/approach` — how the agency works
- `/about` — founder profiles and agency direction
- `/route` — contact options and optional project brief
- Next.js `robots.ts`, `sitemap.ts`, `not-found.tsx`, favicon and root `opengraph-image.jpg`

Work content is intentionally described as collections because not every record contains a verified client brief, the agency's exact contribution or business results. Do not relabel these as case studies unless the missing facts are supplied and approved.

## 1.2 Strong foundations to preserve

- `src/app/layout.tsx` uses `metadataBase`, a title template, root title/description, canonical root and basic Open Graph/Twitter metadata.
- Main pages define titles, descriptions and canonical paths.
- Dynamic service/work pages use `generateMetadata()` and `generateStaticParams()`.
- `src/app/robots.ts` declares crawl policy and sitemap URL.
- `src/app/sitemap.ts` emits absolute URLs via `siteUrl` for main routes, all 18 service pages and live work collections.
- `src/lib/site-url.ts` centralizes the canonical origin.
- `src/lib/seo.ts` has helpers for `ProfessionalService`, `Service`, `BreadcrumbList` and `Person` JSON-LD.
- `src/components/seo/JsonLd.tsx` escapes `<` inside JSON-LD output.
- Service pages contain an intro, typical deliverables, deeper scope details, related services and related work.
- Work pages link to related service pages.
- About includes founder profiles and `Person` schema.

The goal is to validate and improve these systems, not rebuild them from scratch.

## 1.3 Current findings to verify/fix

### P0 — Confirm the exact canonical domain

`src/content/site.ts` sets `site.url` to `https://www.socialxbrandpilot.com`. `src/lib/site-url.ts` prefers `NEXT_PUBLIC_SITE_URL`, then the Vercel production URL, then `site.url`. A wrong production environment value can make canonical tags, the sitemap, robots, JSON-LD and share-image URLs point to the wrong origin.

**Owner action:** confirm the intended domain with or without `www`, confirm HTTP→HTTPS and apex↔www redirects, and confirm the actual production deployment. Set `NEXT_PUBLIC_SITE_URL` explicitly to the chosen canonical origin. Never let a preview deployment become the canonical host.

### P1 — Open Graph and X/Twitter metadata need rendered-output verification

The root currently sets `openGraph: { type, siteName, locale }` and `twitter: { card: "summary_large_image" }`. A root `src/app/opengraph-image.jpg` exists, but there is no obvious `twitter-image.*` route/file. Page metadata generally supplies title, description and canonical but not full route-specific social preview information.

Inspect actual production HTML before changing this. Ensure important pages render one correct `og:title`, `og:description`, `og:url`, `og:site_name`, `og:type`, `og:image`, plus `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image`. A shared brand image is fine as a fallback; a permitted, relevant work image can be used on a specific work page when appropriate. Do not add competing duplicate tags.

### P1 — Generic titles need improvement

Static titles currently include `About`, `Work`, `Services` and `Contact us`. The title template appends the agency name, but the main part can better express each page's purpose. Google recommends unique, descriptive and concise titles and warns against repetitive boilerplate or keyword stuffing.

### P1 — Sitemap does not set `lastModified`

`src/app/sitemap.ts` sets `changeFrequency` and `priority`, but not `lastModified`. Google ignores `priority` and `changefreq` for crawl scheduling. A truthful `lastmod` can be useful when a page meaningfully changes, but do not set every URL to the deployment/build timestamp. Add stable content-maintained dates only if the team will keep them accurate; otherwise omit `lastModified`.

### P1 — Review legacy `robots.ts` paths and `host`

The file disallows `/__contact/` and `/lab` and sets `host: siteUrl`. Verify whether those paths still exist and whether they should be excluded. Google's documented robots.txt fields are `user-agent`, `allow`, `disallow` and `sitemap`; do not rely on `Host` to select the Google canonical domain. Use redirects, canonical tags and a consistent sitemap for canonicalization.

### P1 — Review whether `ProfessionalService` accurately represents the organization

`organizationLd()` currently outputs `ProfessionalService`, but the repo does not provide a public street address. `ProfessionalService` is a Schema.org subtype associated with local business. If SxBP does not operate a customer-facing or otherwise qualifying local business presence, use an accurate `Organization` representation instead. Do not invent a `PostalAddress`, city or local-business location. Decide this with the owner and follow Google’s current Organization/local-business guidance.

References:
- Organization markup: https://developers.google.com/search/docs/appearance/structured-data/organization
- LocalBusiness markup: https://developers.google.com/search/docs/appearance/structured-data/local-business

### P1 — `sameAs`/contact information must remain factual

The organization schema includes name, alternate name, description, URL, email, phone, slogan, logo, service area and `knowsAbout`, but does not include social-profile URLs. Add `sameAs` only for official profiles whose exact URLs the owner supplies and controls. Confirm email/phone are current, monitored and intended for public display. Do not guess profiles based on a similar brand name.

---

# 2. Metadata and snippet quality

## 2.1 Required metadata inventory

For each indexable route, maintain a small audit table with:

- path and page type;
- unique title;
- unique meta description;
- self-referencing canonical URL;
- intended primary query/topic;
- H1 and first visible summary;
- Open Graph title, description, URL and image;
- X/Twitter card/title/description/image;
- indexability state;
- structured data types used;
- source/owner facts that the copy relies on.

Avoid relying only on code inspection. After `npm run build` and `npm run start`, inspect the server-rendered page source/response HTML and confirm the final metadata tags.

## 2.2 Proposed title direction

These are examples to adapt after owner approval, not promises that a particular phrase has search volume. Preserve the metadata template if it remains useful; avoid repeating the full agency name twice.

| Page | Proposed title direction | Notes |
|---|---|---|
| Home `/` | `Digital Marketing Agency in India | SOCIALxBRAND PILOT` | Accurate if the current company profile's India positioning remains approved. Do not add a city. |
| Work `/work` | `Selected Work: Video, Photography & Design | SOCIALxBRAND PILOT` | Matches visible collections, not invented outcomes. |
| Services `/capabilities` | `Digital Marketing Services | SOCIALxBRAND PILOT` | One hub for the 18 actual services. |
| About `/about` | `About SOCIALxBRAND PILOT | Founders & Vision` | Use “vision” only if it is visibly explained on the page. |
| How we work `/approach` | `How We Work | SOCIALxBRAND PILOT` | Clear and differentiated from the services hub. |
| Contact `/route` | `Contact SOCIALxBRAND PILOT | Discuss Your Marketing Needs` | Clear action intent, no fake offer. |
| Service detail | `{Service Name} | SOCIALxBRAND PILOT` | Unique service name first, brand second. |
| Work collection | `{Collection Name} — Selected Work | SOCIALxBRAND PILOT` | Call a collection a collection until there is verified client context. |

Keep titles concise and natural. Google may rewrite titles based on the H1, page text, links and other signals. Do not chase an exact character count.

## 2.3 Meta descriptions

Google may use page text instead of a meta description. A description is a short, accurate preview and click-through aid, not a guaranteed ranking boost.

Write unique descriptions:
- Homepage: explain that SxBP is an India-based digital marketing agency and summarize the core service groups accurately.
- Work index: mention the real content types and selected work categories.
- Each service detail: explain the particular service and the type of business need it addresses.
- Work collection: describe only visible content and the actual credited production role.
- About: identify the actual founders and their approved responsibilities.
- Approach: summarize the four real steps in the process.
- Contact: list WhatsApp, phone, email and optional project brief accurately.

Do not use the same description across all 18 services. Avoid a generic line copied and pasted with only the service name changed. Avoid unsupported phrases such as “best agency”, “guaranteed growth”, “number one”, “award-winning”, “proven ROI” or “industry-leading”.

Google snippet guidance: https://developers.google.com/search/docs/appearance/snippet

## 2.4 Open Graph and X/Twitter cards

For each important route:

1. Use a title appropriate to that page, not a generic brand-wide title.
2. Write a specific share description.
3. Use the correct canonical absolute URL in `og:url`.
4. Use a valid, public, stable absolute image URL with appropriate dimensions and a meaningful image.
5. Ensure the image does not require cookies, authentication or client-side execution to retrieve.
6. Keep the Twitter card configuration consistent with the actual image being served.
7. Test the deployed URL with available platform preview/debug tools after release.

Do not create a new image for every route by default. Existing brand artwork can be the general fallback; create custom work thumbnails only where the content/permissions justify it.

---

# 3. Canonical URLs, redirects, robots and sitemap

## 3.1 Canonical origin and redirects

- Decide one canonical origin: `https://www.socialxbrandpilot.com` or `https://socialxbrandpilot.com`.
- Ensure HTTP redirects to HTTPS.
- Ensure the noncanonical host redirects to the selected canonical host in one hop.
- Keep `NEXT_PUBLIC_SITE_URL`, metadata base, sitemap URLs, JSON-LD URLs, Open Graph URLs and canonical tags consistent.
- Never canonicalize every route to the homepage.
- Avoid query-string/tracking variants becoming separate canonicals.
- Keep the current URLs unless a migration is specifically approved. If URL changes are ever needed, preserve old URLs with correct permanent redirects and update internal links/sitemap/canonicals together.

Use the self-referencing canonical already defined on each major route. Validate every dynamic page's final canonical, especially all 18 service pages and the live work collections.

Official reference: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

## 3.2 Robots.txt

`src/app/robots.ts` is the source of `/robots.txt`. Check the generated production file rather than assuming the TypeScript return value is enough.

- Keep public service, work, about, approach and contact pages crawlable.
- Keep CSS, JavaScript, images, fonts and posters crawlable so search engines can render the page.
- Verify `/__contact/` and `/lab` are genuinely internal/test paths. Remove stale exclusions only if confirmed obsolete; do not remove a needed exclusion without checking.
- Do not use robots.txt to hide private content. Use authentication for private resources or `noindex` where the page must be crawlable to see the directive.
- Do not block Googlebot/Bingbot by mistake at the hosting/WAF/CDN layer.
- Decide AI crawler policy explicitly. Search/retrieval crawlers and model-training crawlers can be different agents, and owner consent governs the latter.
- Do not rely on `host` to establish the Google canonical domain.

For ChatGPT search visibility, OpenAI's current crawler documentation says `OAI-SearchBot` controls inclusion in ChatGPT search; `GPTBot` is a separate control associated with model training. Review the policy and make an owner decision rather than blindly allow or block all AI agents. Current docs: https://developers.openai.com/api/docs/bots and https://help.openai.com/en/articles/12627856-publishers-and-developers-faq

## 3.3 Sitemap

`src/app/sitemap.ts` currently generates the homepage, main index pages, approach, about, contact, all 18 service pages and work collections for which media exists. This is a good general model.

Audit requirements:

- Every sitemap entry must be a canonical, public, indexable URL returning `200`.
- No redirects, 404s, preview URLs, test routes, query strings or noindex pages.
- Use absolute URLs on the preferred canonical domain.
- Keep `/route` because it contains contact information; don't exclude it simply because it is a contact page.
- Add `lastModified` only from a maintained content update date if available. Never use `new Date()` on build to make every page appear newly updated.
- `priority` and `changeFrequency` can be removed if they add false confidence; Google ignores these values. If left, do not assume they affect rankings.
- Confirm there is no duplicate URL from old/new paths or trailing slash variants.
- Submit `https://www.socialxbrandpilot.com/sitemap.xml` (or the chosen canonical host) in Search Console and Bing Webmaster Tools.

Google sitemap reference: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## 3.4 Search robots versus training crawlers

SEO/AEO requires allowing the search crawlers that the business wishes to discover public pages. The business can make a separate decision about whether to allow model-training crawlers. Do not let an earlier `Disallow: /` or a platform-wide “block AI bots” snippet block search/indexing crawlers inadvertently.

For any crawler-specific rules, document:
- the exact user-agent;
- what service uses it;
- whether it affects search inclusion, user-triggered retrieval, advertising validation or model training;
- the owner's decision;
- the date it was last reviewed.

---

# 4. Structured data / Schema.org

## 4.1 What is already present

Current helpers: `src/lib/seo.ts`; renderer: `src/components/seo/JsonLd.tsx`.

- Organization/business-level schema on every route.
- `Service` schema for individual service pages.
- `BreadcrumbList` for about, approach, contact, work and service routes.
- `Person` schema for founders.

This is a reasonable starting set. Don't add many schemas without a clear content/eligibility reason.

## 4.2 Organization schema

Review the current `ProfessionalService` choice with the owner. If the agency's public business model/location does not justify a local-business subtype, use the more conservative and accurate `Organization` type. Do not add a physical address that is not real and approved.

Populate only accurate applicable properties:
- `@id` and stable canonical `url`;
- `name` and `alternateName`;
- approved `description`;
- `logo` that is publicly fetchable and visually represents the brand;
- public `email` and `telephone`;
- `sameAs` with official social accounts only;
- `areaServed` at a level that matches the actual service market;
- `contactPoint` only if it describes a real contact channel;
- `founder` references only when the names and relationships are verified.

Do not add unverified `address`, `geo`, `openingHours`, `priceRange`, `aggregateRating`, `review`, `numberOfEmployees`, `foundingDate` or other fields for the sake of completeness. Extra properties are not automatically better.

Google Organization docs: https://developers.google.com/search/docs/appearance/structured-data/organization

## 4.3 Add `WebSite` schema only as a simple truthful graph node

Consider adding one `WebSite` node with the site's name, canonical URL and publisher reference to Organization. This can clarify the relationship between the website and agency. Do not add `SearchAction` unless the live site actually has a functioning public site-search feature. The page must not claim a site-search capability that does not exist.

Optionally connect page entities via stable `@id` values in a JSON-LD `@graph`, but do not refactor the schema system only for code-style reasons. Correct output matters more than a particular organization of scripts.

## 4.4 Service schema

The existing `Service` data is sensible if it reflects the visible service page. Confirm:
- the `name`, `serviceType` and `description` match visible content;
- `provider` points to the canonical organization `@id`;
- `url` matches the page canonical;
- `areaServed` is accurate;
- each route has the correct service, no duplicated or wrong `@id` values.

Do not invent price, offer, available channel, terms, ratings or service promises.

## 4.5 Breadcrumb schema

Keep `BreadcrumbList` on nested pages if it matches the visible/clickable breadcrumb route. Use human-readable path labels such as Home → Services → Social Media Management, not opaque slugs. Validate every breadcrumb URL against the canonical origin.

Google reference: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb

## 4.6 Founder Person schema

Keep the current founder `Person` nodes only if founder names, roles, images and bios are approved and appear visibly on `/about`. Add official personal profile `sameAs` links only when supplied by the founders. Do not create individual founder routes unless the owner has enough unique public content for them.

## 4.7 Reviews and testimonials: do not add self-serving star schema

Testimonials can help potential clients when they are real, approved and accurately attributed. However, Google does not show review rich results for self-serving reviews about an `Organization` or `LocalBusiness` on that same organization's own site. Do not add `Review` or `AggregateRating` markup to try to create star snippets for SxBP. Never create average ratings from the testimonial quotes.

Official reference: https://developers.google.com/search/docs/appearance/structured-data/review-snippet

## 4.8 FAQ schema and visible FAQ sections

Visible, genuinely helpful FAQs can support users and make answers easier to understand. They should be added only when the questions are real and page-specific. Google FAQ rich results are generally limited to well-known authoritative government and health sites; an agency should not expect FAQ schema to display a rich result.

Add structured data only when the visible content meets the relevant type's guidelines. Do not mark up content hidden from visitors or generate a large number of repetitive questions just for AEO.

Reference: https://developers.google.com/search/blog/2023/08/howto-faq-changes

## 4.9 VideoObject: only for a genuine watch page

The work collections contain multiple video previews and images. Most are portfolio media, not standalone watch pages. Do not mark every looping background/hover reel as a `VideoObject`.

Consider `VideoObject` only for a page where one particular video is the main content and the page lets a visitor watch it. You would need accurate title/name, description, stable accessible thumbnail, real upload/publication date, duration where known and accessible media/content URL. If those facts are unavailable, skip VideoObject markup. Do not invent upload dates.

Google video guidance: https://developers.google.com/search/docs/appearance/structured-data/video and https://developers.google.com/search/docs/appearance/video

---

# 5. Keyword and search-intent strategy

## 5.1 Start with research, not guesses

The current service names make a useful starting point for keyword mapping, but the repo does not contain reliable search-volume or conversion data. Do not present guessed search volume, keyword difficulty or traffic forecasts as facts.

Before changing copy, research actual query language using:
- Google Search Console (once verified): queries, pages, impressions, clicks, CTR and average position;
- Google's Keyword Planner or another legitimate research tool, using the market the owner actually serves;
- Google Trends for relative interest/trends, not absolute volume;
- the exact phrases prospective clients use in real sales conversations and inquiries;
- competitor result pages for intent and content gaps—not to copy their claims or text.

Record the search market/language, tool, date and assumptions. Where no data exists yet, label a phrase a **hypothesis to validate**, not a proven keyword.

## 5.2 Initial topic map (provisional)

Each page should have one primary intent and a few closely related concepts. Avoid having the homepage, services index and all 18 individual services compete for the same primary phrase.

| URL | Primary topic / intent to validate | Content emphasis |
|---|---|---|
| `/` | Digital marketing agency in India | What the agency does, who it helps, core service groups, selected work, contact. |
| `/capabilities` | Digital marketing services | Explain the service groups and help people choose the right type of help. |
| `/capabilities/strategy-consulting` | Digital marketing strategy and consulting | Audits, market/audience research, objective setting, strategy deliverables—only as actually offered. |
| `/capabilities/social-media-marketing` | Social media marketing | Strategy, channel fit, campaigns, content and audience intent. |
| `/capabilities/social-media-management` | Social media management | Ongoing planning/publishing/community/reporting—only the scope SxBP actually supplies. |
| `/capabilities/content-marketing` | Content marketing strategy | Content planning, themes, distribution and measurement. |
| `/capabilities/content-creation` | Social media and brand content creation | Real asset types, process and examples. |
| `/capabilities/graphic-design` | Graphic design for marketing | Social creatives, posters, menus, campaign/brand assets shown in actual work. |
| `/capabilities/video-production` | Video production for brands | Production scope, formats, relevant work, project process. |
| `/capabilities/video-editing-animation` | Video editing and animation | Editing/animation examples and exact production scope. |
| `/capabilities/photography` | Commercial/brand photography | Real genres shown, licensing/usage scope if owner provides it. |
| `/capabilities/branding-identity` | Branding and brand identity | Identity process and deliverables; avoid claims about brand results. |
| `/capabilities/creative-advertising-campaigns` | Creative advertising and campaign concepts | Creative strategy and campaign assets actually offered. |
| `/capabilities/performance-marketing` | Performance marketing | Explain channels, measurement, conversion objectives and what is/isn't managed. |
| `/capabilities/search-seo` | SEO and local SEO services | Scope of SEO work SxBP actually offers; this page itself must be accurate and substantive. |
| `/capabilities/whatsapp-marketing` | WhatsApp marketing | Consent, message use cases and actual service scope; avoid spam-oriented claims. |
| `/capabilities/creator-brand-growth` | Creator and brand growth | Creator collaborations/content/brand growth—only what is genuinely delivered. |
| `/capabilities/youtube-organic-video` | YouTube and organic video marketing | Planning, production/optimization tasks actually within scope. |
| `/capabilities/reputation-pr-community` | Reputation, PR and community management | Services actually offered; distinguish digital community tasks from formal PR/media relations if needed. |
| `/capabilities/ai-marketing-automation` | AI marketing and automation | Use cases, process and limitations; no exaggerated AI guarantees. |
| `/work` | Marketing, video, photography and design portfolio | Real work categories and partner attribution. |
| `/work/[slug]` | The specific work collection name and format | Explain visible work, formats and related services without fabricated client/project results. |
| `/about` | SOCIALxBRAND PILOT founders/about | Verifiable people, roles, vision and agency identity. |
| `/approach` | Digital marketing process / how the agency works | Four understandable steps and how the client participates. |
| `/route` | Contact digital marketing agency | Direct contact choices and honest project-brief workflow. |

This table is a mapping starting point, not proof of keyword demand. Validate priority topics and remove any term that does not match the actual offer.

## 5.3 Avoid keyword cannibalization

- Homepage owns the broad agency/entity introduction.
- Services index owns the broad service directory.
- Each service page owns the specific service topic and related questions.
- Work pages demonstrate relevant execution and link to the matching service.
- About owns the founder/agency entity and vision.
- Approach owns the engagement process.

Do not copy entire descriptions from the service directory into every page. Internal links should help a person move from a question to the most relevant page.

## 5.4 Content gaps to prioritize

The biggest opportunity is not publishing 100 articles. It is improving the business information already missing from the page:
- Which kinds of business problem is each service intended to help with?
- What does the agency actually do versus its production partner?
- What deliverables may be agreed?
- What does the client need to provide?
- How do approvals, revisions, reporting and communication work?
- What is included vs outside scope?
- What evidence can the agency show?
- What should a prospect know before contacting the agency?

These details require owner/team input. Do not infer them from common agency practices.

---

# 6. AEO: make every important page answer real client questions

## 6.1 The answer-first page pattern

For each core page, use a simple information hierarchy:

1. **Descriptive H1:** clearly says what the page is about.
2. **Short direct answer:** one concise paragraph that explains the service/page in plain English.
3. **Who it is for / problem it addresses:** only where confirmed and relevant.
4. **What the agency does:** actual tasks and approach.
5. **Typical deliverables:** labelled as typical/examples when scope varies.
6. **Proof/context:** real portfolio media, approved feedback, founder background or a specific project explanation.
7. **Process and constraints:** what the client needs to provide, any verified exclusions or dependencies.
8. **Next step:** link to related work/service/contact.
9. **Optional FAQ:** answer real, common customer questions.

This is a human-readable structure, not a rigid search-engine word-count rule. Google explicitly says there is no ideal page length and no requirement to break content into tiny chunks for AI systems.

## 6.2 Example structure for a service page

Use this as a structural example; Claude must not paste it identically onto all 18 services.

```text
H1: Social Media Management

Direct summary:
What the service covers, the kind of need it helps address and how it fits into
SxBP's actual offer. Keep it accurate and plain-language.

H2: What this service helps with
Describe 2–4 real business needs this service addresses.

H2: What can be delivered
List the typical deliverables that the owner confirms are in scope.

H2: How the work is planned and approved
Describe actual process, client responsibilities and feedback loop.

H2: Relevant work
Link only to collections whose media really illustrates this service.

H2: Common questions
Use actual customer questions. Answer directly and mention dependencies.

H2: Discuss this service
Clear link to contact/project brief.
```

## 6.3 FAQ content priorities

Add FAQs only where they answer a real uncertainty. Potential themes to confirm with the owner include:
- What is the difference between social media marketing and social media management?
- What information should a business prepare before starting?
- What determines the scope of content production?
- Who approves content and how are changes handled?
- Does an advertising budget sit inside or outside the agency fee?
- How is campaign performance reviewed?
- Can a client choose only one service?
- How does the agency decide which services a business needs?

These are prompts for owner review, not ready-made factual answers. Do not state exact timelines, prices, platform coverage, revision rules or reports until verified.

For AEO:
- Put the direct answer first, followed by the necessary conditions/context.
- Use the exact terminology a client understands and define specialist terms.
- Keep the answer adjacent to the question heading.
- Use lists or tables when they genuinely clarify decisions.
- Cite or link to primary sources when discussing external factual claims.
- Avoid repeating the agency name unnaturally in every answer.
- Keep meaningful information in crawlable HTML; don't make it available only after a hover, client-side interaction or video.

FAQ schema is not required for AEO and should not be added with the expectation of rich FAQ snippets. Visible FAQ content is useful on its own.

## 6.4 Establish entity clarity

The site's core entity is SOCIALxBRAND PILOT. Make the name consistent across:
- title/metadata;
- logo and footer;
- About page;
- schema organization name and `@id`;
- canonical site URLs;
- official social accounts if provided;
- directory/business profiles if eligible;
- email and phone information.

Where permitted and accurate, reference the founders by their full approved names and roles. The founder page should provide genuine first-hand context, not invented credentials.

## 6.5 Don't add `llms.txt` as an SEO shortcut

Do not add `llms.txt`, “AI schema”, a markdown mirror of the whole site, or a bot-specific plugin just because a consultant claims Google needs it. Google's official AI optimization guide says its systems do not require `llms.txt` or other new AI-only markup. If a separate consumer/product has a documented use for a file, treat it as an optional engineering decision, not a search requirement.

## 6.6 AEO crawler access decisions

The current broad robots rule allows the site unless a path is explicitly disallowed. Confirm the hosting/CDN/WAF also lets legitimate crawlers fetch the HTML, images and assets; robots.txt alone does not prove public access.

For ChatGPT search, OpenAI documents `OAI-SearchBot` separately from `GPTBot` (training use). Decide with the owner whether to permit search retrieval and whether to permit training. Do not block search discovery by copying a blanket `Disallow: /` rule. Keep content access choices documented. See https://developers.openai.com/api/docs/bots.

---

# 7. On-page content and internal linking

## 7.1 Heading and semantic HTML audit

For every route, verify:
- one clear primary H1 representing the page purpose;
- H2s represent logical sections; H3s are nested under relevant H2s;
- there are no empty headings or decorative headings falsely marked as primary content;
- main content renders in the initial HTML/normal DOM and doesn't require an animation to become visible;
- navigation uses links for navigation and buttons for actions;
- breadcrumbs are visible, accessible and align with schema;
- visible labels are meaningful to people using assistive technology.

Do not force a page to contain one H1 solely as a rule if semantic context requires more nuance, but each page must have one obvious main topic heading.

## 7.2 Internal linking plan

Preserve and complete a consistent cross-link system:
- Homepage → featured work, services hub and contact.
- Work index → each work collection.
- Work collection → genuinely related services, work index and contact.
- Service hub → all 18 service pages.
- Service page → relevant work, genuinely related services and contact.
- About → work, approach and contact.
- Approach → relevant work, services and contact.
- Footer → primary page routes and official socials only.

Use descriptive anchor text such as “Social media management” or “View restaurant and hospitality work”, not repeated generic “click here”. Avoid creating links to empty/stub pages. Ensure all important routes are reachable through ordinary `<a>`/Next.js Link anchors, not only through JavaScript click handlers.

## 7.3 Improve work collections without inventing case studies

A collection page may not yet have a client brief or measurable outcome. It can still be useful if it explains what a visitor will see and what types of services the work demonstrates.

For each collection, verify:
- title and slug accurately describe media;
- description is unique and visible;
- media has appropriate alt/accessible labels;
- “Production partner: Vishay Creations” remains intact where applicable;
- linked service pages are relevant;
- no client relationship, objective, role, result or permission is implied when not known.

If the owner later supplies and approves facts, add a structured case-study layer with objective, role, deliverables, timeframe and evidence. Don't present absence of results as a failure and don't fabricate the missing facts.

## 7.4 On-page word choice

Use plain language instead of relying on internal brand jargon as the only explanation. Terms like “services”, “selected work”, “how we work”, “about” and “contact” should remain available even if branded labels are also used. Explain acronyms on first use. Make service scopes readable without requiring the visitor to understand all 18 divisions.

---

# 8. Images, videos and visual search

## 8.1 Images and alt text

The site has an intentional AVIF/WebP responsive media pipeline. Preserve it unless a measured issue is found.

Audit the rendered output of `Photo`, `Reel`, `SelectedWork`, `WorkIndex`, founder portraits and brand logo usage.

- Meaningful images need concise, context-specific alt text describing relevant subject matter, not keyword lists.
- Decorative images should use empty alt text or be hidden from assistive technology when appropriate.
- Do not repeat the same generic alt text for every different portfolio image.
- A logo needs brand-identifying alt text when it functions as a brand link; if the logo is redundant next to the same text, avoid duplicate announcement.
- Keep explicit image dimensions/aspect ratios to avoid layout shift.
- Use descriptive file names where practical for future assets, but don't rename all existing files unless there is a migration reason. Filenames are a weak clue, not the whole SEO strategy.
- Put images near relevant visible explanatory text.
- Check image URLs return `200`, formats match their MIME type, and image hosts are not blocked to crawlers.

Google Image guidance: https://developers.google.com/search/docs/appearance/google-images

## 8.2 Video content

The homepage uses looping video capsules and portfolio pages include multiple clips. Those are not automatically searchable “watch pages”.

- Keep posters/fallbacks and readable page text available before video play.
- Do not make the page's purpose understandable only through the video frames.
- Use useful visible titles/captions that describe the collection.
- Only implement `VideoObject` for a page centered on one actual watchable video, with stable thumbnail, true publication date/duration and accessible video URL.
- Do not create a video sitemap unless the site has a meaningful number of indexable watch pages and the owner wants to maintain its required metadata.
- Do not fabricate upload dates from the date the asset was copied into the repo.
- Keep decorative hover previews from adding dozens of unnecessary network requests; this is both a performance and crawl reliability concern.

Google video references:
- https://developers.google.com/search/docs/appearance/video
- https://developers.google.com/search/docs/appearance/structured-data/video

## 8.3 Social share images

Inspect the existing 1200×630-ish brand preview image, compression, contrast and text legibility at small previews. Keep text limited and readable. Validate the public absolute URL from social scrapers after deployment. If individual work cards use custom OG images, ensure they are permission-cleared and genuinely match the specific page.

---

# 9. Search appearance, site identity and local SEO

## 9.1 Favicon and site name

The repo has `src/app/icon.svg`. Confirm the icon is readable at small sizes, serves successfully and appears in production search/browser previews. Check the site's displayed name consistently uses `SOCIALxBRAND PILOT` or `SxBP` according to context; avoid inconsistent variants like “SocialXBrand”, “Social X Brand Pilot” or arbitrary abbreviations unless the owner confirms them.

## 9.2 Local SEO: do not invent a city or business address

The supplied company profile currently describes the market as India and global markets. There is no verified public street address in `site.ts`.

Before adding local SEO:
1. Ask the owner where the agency is actually based and whether customers can visit that location.
2. Confirm whether the agency meets Google Business Profile eligibility requirements. An online-only business that does not meet the in-person contact requirements must not create a fake local profile.
3. If eligible, create or verify one accurate profile using the real business name, category, phone, website, address or service area as appropriate.
4. Keep name, address and phone consistent across the official website and legitimate profiles. Do not create duplicate locations or fake service-area pages.
5. Only create a location page if it represents a genuine staffed/public business presence or a real, meaningful service area with content and proof—not as a doorway page.

Official Business Profile service-area guidance: https://support.google.com/business/answer/9157481

## 9.3 Directory and external profile consistency

Use only official, owner-controlled pages. Once the owner supplies the exact social URLs, make them consistent in the footer, Organization `sameAs` and any verified business profiles. Do not include link farms, paid low-quality directories or fabricated “featured in” badges.

## 9.4 Off-page authority

Prioritize real, relevant mentions rather than bulk link building:
- ask real clients/partners whether they are comfortable linking to the relevant work;
- coordinate factual portfolio attribution with Vishay Creations;
- contribute useful knowledge to relevant business/industry communities where the agency has real experience;
- publish useful original analysis or process notes that a real audience would cite;
- keep the agency's own social profiles consistent and active where practical.

Do not buy link packages, automate mass outreach spam, create fake profiles or exchange unrelated keyword-stuffed links. A new website may need time to earn trusted mentions; no link plan guarantees rank improvements.

---

# 10. Analytics and monitoring

## 10.1 Verify properties and connect tools

After the domain is confirmed, the owner or authorized account administrator should:

1. Verify the domain property in Google Search Console (prefer DNS/domain verification if manageable).
2. Submit the canonical sitemap URL.
3. Inspect the homepage, services hub, top-priority services, work index, representative work collection, About and Contact using URL Inspection.
4. Review Pages/Indexing, sitemaps, manual actions, security issues and Core Web Vitals.
5. Verify the property in Bing Webmaster Tools and submit the sitemap.
6. Review Bing's available search and AI citation/visibility reporting where enabled.
7. Keep domain ownership and verification tokens in the owner's account/secret manager, not source code or public files.

Search Console does not make Google index every page immediately. Submission is a discovery hint, not an indexing guarantee.

References:
- Google sitemap instructions: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Bing URL submission and IndexNow: https://www.bing.com/webmasters/help/URL-Submission-62f2860b
- Bing AI Performance: https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/

## 10.2 Measurement

Use available tools already installed/configured first. The repo has Vercel Analytics, conditionally enabled when built/deployed on Vercel. That is not a substitute for Search Console, which reports search visibility/indexing. Do not add GA4, tag managers, heatmaps or additional packages without deciding ownership, privacy notice/consent requirements and why the new data is needed.

Track monthly:
- Search Console organic clicks, impressions, CTR and position by page/query;
- which service pages receive impressions but low clicks;
- which pages get clicks but fail to lead visitors to work/contact;
- index coverage and crawl errors;
- referrals from ChatGPT/search engines where analytics records them;
- qualified enquiry sources, if the intake process captures that honestly;
- Core Web Vitals and mobile performance.

Do not report a page “ranking #1” from one localized/private search. Use Search Console data over a meaningful period and segment brand vs nonbrand queries where possible.

## 10.3 Indexing and launch checklist

For every indexable route:
- response is `200`;
- HTML includes the intended H1 and main copy without requiring a user interaction;
- no accidental `noindex` meta/header;
- robots.txt allows crawl;
- canonical points to the selected domain and itself;
- sitemap includes the canonical URL;
- internal links point to canonical URLs;
- page title and description are unique;
- Open Graph/Twitter values are present and correct;
- JSON-LD is valid and matches visible content;
- images and fonts are accessible;
- mobile page functions without console errors.

For unknown routes, return a proper `404` rather than a soft 404 that returns `200` with an error message.

---

# 11. Technical SEO test suite for this Next.js project

Add a small number of deterministic tests rather than a giant SEO plugin. Use current dependencies and Playwright unless a new package has a justified benefit.

## 11.1 Metadata tests

For the homepage, About, Approach, Work, Services, Contact, every service detail and every live work collection, test the **rendered production HTML** for:
- nonempty unique `<title>`;
- nonempty meta description;
- exactly one canonical link;
- canonical URL is absolute after metadataBase resolution and is on the chosen host;
- no staging/preview host appears in canonical/OG/schema output;
- no page accidentally uses the homepage as its canonical;
- `og:title`, `og:description`, `og:url`, `og:image` are correct;
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` are correct;
- page has a clear H1 matching the visible page purpose.

A title uniqueness test must account for acceptable pages with related service names, but should still catch every page being titled “Services” or “Work”.

## 11.2 Sitemap tests

Fetch `/sitemap.xml` from a production server and validate:
- valid XML;
- every `<loc>` uses the canonical host;
- every URL is absolute and unique;
- all intended live routes are included;
- no unknown/staging route appears;
- every listed URL returns 200 without a redirect chain;
- each sitemap URL's canonical matches it;
- no page marked noindex appears in the sitemap.

## 11.3 Robots tests

Fetch `/robots.txt` and verify:
- it returns 200 and plain text;
- the sitemap URL is the canonical sitemap;
- public route families are not accidentally disallowed;
- any excluded path is real and intentionally excluded;
- search crawler rules match owner policy;
- no accidental wildcard block was introduced.

## 11.4 Structured-data tests

For each page, extract every `script[type="application/ld+json"]`, parse it as JSON and validate essential fields. Check:
- Organization/Website IDs and URLs point to the canonical host;
- service schema describes the service shown on the page;
- breadcrumb labels/URLs match the visible breadcrumb;
- Person data matches `/about` visible approved founder info;
- no unapproved review/rating schema;
- no fake `Review`, `AggregateRating`, `LocalBusiness` address, price, `VideoObject` upload date or `SearchAction` exists;
- no duplicate/contradictory Organization entities are emitted.

After deployment, also test representative URLs using Google Rich Results Test and Schema Markup Validator. A successful syntax test doesn't mean the page is eligible for a rich result or that a rich result will appear.

Useful tools:
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org/
- Search Console URL Inspection: https://search.google.com/search-console/about

## 11.5 Build and code checks

Use the project's current scripts:

```bash
npm ci
npx tsc --noEmit
npx eslint src
npm run build
npm run start -- --port 3100
npm test -- --workers=1
```

Then use the production server for route/page source tests. If the environment cannot install packages, report that blocker honestly rather than claiming the build passed.

---

# 12. Suggested content work by page

## Homepage `/`

Keep the current concise structure. Make sure the first visible content tells visitors what SxBP does without needing to interpret the slogan alone. The selected work, service groups and process should have real crawlable heading/text content. Do not hide the main message until the intro animation completes.

The homepage should target the broad agency/entity intent, not all 18 individual services. Keep the exact slogan if approved, but pair it with plain-language service information.

## Services hub `/capabilities`

Explain the four categories and link to all 18 services with unique visible descriptions. This page targets the broad service-directory intent. It should not duplicate the entire introduction from every service page.

## Each of the 18 service pages

Every page should include meaningful unique content—not just a title with a slightly changed definition. Maintain a source-of-truth record for:
- exact service name and slug;
- primary search intent hypothesis;
- plain-language summary;
- real problems/use cases;
- typical deliverables confirmed by the owner;
- what is outside scope or depends on brief;
- relevant work IDs;
- related service links;
- 3–6 real FAQs only where helpful;
- metadata title/description;
- content verification date/owner.

If a service page cannot say anything meaningfully different because the service overlaps another one, clarify the service boundary with the owner instead of writing SEO filler.

## Work index and work collections

Keep the current honest “work collection” framing. Add detail only from real project records. For each collection, improve description of what the visitor sees and link to relevant services. When a real client approves a named case study, add objectives/deliverables/roles/results from records; do not infer them from media.

## About `/about`

Keep founder names, roles, photos and vision accurate and owner-approved. This is useful entity/trust information. Add official founder profile links only after the founders provide and approve URLs. Avoid invented employment history, credentials and years of experience.

## Approach `/approach`

Make the four steps clear and practical. Clarify client participation and expected workflow only after confirming it. Avoid an empty promise that everything is “data-driven” unless the agency can explain what it measures and how.

## Contact `/route`

Keep phone, WhatsApp and email accurate and easy to use. The page currently explains that the website itself does not submit the brief automatically; preserve this honest explanation unless a real submission endpoint is added. Do not claim a submitted lead was captured when it was merely copied/opened in another app.

---

# 13. Optional content programme after the technical baseline

Do not launch a blog just because an SEO checklist says every agency needs one. First decide who will create and maintain useful original content. If the owner/team has real insight and capacity, a small resource section can build topical depth over time.

Potential topics to validate against customer questions:
- What is the difference between social media marketing and social media management?
- How should a business choose between content production and ongoing social media management?
- What should a business prepare before commissioning a video/reel shoot?
- How should businesses decide which marketing services they actually need?
- What should a client look for in a monthly social media plan or campaign report?
- What information should be agreed before a content production project?

Every article should include real examples/process knowledge from the agency, a named/accurate author or reviewer when appropriate, a publication/update date only when real, links to the relevant services and clear limits. Do not publish generic AI rewrites of other blogs. If the team cannot maintain quality, focus on service pages and work documentation first.

---

# 14. Phased execution plan for Claude Code Desktop

**Do not run every phase in one request.** Run Phase 0 first, inspect the report, then approve each later phase. A phase must stop when its acceptance criteria are met. If an owner decision is required, ask for it instead of guessing.

## Phase 0 — Read-only discovery and baseline

**Goal:** Understand the real current project and avoid redoing or breaking existing work.

Prompt to Claude Code:

> Read `CLAUDE.md`, `AGENTS.md`, `HANDOVER.md`, `README.md`, `package.json`, `src/app/layout.tsx`, all route metadata, `src/lib/site-url.ts`, `src/lib/seo.ts`, `src/components/seo/JsonLd.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/content/site.ts`, `src/content/divisions.ts`, `src/content/work.ts`, `src/content/founders.ts`, and current tests. Read the Next.js 16 docs in the installed package before making framework changes, as required by AGENTS.md. Do not edit files yet. Produce a route-by-route SEO inventory, confirm exact current metadata and structured-data output locations, identify duplicated/missing metadata, review sitemap/robots/domain logic, and list owner facts needed. Run existing checks only if dependencies are available. Distinguish confirmed source findings from runtime items. Stop and ask for approval.

Acceptance:
- Complete route and metadata inventory.
- No code changed.
- Domain uncertainty and owner-provided content facts are listed explicitly.
- Current tests/build status includes actual commands and outcomes.

## Phase 1 — Canonical domain, robots and sitemap

**Goal:** Ensure crawlers receive consistent URL, robots and sitemap signals.

Implement only after owner confirms the canonical origin and crawler policies.

Tasks:
1. Confirm the canonical host and explicit production `NEXT_PUBLIC_SITE_URL`.
2. Check redirects for HTTP/HTTPS and apex/`www`.
3. Review `/__contact/`, `/lab` and `host` in `robots.ts`.
4. Validate sitemap entries against real live routes and canonical URLs.
5. If maintainable, add accurate stable `lastModified` data; otherwise leave it absent. Do not use build-time current dates.
6. Decide whether to add explicit crawler rules for OAI-SearchBot and separate training crawlers according to the owner's policy.
7. Add tests for generated robots/sitemap output.

Acceptance:
- No preview domain appears in canonical/sitemap/schema.
- Every sitemap URL is absolute, unique and canonical.
- No public page is accidentally disallowed.
- All redirect choices are intentional.
- Stop and show the diff and test results.

## Phase 2 — Metadata, social previews and title/description audit

Tasks:
1. Improve generic titles using the approved direction in Section 2.
2. Create a per-page metadata record/plan for all routes, including all 18 services and live work collections.
3. Add explicit, accurate Open Graph and Twitter values where output verification shows they are absent or wrong.
4. Use the existing OG image as a fallback; create page-specific share art only if justified and permission-cleared.
5. Confirm each canonical path is correct.
6. Test built HTML to verify there is exactly one effective canonical and correct share metadata.

Acceptance:
- Every indexable page has a unique descriptive title and description.
- No route accidentally shares a wrong canonical or preview host.
- `og:url` is the canonical page URL, not always `/`.
- Share cards use publicly fetchable images.
- Do not claim card previews are correct until verified from the deployed host.

## Phase 3 — Structured data corrections

Tasks:
1. Review `ProfessionalService` vs `Organization` with owner facts; choose the most accurate type.
2. Add/clean the `WebSite` entity if useful, with Organization publisher reference. No `SearchAction` unless public search actually exists.
3. Check Organization, Service, BreadcrumbList and Person entities for correct `@id`, URLs, visible text and duplicates.
4. Add `sameAs` only for official URLs supplied by the owner.
5. Do not add review/rating schema for self-serving testimonials.
6. Do not add VideoObject to decorative or carousel videos. Consider only for genuine standalone watch pages with complete real metadata.
7. Parse every JSON-LD block in automated tests and test representative pages with external validators.

Acceptance:
- Valid JSON; no duplicate contradictory organization identities.
- Markup mirrors the visible content.
- No invented address, rating, price, upload date or social identity.
- Rich-result eligibility is described carefully, with no guarantee of display.

## Phase 4 — Content mapping and service/work page quality

This phase requires owner input where indicated. Claude may audit and prepare recommendations, but must not invent the missing facts.

Tasks:
1. Create a keyword/topic map using actual query research or label it clearly as hypotheses until research is available.
2. Assign a distinct primary topic to each page.
3. Audit all 18 service pages for unique summary, clear customer need, appropriate deliverables, real limitations, useful related links and genuine FAQs.
4. Audit work collections for unique descriptions, image context and service relevance.
5. Keep collections and case studies distinct.
6. Add direct answer paragraphs/FAQs only where they help a real customer.
7. Add internal links with descriptive text.

Acceptance:
- No mass-generated content or copied identical paragraphs across all services.
- Every factual statement traces to `src/content/*` or an owner-approved source.
- No unsupported price, timeline, results or business promise.
- Service page does not target the exact same main intent as every other service page.
- Stop for owner copy/content decisions where needed.

## Phase 5 — Images, videos and social entity consistency

Tasks:
1. Audit alt text on `Photo`, `Reel`, selected work, founder images and logo links.
2. Correct generic or repeated alt text where it misdescribes the image; use empty alt for decorative items.
3. Check image dimensions, loading behavior, image host access and stable poster URLs.
4. Verify `og:image` can be fetched anonymously from production.
5. Decide local business eligibility with the owner. Do not add an address or city without confirmation.
6. Add official `sameAs` social profile URLs only after supplied by owner.

Acceptance:
- Meaningful images have appropriate descriptions; decorative images are not noisy.
- No new media pipeline package without evidence.
- Local data is accurate and consistent.

## Phase 6 — Analytics and search engine configuration

Tasks requiring account access should be presented to the owner as a checklist, not completed by guessing credentials.

1. Verify Google Search Console and Bing Webmaster Tools properties.
2. Submit the canonical sitemap once.
3. Inspect primary routes and monitor index coverage/errors.
4. Ensure web analytics/referral tracking follows the owner's privacy requirements.
5. Create a short SEO monitoring dashboard/checklist.
6. Document how to interpret search query/page performance and how often to review.

Acceptance:
- No secret/account credentials are committed.
- Tracking is verified rather than claimed from code presence alone.
- Sitemap and canonical host match.

## Phase 7 — Regression, accessibility and launch verification

Run build, typecheck, lint, tests, route smoke checks, HTML metadata checks, sitemap/robots tests, structured-data tests, accessibility checks, and a mobile review.

Acceptance:
- Build and tests pass, or blockers are listed honestly.
- 404s are real HTTP 404s.
- All important public routes have correct metadata/schema and return 200.
- No layout, navigation, reduced-motion, client-contact or route-transition regression.
- Owner decisions and unresolved content fields are listed.
- Update `HANDOVER.md` and add a current report only after tests finish.

---

# 15. Strict negative prompt (use in every Claude phase)

> **STRICT SCOPE / NEGATIVE PROMPT**
>
> Do only the current approved phase. Do not redesign the site, change its visual brand, rewrite animations, change URLs, reorganize the 18-service structure, modify unrelated performance behavior, or rewrite the entire metadata/content system. Do not add an SEO plugin or package unless you first explain exactly why the existing Next.js features are insufficient and receive approval. Do not install `next-sitemap` when the native `src/app/sitemap.ts` already works. Do not add `llms.txt` or AI-only markup as a claimed Google requirement. Do not add `FAQPage`, `Review`, `AggregateRating`, `LocalBusiness`, `VideoObject`, `SearchAction`, `PostalAddress`, pricing, or social profile data unless the page qualifies and the required real facts exist. Do not invent or embellish keyword volume, client names, testimonials, awards, credentials, project outcomes, city locations, prices, timelines, deliverables or business claims. Never mark a testimonial approved without exact client approval. Do not add local landing pages for cities the agency cannot substantiate. Do not keyword-stuff titles, headings, descriptions, alt text or FAQs. Preserve current routes and partner credits. Do not remove assets or files just because they seem unused. Do not change cache headers without confirming path immutability and deployment behavior. Do not claim a ranking/indexing/AI citation or performance improvement without evidence. Check installed Next.js 16 documentation before framework edits. Run relevant tests, show exact files changed, report skipped/unavailable checks and stop at the phase boundary for approval.

---

# 16. Owner-input checklist before SEO copy is finalized

Claude must create a short checklist and ask the owner for answers to these items. It must not block technical fixes that do not depend on them, but it must not guess.

- [ ] Preferred canonical domain: `www` or apex; confirm production domain is live.
- [ ] Actual primary markets/countries; whether a specific city should be targeted.
- [ ] Whether the agency has a public/customer-facing location and qualifies for a Business Profile.
- [ ] Confirm current public phone and email.
- [ ] Exact official Instagram/LinkedIn/YouTube/other profile URLs.
- [ ] Confirm the approved wording, names, roles and logo use for each displayed testimonial.
- [ ] Confirm founder name/role/bio/photos and official profiles.
- [ ] Confirm which of the 18 services are actively offered right now.
- [ ] Confirm what is genuinely included, typical vs optional, exclusions, pricing visibility and how project scope is set.
- [ ] Identify work where a named client, brief, role, deliverables, timing or result may be published, with proof/permission.
- [ ] Confirm whether the agency wants its public content included in ChatGPT Search (OAI-SearchBot) and separately decide on model-training crawlers such as GPTBot.
- [ ] Confirm who owns Google Search Console, Bing Webmaster Tools, domain DNS and website analytics.

---

# 17. Success criteria: how we know the implementation is complete

## Technical requirements

- [ ] Production canonical domain is consistent everywhere.
- [ ] HTTP/host redirects are correct and have no long redirect chain.
- [ ] `robots.txt` is valid, appropriate and not accidentally blocking public content.
- [ ] `sitemap.xml` is valid XML and contains only canonical, indexable, live URLs.
- [ ] Every important route has a unique title and description.
- [ ] Social metadata for OG and Twitter/X is complete and fetchable.
- [ ] Structured data parses, matches visible content and contains no unsupported facts.
- [ ] No duplicated/wrong canonical URLs or preview host URLs.
- [ ] Images have appropriate alt behavior and stable dimensions.
- [ ] Main content is rendered and readable without interacting with animations.

## Client/content requirements

- [ ] Homepage explains who the agency is and what it offers plainly.
- [ ] Service pages explain the real service without copying filler between pages.
- [ ] Work collections do not imply unverified clients or outcomes.
- [ ] Founder and feedback information is factual and owner-approved.
- [ ] All important pages link to related work/services/contact naturally.
- [ ] FAQs answer real questions and don't invent promises.

## Measurement requirements

- [ ] Search Console and Bing Webmaster Tools properties are verified by the owner.
- [ ] Sitemap submitted to the correct property.
- [ ] Search/index errors can be monitored.
- [ ] Organic query/page performance has a documented baseline after enough data accumulates.
- [ ] AEO visibility/citations are treated as observed outcomes, not guaranteed deliverables.
- [ ] The report clearly distinguishes code-complete items from indexing/performance outcomes that can only be observed after deployment.

---

# 18. Reference links (official documentation)

Use these sources as the authority when implementing changes; recheck them if Google's or another platform's policies change.

- Google AI features and website owners: https://developers.google.com/search/docs/appearance/ai-features
- Google generative AI optimization guide: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google title links: https://developers.google.com/search/docs/appearance/title-link
- Google snippets/meta descriptions: https://developers.google.com/search/docs/appearance/snippet
- Google sitemap construction/submission: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Canonical URLs: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google robots.txt specification: https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
- Organization structured data: https://developers.google.com/search/docs/appearance/structured-data/organization
- Local business structured data: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Breadcrumb structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Review snippet and self-serving reviews: https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- FAQ/HowTo rich-result changes: https://developers.google.com/search/blog/2023/08/howto-faq-changes
- Image SEO: https://developers.google.com/search/docs/appearance/google-images
- Video SEO: https://developers.google.com/search/docs/appearance/video
- VideoObject schema: https://developers.google.com/search/docs/appearance/structured-data/video
- Bing URL submission/IndexNow: https://www.bing.com/webmasters/help/URL-Submission-62f2860b
- Bing AI Performance: https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- OpenAI crawler guide: https://developers.openai.com/api/docs/bots
- OpenAI publisher/developer FAQ: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org/

---

## Final directive to Claude Code

Treat this document as a phased implementation specification, not permission for a one-shot rewrite. Start with **Phase 0 only**. Report what is already correct, what is missing, what needs an owner decision, and what needs a production test. Wait for approval before changing any files. After approval, complete only the next phase, prove it with tests/output inspection, show the exact diff and stop again.
