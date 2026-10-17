# SEO and AEO: current state, policy and owner checklist

Implemented 2026-10-18 from `SocialxBrand_SEO_AEO_Full_Implementation_Plan.md`. This file records what the
site emits, why, and what only the owner can decide. Nothing here guarantees indexing, rankings or AI
citations: those are outcomes to observe in Search Console and Bing Webmaster Tools after deployment.

## Where it lives

| What | File |
|---|---|
| Canonical origin | `src/lib/site-url.ts` (`NEXT_PUBLIC_SITE_URL`, else Vercel production domain, else `site.url`) |
| Page metadata | `pageMetadata()` in `src/lib/seo.ts`, used by every route (title, description, canonical, og:url, share image) |
| Default title / template | `src/app/layout.tsx` (`%s · SOCIALxBRAND PILOT`) |
| JSON-LD | `src/lib/seo.ts` (`siteLd`, `serviceLd`, `breadcrumbLd`, `founderLd`), rendered by `src/components/seo/JsonLd.tsx` |
| robots.txt / sitemap.xml | `src/app/robots.ts`, `src/app/sitemap.ts` |
| Share image | `src/app/opengraph-image.jpg` (1200×630), named explicitly in `openGraphBase` |
| Tests | `tests/seo.spec.ts` |

## Live domain (checked 2026-10-18)

- `https://www.socialxbrandpilot.com` serves the site (200) and is the canonical host.
- `https://socialxbrandpilot.com` → 308 → `https://www.…/` (one hop). `http://www.…` → 308 → `https://www.…/` (one hop).
- `http://socialxbrandpilot.com` → `https://socialxbrandpilot.com/` → `https://www.…/` (**two hops**, Vercel's
  default). Harmless, but the owner can make it one hop in Vercel → Domains.
- Unknown URLs return a real 404 with a single `noindex`.

## Metadata inventory

Every indexable route has a unique title, a unique description, one self-referencing canonical, `og:url`
equal to the canonical, and one `og:image` / `twitter:image` (the brand card). `tests/seo.spec.ts`
checks all of this on every sitemap URL.

| Route | Title (before the ` · SOCIALxBRAND PILOT` suffix) | Description source | Structured data |
|---|---|---|---|
| `/` | (default) SOCIALxBRAND PILOT — Digital Marketing Agency · India & Global | `homeDescription` | Organization + WebSite |
| `/work` | Selected Work: Video, Photography & Design | page | + BreadcrumbList |
| `/work/[slug]` (14) | `{collection} — Selected Work` | collection line + format | + BreadcrumbList |
| `/capabilities` | Digital Marketing Services | page | + BreadcrumbList |
| `/capabilities/[slug]` (18) | the service name | the service's opening sentence (`whatItIs[0]`), whole | + Service, BreadcrumbList |
| `/approach` | How We Work: Our Four-Step Process | page | + BreadcrumbList |
| `/about` | About Us: The Founders | page | + BreadcrumbList, Person ×2 |
| `/route` | Contact Us: WhatsApp, Call or Email | page | + BreadcrumbList |

Service descriptions used to be cut at 160 characters, ending mid-word in "…"; they are now the
service's full opening sentence (102 to 234 characters). Google trims snippets by width anyway.

## Structured data decisions

- **`Organization`, not `ProfessionalService`.** `ProfessionalService` is a LocalBusiness subtype, and
  the agency publishes no street address. Switch only if the owner confirms a customer-facing address.
- **`WebSite`** with name, alternate name `SxBP` and publisher; this is what Google reads for the site
  name in results. No `SearchAction`: the site has no search.
- **Founders**: `Person` nodes on `/about` with stable `@id`s; the Organization's `founder` points at them.
- **Not emitted, on purpose:** `sameAs` (no official profile URLs supplied), `address`, `geo`,
  `openingHours`, `priceRange`, `Review` / `AggregateRating` (self-serving reviews are not eligible, and the
  feedback awaits client approval), `FAQPage` (no owner-approved Q&A), `VideoObject` (the reels are
  portfolio previews, not watch pages with real upload dates). The test fails if any of these appear.

## Crawler policy (reviewed 2026-10-18)

`robots.txt` allows every crawler everything except `/__contact/` (a local, gitignored media contact
sheet). That covers search crawlers (Googlebot, Bingbot), answer-engine retrieval (`OAI-SearchBot`,
`ChatGPT-User`, `PerplexityBot`) and model-training crawlers (`GPTBot`, `Google-Extended`, `CCBot`) alike:
the status quo, left unchanged pending the owner's decision below. The `Host` line was removed (Google
ignores it) and so was `/lab` (no such route).

Blocking a training crawler does not affect search: e.g. `User-agent: GPTBot` + `Disallow: /` keeps
ChatGPT Search (`OAI-SearchBot`) working. Add such rules only on the owner's word, and record the date.

No `llms.txt`: Google's guidance says AI features need no special files or markup.

## Content (AEO) changes

- The home hero's lede now opens with what the agency is: "An Indian digital marketing agency: …"
  (from the profile's own opening line). The heading is the slogan, so before this the first visible
  text never said what SxBP does.
- Service pages already follow the answer-first pattern (H1 = service name, lead = what it is, then what
  it helps with, typical deliverables, relevant work, process, a look-alike service told apart, related
  services, contact). No FAQs were written: the plan requires real customer questions and owner-approved
  answers.
- Work stays framed as collections, not case studies; the production-partner credit is unchanged.

## Owner checklist (nothing below was guessed)

- [ ] Set `NEXT_PUBLIC_SITE_URL=https://www.socialxbrandpilot.com` in Vercel (Production) so the canonical
      never depends on which domain Vercel lists first.
- [ ] Crawler policy: keep allowing everything, or block model-training crawlers (GPTBot, Google-Extended,
      CCBot) while keeping search and ChatGPT Search?
- [ ] Official Instagram / LinkedIn / YouTube / other profile URLs (for the footer and `sameAs`).
- [ ] Is there a customer-facing address, and should a Google Business Profile exist? (Only then:
      a local-business type, address and city.)
- [ ] Primary markets, and whether any city should be targeted.
- [ ] Real customer questions per service, with approved answers (for visible FAQs).
- [ ] Per-photo alt text for the 52 work photographs (they are labelled "{collection} — image n of m").
- [ ] Client approval of each feedback line (feedback renders only once approved).
- [ ] Who owns Search Console, Bing Webmaster Tools and DNS.

## After deployment (owner, in their accounts)

1. Google Search Console: verify the domain property (DNS), submit `https://www.socialxbrandpilot.com/sitemap.xml`,
   inspect `/`, `/capabilities`, two service pages, `/work`, one collection, `/about`, `/route`.
2. Bing Webmaster Tools: verify (it can import from Search Console), submit the same sitemap; check AI Performance.
3. Rich Results Test and validator.schema.org on `/`, a service page and `/about`. Valid markup does not
   mean a rich result will show.
4. Share a page on WhatsApp / LinkedIn / X to see the card (LinkedIn Post Inspector refreshes its cache).
5. Monthly: clicks, impressions, CTR and position by page and query (brand vs non-brand); index coverage;
   Core Web Vitals. Keep verification tokens out of the repository.
