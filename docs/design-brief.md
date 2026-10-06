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

**Red + blue from the logo, softened to a Codex-style cornflower and a complementary coral (2026-10-06).** The client found the deep iris too dark and "vibe coded", and pointed to the openai.com/codex hero: blurred cornflower gradient fields, black type, black pill buttons. The blues below were sampled from that screenshot. (History: navy-black → warm cream/yellow → deep iris/rose → this.)

| Token | Hex | Role |
|---|---|---|
| shell | `#FDFAF8` | base canvas: warm white |
| petal / petal-2 | `#F5F0ED` / `#EBE3DF` | cards, the departures board |
| periwinkle | `#DFE5FF` | soft act: pale cornflower mist (philosophy ladder, badge) |
| rose | `#FFE4DE` | soft act: pale coral mist (audiences, approach philosophy) |
| iris / iris-2 / iris-3 | `#6B85FC` / `#A4B4F8` / `#BDC5FA` | cornflower (Codex): the `.act-iris` gradient field, row floods |
| coral / coral-2 / coral-3 | `#FF8A78` / `#FFB6A8` / `#FFD6CD` | complementary red: the `.act-coral` gradient field (finale), hero glow |
| ink | `#12121A` | text and primary buttons (black pills, as on Codex) |
| muted | `#5B5B6B` | secondary text |
| signal | `#FF3131` | logo red: the route line, stickers, display accents on shell |
| signal-ink | `#B81D1D` | small red text, and red accents on the soft acts (AA) |
| violet | `#8C52FF` | the logo's SOCIAL violet: "selected", the AI accent |

**Rules.**

- Bold acts are blurred radial-gradient fields (`.act-iris` cornflower, `.act-coral` coral) with dark type, never solid saturated blocks. Inside them red accents become white (display) or ink (small text).
- Primary buttons are black pills; the logo red is reserved for the logo, the route line, stickers and single accent words.
- Order down the home page: shell (with cornflower and coral glows) → iris field (manifesto) → periwinkle → shell → iris field (marquee) → shell → shell board → rose → shell → coral field (finale) → shell.

## Interaction gimmicks

Taken from the reference research (`design-research.md`): a velocity marquee (Sol tickers) with inline reel stickers; a cursor follower that becomes a labelled bubble over `[data-cursor]` (fine pointers only, never hiding the native cursor); magnetic `.magnetic` CTAs; a spinning "Start your Pilot Route" badge; tilted stickers on the hero fan (Hanzo); hover tilt on screening cards; a cornflower flood on capability rows; the method as a split-flap departures board. All are off under reduced motion and on touch.

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
