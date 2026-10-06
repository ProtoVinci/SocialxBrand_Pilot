# Motion system

> Motion explains the brand's idea, a route through a business. If an animation can't say what it communicates, it doesn't ship.

## Principles

1. **One grammar.** One entrance ease (`pilot`), one transition ease (`glide`), and `none` for anything scroll-driven. Every value comes from `src/lib/motion/tokens.ts`.
2. **Hierarchy.** A few memorable primary moments, secondary motion that creates flow, and micro motion that confirms input.
3. **Meaning over decoration.** The signal line *is* the route. Text fills in *as the argument lands*. Reels play *because they are the work*.
4. **Re-choreograph, don't shrink.** Mobile gets different choreography, not a scaled-down copy of desktop.
5. **Complete without motion.** With reduced motion or no JS, every word and asset is present and readable.

## Tokens

| Token | Value | Use |
|---|---|---|
| `dur.micro` | 0.2s | press, badge |
| `dur.quick` | 0.35s | exits, nav hide/show |
| `dur.base` | 0.6s | block lifts, state swaps |
| `dur.slow` | 0.9s | display-type rises, curtain |
| `dur.cinematic` | 1.3s | media crossfades |
| `pilot` | cubic-bezier(0.22, 1, 0.36, 1) | entrances: a fast start with a long, calm tail |
| `glide` | cubic-bezier(0.65, 0, 0.35, 1) | curtains, menu, line draws |
| `snap` | power2.out | micro feedback |
| stagger | chars 0.018 · words 0.04 · lines 0.08 · cards 0.07, **total capped at 0.5s** | |
| reveal trigger | `top 82%`, once (IntersectionObserver via `src/lib/motion/observe.ts`, not ScrollTrigger) | |

The same values are mirrored as CSS variables (`--ease-pilot`, `--ease-glide`) for CSS transitions.

## Presets

| Preset | Motion | Component |
|---|---|---|
| `rise` | masked lines, yPercent 110 → 0, slow / pilot / lines stagger | `SplitReveal` (default) |
| `blur` | words, opacity 0 + blur 6px + y 10 → clear | `SplitReveal variant="blur"` |
| `chars` | masked characters, hero only | `SplitReveal variant="chars"` |
| `lift` | y 40 + fade, base duration; groups batch with capped stagger | `Reveal` / `Reveal group` |

Scroll reveals (`rise`, `blur`, `lift`) are driven by IntersectionObserver, and `SplitReveal` only splits a heading when it is about a screen away. They add no ScrollTriggers, which keeps `ScrollTrigger.refresh()` cheap on pages with pins.
| scrub | ease `none`, `scrub: 0.6–0.8` (smoothing), `invalidateOnRefresh` on geometry | set-pieces |

## Primary motion (memorable)

| Moment | What moves | What it communicates |
|---|---|---|
| Intro curtain | The ribbons slide in, then the curtain lifts (first visit only) | The brand mark "launches" the route |
| Hero assembly | Lines rise; the reel fan rotates in −75° → 0; the signal line draws | Real work, fanned like a hand of cards |
| Hero → manifesto (one pin, +230%) | Lines part in counter-motion, side reels and the stickers fall away, the centre reel takes over the screen, a dotted cornflower field rises over it, and the manifesto fills char by char; "activity" is struck and "impact" lands in white | Activity is not the goal; impact is |
| The Pilot Route: departures board (pin, +300%) | Seven stations on a split-flap board; the active row floods cornflower, its letters flap through the alphabet and land, its detail line opens, its status turns Next → Boarding → Cleared; a red progress line fills down the board | The method is travelled, in order |
| Finale (red gridded field) | Lane type fills; "YOU WILL GROW." grows and is underlined | The promise lands |
| Page transitions | The old page lifts out; the new one rises in; shared names morph (index → detail) | Same thing, going deeper |

## Secondary motion (flow)

- **Philosophy ladder**: CSS sticky, so no GSAP pin. One periwinkle act; the step comes from scroll progress; the red word swaps in a mask (±130% plus a fade) while the framed reel crossfades and the ticks turn red.
- **Screenings rail**: a pinned horizontal track; frames scale 0.86 → 1 toward centre, computed in the track tween's `onUpdate` from cached `offsetLeft`s (one ScrollTrigger, not one per frame).
- **Division tickers**: two rows in opposite directions (46s / 58s); hovering slows a row to 0.12×; paused off-screen.
- **Work filters**: Flip reflow with a 0.03 stagger. **Audience tabs**: Flip chips and a redrawn rule.
- **Principle deck**: sticky cards; the covered card scales to 0.94 and dims.
- **Photo drift**: images drift yPercent −6 → 6 inside their frames (scrubbed).
- **Marquee band**: "WE WILL SHOW / *you will grow*" with inline reel stickers, plus the ladder words reversed; scroll velocity speeds it up, scroll direction reverses it, fast scrolls skew it, then it settles.
- **Approach tickets** (division pages): one perforated boarding pass per station, blue/red headers, dealt out from a stack into a row as the section scrolls (desktop); rising in on mobile.

## Micro motion (feedback)

Rolling nav labels (0.45s pilot); CTA lift −2px; route toggle (+ rotates to ✓, fills purple); a nav badge pop; a cursor-following reel preview on the capabilities index (fine pointers, `quickTo` x/y 0.6s); capability rows flood cornflower on hover (CSS, no React state); a menu clip-path reveal.

**Pointer gimmicks** (`components/fx/`, fine pointers + motion only): a blue cursor dot that swells into a labelled bubble over `[data-cursor]` ("Watch", "View", "Go"); magnetic `.magnetic` CTAs; a spinning "Start your Pilot Route" badge in the hero; stickers that slap onto the hero fan; screening cards that lift and tip on hover.

## Media behaviours (variation is intentional)

| Asset | Behaviour |
|---|---|
| Hero reels | Autoplay in view, fanned; the centre reel takes over the screen |
| Ladder reels | Crossfade + scale 1.08 → 1 per step |
| Rail reels | Autoplay while ≥35% visible; scale toward centre |
| Index tiles / next teasers | Play on hover only; reset on leave |
| Screening reels | Staggered grid; each plays in view |
| Landscape films | Full-width frames |
| Photos | Scrubbed parallax drift; hover zoom on tiles |

**VideoBudget** caps concurrent decoding at 3 on desktop and 2 below 768px; extra videos pause. A video downloads only when the budget grants it a slot (`play()` starts the fetch; `preload` stays `none`), so reels left on their poster cost nothing. Sources are AV1 WebM (omitted when it isn't ≥10% smaller) and H.264 MP4 faststart, plus a poster (the hero's centre poster is `fetchPriority="high"`) and an LQIP.

## Scroll rules

- **Pins on home**: the opening (hero + manifesto merged), screenings and the departures board. All three are desktop-only (`cinema`). The ladder uses CSS sticky.
- **Smooth scroll**: Lenis, lerp 0.15 (snappy), driven by `gsap.ticker`, off for touch and reduced motion. `ScrollTrigger.refresh()` runs after `document.fonts.ready` on client-side route changes only; on first load ScrollTrigger's own load refresh is enough.
- **Keep the trigger count low**: every refresh re-measures every trigger. Prefer IntersectionObserver for one-shot reveals and one computed `onUpdate` over many inner triggers.
- **Geometry** for the takeover is measured from layout boxes (`offset*`), never from transformed rects.

## Responsive motion

| Feature | Desktop (`cinema`) | Mobile (`pocket`) |
|---|---|---|
| Opening | One pin, takeover | No pin; hero then manifesto stacked; fan of 5 at the bottom of the first screen |
| Screenings | Pinned horizontal | Native scroll-snap swipe rail |
| Departures board | Pinned; rows board in order | No pin; each row flaps once as it enters |
| Capabilities preview | Cursor-following reel | None (rows link through) |
| Video budget | 3 | 2 |

## Reduced motion

- `gsap.matchMedia()` has a `reduce` branch that sets everything to its final state.
- No pins, scrubs, tickers or smooth scroll.
- View transitions are instant (CSS). Reels show posters with a Play/Pause button.
- The ladder renders as a static list, and the strike-through and red "impact" render statically.
- The inline head script only sets `html.js-motion` when motion is allowed, so CSS never hides content for reduced-motion users.
- A 2.5s CSS failsafe reveals anything still hidden if scripts fail. The intro curtain has a 3s failsafe.

## Accessibility rules for motion

- Motion never carries information on its own.
- Split text keeps an accessible label (SplitText `aria: auto`).
- Decorative reels are `aria-hidden`; meaningful ones carry labels.
- Focus moves to the new step heading in the builder.
- The menu closes on Escape and returns focus.
