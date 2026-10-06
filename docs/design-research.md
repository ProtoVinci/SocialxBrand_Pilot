# Design research

How the 12 reference sites were studied, and what we kept, changed or rejected for SOCIALxBRAND PILOT (SxBP).

## Method

Each reference was dissected in two ways.

1. **Visually**, by browsing and screenshotting heroes and key sections at 1440×900.
2. **From the raw HTML.** Framer serialises its animation presets into a `framer/appear` JSON block and `data-framer-name` attributes, so we could read real numbers instead of guessing them: offsets, springs, durations, eases and staggers. We also extracted section order, nav model, type scale and colour tokens.

## What each reference taught

| Reference | Known for | What we took | What we rejected |
|---|---|---|---|
| Scale Studio | system thinking | One enforced motion grammar (one ease, two reveal presets). A fixed case scaffold that links services back to divisions. | Logo-ipsum strips, a placeholder "team", a pricing card. |
| Aigenix | premium visual | A giant cropped wordmark as a hero element. A live locale clock (we use **India · IST**). A two-speed spring feel: floaty content, snappy chrome. | Award tables, a "4.9/5 from 24 reviews" badge, round vanity stats. |
| Hanzo | editorial restraint | A role-scaled blur word reveal. Tilted reel "stickers" settling to a small residual tilt. | The design-subscription template stack (pricing, "Subscribe/Request/Receive" process, FAQ). |
| Sol | bold personality | Scroll-settling media band (y 300 → 0, scale 1.15 → 1). Bidirectional pill tickers that slow on hover. Sticky stacked cards. | Fake multiplayer cursors, "97% success rate", landscape-only stock video. |
| Ovlaya | narrative scrolling | **Mixed sans caps + serif italic headline.** Scroll-scrubbed character fill for a manifesto. Sticky stacked process cards. | Thin case pages (a metadata table plus an image dump). |
| Flypim | service clarity | A sentence-led scope intro. **The same division names everywhere, including the enquiry form.** | Placeholder "CEO of Wednesday" testimonials, a stock hero video. |
| CreatorFlow | proof + process | Platform-native framing for creator work. Process steps with tiny working illustrations. Meaningful tickers. | A 55-particle starfield. Fade-up-everything at threshold 0.5. |
| Elevix | strategic credibility | Serif display for credibility. **A sticky scroll-spy navigator for many services.** | Trustpilot badges, "21,000+ customers", a fake dashboard. |
| Whenevr | simplicity | **A rotate-in fan of cards (−75° → 0).** A hero build-up staggered 0.2s apart. Edge-faded tickers. | A 2.5s preloader holding the hero hostage. Cloned testimonial columns. |
| PromptIQ | systems/outcomes | Blur-in text as light coming into focus. **An edge-to-edge footer wordmark.** A sticky split for long lists. | A "vs other tools" checklist, a pricing table, mock UI. |
| Pixello | information architecture | A word-by-word blur assemble. Ticker walls built from real category names. A scroll-scrubbed paragraph. | Six identical numbered service cards and a single price card. |
| Framo | cinematic presentation | A heavy poster headline at line-height ~0.76. **A dual-speed vertical-reel ticker.** **A bracketed mono index system.** An index table with a cursor-following preview for many items. | An "Awards (07)" table, "128+ works" meta, per-character effects on 300+ spans. |

## Cross-reference findings that shaped the system

1. **Every reference is landscape-first.** SxBP's real portfolio is about 90% **vertical 9:16 reels**. Putting reels in 16:9 rounded boxes would letterbox or crop the actual work, so the whole media system is designed around native 9:16 frames: the fan, the screenings rail, the reel grid and the cursor preview.
2. **Proof patterns are the most template-y part of every reference.** Most of them invent logos, stats, ratings or awards. We have none of these, and we refuse to fabricate them. Trust is built from real work (500 assets), specificity (all 18 divisions with their real deliverables and approach chains), a visible method, and real contact details.
3. **Motion grammar matters more than effects.** The best references enforce one ease and a couple of presets. The weakest fade up everything. We codified one grammar (see `motion-system.md`) and spend the motion budget on a few owned set-pieces.
4. **Many services need an index, not cards.** Framo's index table, Elevix's scroll-spy and Sol/Whenevr's tickers all beat a wall of 18 cards.
5. **Measured defaults we adopted.** Springs in the references mostly sit at stiffness 280–400 / damping 50–80 (overdamped, no bounce). Tweens cluster around 0.4–1.0s with `cubic-bezier(0.44,0,0.56,1)`. Staggers run 0.04–0.1s. We chose a punchier ease, `pilot` = (0.22, 1, 0.36, 1), and the same family of staggers.

## Specialist skills consulted

`taste-gsap` led us to merge the hero and manifesto into **one** pinned sequence and keep the philosophy ladder on CSS sticky rather than a GSAP pin, which reduced the pins on the home page. Its fixed rules were not adopted wholesale. The cinematic-motion skill's blue/no-serif palette was ignored in favour of the SxBP brand.
