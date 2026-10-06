# Site architecture

## Why this structure

The client's hypothesis was Home → Work → Services → Contact, plus a detailed services area. We kept the intent but changed the shape:

- **Home is a film, not a table of contents.** It tells the whole story (who → why → what → how → proof → next) in nine acts, so a visitor who never leaves it still understands SxBP.
- **"Services" becomes "Capabilities".** With 18 divisions, a flat service list is either a wall or incomplete. An index plus 18 product-like pages scales, and it carries the "not every business needs every service" thesis.
- **"Contact" becomes "Start your route".** A brief builder gives the visitor a useful first step, and gives SxBP a qualified enquiry. Direct contact is always beside it, and `/contact` redirects there.
- **About + Method merge into "Approach".** Philosophy, method, principles and AI stance are one argument, not three pages.

## Routes

| Route | Purpose |
|---|---|
| `/` | The film. Acts 0–9 (below). |
| `/work` | Index of 14 screenings (portfolio categories), with format filters and Flip reflow. |
| `/work/[slug]` | One screening: shared-element cover, meta, capabilities shown, reels/films/photos, next screening. |
| `/capabilities` | The 18 divisions in the profile's 4 clusters: ticker + index + cursor preview + add-to-route. |
| `/capabilities/[slug]` | A division: identity → what it is → what it covers → deliverables → its approach route → work → connections. |
| `/approach` | Who we are, the quote, philosophy outcomes, vision/mission, method, principles, differentiators, audiences, AI. |
| `/route` | The Pilot Route builder (business → goal → route → details → send) and direct contact. |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | SEO. |

## The home film (story → act)

| # | Act | Emotional beat |
|---|---|---|
| 0 | Logomark curtain (first visit only) | anticipation |
| 1 | Hero: "Every business has something *worth showing*", with a fan of real reels | interest |
| 2 | Manifesto, in the same pin as the hero: activity → impact | tension |
| 3 | Philosophy ladder: seen → remembered → trusted → chosen → moving forward | reveal |
| 4 | Screenings: the real work, horizontal | discovery |
| 5 | Capabilities: "Not every business needs *every* service" | discovery |
| 6 | The Route: the method, travelled | progression → trust |
| 7 | Audiences (light act): marketing is for every business | trust |
| 8 | AI amplifies: division 18, not the brand | trust |
| 9 | Finale: WE WILL SHOW. YOU WILL GROW. | desire → action |

## Navigation

- **Bar contents**: logomark + wordmark · Work / Capabilities / Approach · "Start your route" pill (with route count) · Menu.
- **Bar states**: transparent → solid blurred after 80px; hides on scroll-down and returns on scroll-up; a red route-progress hairline.
- **Full-screen menu**: clip-path reveal, link rows rising, a reel preview per row. This is the primary navigation on mobile.

## Technical architecture

- **Next.js 16.3 App Router, TypeScript.** Every page is statically generated (`generateStaticParams`, `dynamicParams = false`). Client components are used only where motion or state lives.
- **Content** lives in typed modules under `src/content/` (transcribed from the PDFs) plus a generated media manifest.
- **Motion**: GSAP 3.15 (ScrollTrigger, SplitText, Flip, DrawSVG, CustomEase), registered once in `src/lib/gsap.ts`. Lenis smooth scroll runs on the GSAP ticker (desktop fine pointers only). React `<ViewTransition>` handles page transitions.
- **Media**: pre-processed by `scripts/media/*` into `public/media/`. AV1 WebM + H.264 MP4 loops, posters, AVIF/WebP photo srcsets, and LQIPs.
- **State**: a tiny localStorage-backed route store (`src/lib/route/store.ts`) shared by tickers, index toggles, the nav badge and the builder.
- **Enquiry**: `src/lib/route/enquiry.ts`, with an adapter interface. Today: WhatsApp / mailto / copy. Later: a server adapter (Resend, Formspree, CRM) without UI changes.
