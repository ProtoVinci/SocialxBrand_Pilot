# Content map

Every on-site claim traces to a source. **PDF-S** is *Services & Divisions Master Document*, **PDF-P** is *Company Profile* and **Drive** is the *SxBP x Vishay Creations Portfolio*.

| Content | Source | Lives in | Used on |
|---|---|---|---|
| 18 divisions: names, what-it-is, capability groups, deliverables, approach chains | PDF-S pp. 4–21 | `src/content/divisions.ts` | `/capabilities`, `/capabilities/[slug]`, home act 5, builder |
| Cluster grouping (Strategy & Creative / Performance & Search / Direct / Growth, PR & AI) | PDF-P §08 | `divisions.ts` `clusters` | index, builder |
| "We do not believe every business needs every service…" | PDF-S p. 3 | `site.ts` `servicesIntro` | home, `/capabilities` |
| Who we are, Strategy + Creativity + Technology + Execution | PDF-P §01 | `site.ts` | `/approach`, meta |
| "We are not here simply to make brands look good online…" | PDF-P §01 | `site.ts` `quote` | `/approach` |
| Philosophy: seen → remembered → trusted → chosen → forward; 4 outcomes | PDF-P §02 | `site.ts` `philosophy` | home act 3, `/approach` |
| Vision, mission | PDF-P §03–04 | `site.ts` | `/approach` |
| Audiences (startups, growing, established, local) | PDF-P §05 | `site.ts` `audiences` | home act 7, builder |
| 8 differentiators | PDF-P §06 | `site.ts` | `/approach` |
| Method: Understand → Grow (+ descriptions) | PDF-S p. 23, PDF-P §07 | `site.ts` `method` | home act 6, `/approach` |
| Who we work with | PDF-P §09 | `site.ts` | home act 7, `/approach` |
| Principles (What we stand for) | PDF-P §10 | `site.ts` `principles` | `/approach` |
| Personality | PDF-P §11 | `site.ts` `personality` | `/approach` |
| AI philosophy | PDF-S p. 22 | `site.ts` `aiPhilosophy` | home act 8, `/approach` |
| Promise: "digital activity → digital impact" | PDF-S p. 23 | `site.ts` `impact` | home acts 2 and 9 |
| "Every business has something worth showing…" | PDF-P p. 4 | `site.ts` `closing` | hero line, footer |
| Contact: email, phone, web | PDF-P p. 4 | `site.ts` | footer, `/route`, JSON-LD |
| Portfolio: 95 curated assets in 14 screenings | Drive (500 files; categories are the only metadata) | `scripts/media/selection.json` → `src/content/media.generated.json`, copy in `src/content/work.ts` | `/work`, home |
| Logo files | supplied artwork | `public/brand/`, vector trace in `src/components/brand/mark-paths.ts` | everywhere |

## Copy written for the site (not in the PDFs)

These lines are framing, not claims. Each restates source ideas.

- Hero sub-line: "We build the strategy, creative and growth systems that help the right people see it."
- Section headlines such as "Made to be *watched*, not just posted", "The right mix, not the full menu" and "Business first. Then everything else."
- Screening one-liners describe only what is visible in the footage (for example, "Kitchens, storefronts, flame and plating…").
- Route-builder goal prompts (see `src/lib/route/suggest.ts`). Suggestions are always labelled as a *starting route*.

## Deliberately absent

Client names (apart from marks that appear inside the logo work itself), results, metrics, testimonials, awards, a team, years in business, pricing and a city.
