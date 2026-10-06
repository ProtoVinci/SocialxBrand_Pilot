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

**Red + blue from the logo (2026-10-06).** Blue is the cornflower sampled from the openai.com/codex hero the client supplied. Red is its exact complement: the same OKLCH lightness and chroma (0.643 / 0.187) with the hue turned from 270° to 22°. Both are used at full saturation so the colour reads as prominent. (History: navy-black → warm cream/yellow → deep iris/rose → pale Codex mist → this.)

| Token | Hex | Role |
|---|---|---|
| shell | `#FDF9F7` | base canvas |
| petal / petal-2 | `#F3ECE9` / `#E8DEDB` | cards, the departures board |
| periwinkle | `#C9D3FF` | soft act: cornflower tint (philosophy ladder, badge) |
| rose | `#FBC8C3` | soft act: matched red tint (audiences, approach philosophy) |
| iris / -2 / -3 / -deep | `#6281FD` / `#8F9FFB` / `#A4B4F8` / `#4658B1` | Codex cornflower: the `.act-iris` field, row floods, blue ticket headers |
| rouge / -2 / -3 / -deep | `#E95157` / `#EE6461` / `#F19F99` / `#A33737` | the complementary red: the `.act-rouge` field (finale), red ticket headers, hero glow |
| ink | `#12121A` | text and primary buttons (black pills, as on Codex) |
| muted | `#55556A` | secondary text |
| signal | `#FF3131` | logo red: the route line, stickers, accents on shell |
| signal-ink | `#B01C22` | small red text and red accents on soft acts (AA) |
| violet | `#8C52FF` | the logo's SOCIAL violet: "selected", the AI accent |

**Type in colour.** Blue `#3651E6` (`text-blue`) for section labels, links, buttons and every other accent word; the logo red for the rest. Wordmarks follow the logo: SOCIAL blue, BRAND PILOT red.

**Textures.** No flat fills: cornflower fields carry a white dot matrix, red fields a white grid, the periwinkle tint a blue grid, the rose tint red dots; plain shell surfaces use the faded `grid-paper` grid.

**Rules.**

- Bold acts are blurred radial-gradient fields (`.act-iris`, `.act-rouge`) with dark type. Inside them red accents become white (display) or ink (small).
- Primary buttons are black pills; the logo red is for the logo, the route line, stickers and single accent words.

## Interaction gimmicks

Taken from the reference research (`design-research.md`): a velocity marquee (Sol tickers) with inline reel stickers; a cursor follower that becomes a labelled bubble over `[data-cursor]` (fine pointers only, never hiding the native cursor); magnetic `.magnetic` CTAs; a spinning "Start your Pilot Route" badge; tilted stickers on the hero fan (Hanzo); hover tilt on screening cards; a cornflower flood on capability rows; the method as a split-flap departures board; each division's approach as a deck of boarding-pass tickets that deals out on scroll. All are off under reduced motion and on touch.

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
