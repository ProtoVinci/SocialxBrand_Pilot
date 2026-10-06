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

**Red + blue, from the logo, in lighter and warmer shades (2026-10-06).** The logo is a red mark with a violet-blue "SOCIAL"; the palette lifts both into daylight. (History: the original navy-black theme was dropped at the client's request, then a warm cream/yellow pass was judged too repetitive in colour.)

| Token | Hex | Role |
|---|---|---|
| shell | `#FFF6F2` | base canvas: warm white with a rosy tint |
| petal / petal-2 | `#FBE8E4` / `#F4D6D0` | raised surfaces, cards, the method act |
| rose | `#FFD3CA` | colour act: light warm red (audiences, approach philosophy) |
| periwinkle | `#D9D1FF` | colour act: light warm blue (the philosophy ladder, the hero badge) |
| iris | `#6E40F2` | bold act: the logo violet-blue deepened for white type (manifesto wash, marquee, deliverables) |
| coral | `#FFB3A6` | the accent on iris |
| ink | `#1D1338` | text: deep indigo |
| muted | `#5A4F6E` | secondary text |
| signal | `#FF3131` | logo red: action, the route, display accents on shell, the finale act |
| signal-ink | `#B01818` | small red text, and red accents on rose/periwinkle (AA) |
| violet | `#8C52FF` | the logo's SOCIAL violet: "selected", the AI accent |

**Rules.**

- Red and blue alternate down the page: shell → iris → periwinkle → shell → iris → shell → petal → rose → shell → red → shell.
- `.act-iris` re-scopes the colour variables, so inside it `text-ink` is white, `bg-ink` is a white pill and red accents turn coral. `.act-rose` / `.act-periwinkle` deepen `text-signal` to signal-ink.
- Red appears at most once per headline. Purple means *selected*.
- Real footage is never dimmed, except for the manifesto takeover where the reel sinks under the iris wash.

## Interaction gimmicks

Taken from the reference research (`design-research.md`): a velocity marquee (Sol tickers) with inline reel stickers; a cursor follower that becomes a labelled bubble over `[data-cursor]` (fine pointers only, never hiding the native cursor); magnetic `.magnetic` CTAs; a spinning "Start your Pilot Route" badge; tilted stickers on the hero fan (Hanzo); hover tilt on screening cards; an iris flood on capability rows. All are off under reduced motion and on touch.

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
