# Design brief: "The Pilot Route"

## The idea

Every business gets a **route**, not a package. SxBP's own philosophy (be seen → remembered → trusted → chosen → move forward) and its method (understand → … → grow) are both journeys, and "not every business needs every service" means every route is different.

One recurring motif carries this: **the red signal line**. It is born from the logomark: the ribbon draws, then the play-triangle "launches" it. After that it:

- threads under the hero headline and into the fan of real work;
- becomes the 1px route-progress line under the nav;
- draws through the seven method stations;
- draws each division's own approach chain;
- connects the stations a visitor picks in the route builder;
- underlines "YOU WILL GROW."

A second motif comes from the logo's **multi-line inline stencil** in BRAND PILOT. It reappears as "lane" type: striped numerals and the outlined-then-filled "WE WILL SHOW."

## Personality → design

| Brand trait | Expressed as |
|---|---|
| Professional | Hairline grids, `[ 01 ]` bracketed mono indices, verbatim PDF content, real contact details everywhere |
| Creative | Condensed display type against serif italics, real reels as the hero, the route motif |
| Growth-driven | Every page ends in a route/next step; the route builder converts selections into an enquiry |

## Colour

**Daylight, not dark (changed 2026-10-06 at the client's request).** The original navy-black theme read as one long dark tunnel and buried the real footage under dimming overlays. The site is now bright and warm: a cream canvas, broken by full-bleed colour acts. The logo red and violet are unchanged.

| Token | Hex | Role |
|---|---|---|
| cream | `#FFF5E8` | base canvas |
| sand / sand-2 | `#F8E7D0` / `#F1D9B8` | raised surfaces, cards, the method act |
| sun | `#FFD45C` | colour act: butter yellow (manifesto wash, audiences) |
| peach | `#FFB892` | colour act: apricot (deliverables, a ladder rung) |
| blush | `#FFD3CB` | colour act: rose (capabilities, approach philosophy) |
| ink | `#23150F` | text: warm espresso |
| muted | `#6F5B4F` | secondary text on cream |
| signal | `#FF3131` | logo red: action, the route, display accents on cream, the finale act |
| signal-ink | `#B01818` | small red text anywhere, and red accents on colour acts (AA) |
| violet | `#8C52FF` | wordmark purple: "selected / on your route", the AI accent |

**Rules.**

- Red appears at most once per headline. Logo red only clears contrast on cream; on sun, peach and blush, red accents use signal-ink (the `.act-*` classes do this automatically for `text-signal`).
- Purple means *selected*.
- Colour acts (`.act-sun`, `.act-peach`, `.act-blush`) alternate with cream. The philosophy ladder walks through blush → peach → sun → sand → cream as its word changes. The finale is the one full-red act, right before the cream footer.
- Real footage is never dimmed: it sits in framed 9:16 cards at full brightness. The only wash is the manifesto takeover, where the reel sinks under a butter-yellow layer.

## Typography

All fonts are open-licensed and self-hosted through `next/font`.

| Role | Face | Settings |
|---|---|---|
| Display | **Bricolage Grotesque** (OFL), variable `wdth` 75–100 + `opsz` | 700, `font-stretch: 76–88%`, tracking −0.022 to −0.035em, line-height 0.86–0.95 |
| Accent | **Instrument Serif** italic (OFL) | one or two words per headline, the same size, often in signal red |
| Body / UI | **Geist** (OFL) | 16–20px, line-height 1.45–1.5 |
| Labels / indices | **Geist Mono** | 12px uppercase, +0.08em |

**Why Bricolage.** Its condensed width axis gives poster-scale headlines real character, echoing the chunky "SOCIAL" wordmark without imitating it. A static grotesk can't flex like that.

Tracking was opened from −0.045em to −0.022em on mega type after the first browser pass. Heavier tracking made the condensed glyphs overlap and show seams.

## What we will never show

Invented clients, testimonials, metrics, ROI, follower counts, awards, years in business, certifications, partnerships or a city. The location is "India · IST" only. Work pages describe what is *visible* (format, craft, capabilities shown) and carry the **"Production partner: Vishay Creations"** credit.
