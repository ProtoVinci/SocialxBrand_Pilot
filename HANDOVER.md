# HANDOVER: SOCIALxBRAND PILOT website

> **New session told only "continue"?** Read this whole file, then `AGENTS.md`. Pick up at **§7 Next steps**, in order. Keep this file current and commit it with your changes.

Last updated: 2026-10-06 (cloud session). Repo: https://github.com/ProtoVinci/SocialxBrand_Pilot. **Work directly on `main`.** The client asked for one branch only. A leftover remote branch `claude/epic-einstein-dj8x13` points at an old commit of `main`; delete it if it still exists (the cloud session's git proxy refuses branch deletions).

---

## 1. The job

Build the complete, motion-led website for **SOCIALxBRAND PILOT** (SxBP), an Indian digital marketing agency. Promise: "We will show, you will grow." The brief's core line is **"The motion IS the website."**

- **Client priorities, in order:** motion design > visual quality > typography > interaction > brand expression > UX > content structure > architecture.
- The client wants excellent typography, strong animation, video and photos that feel alive, and (since the redesign rounds) **prominent red + blue colour, textured, never flat or "vibe-coded"**.

### Hard rules

- **Never invent** clients, metrics, ROI, testimonials, awards, follower counts, years in business, a team, certifications, partnerships, prices or a city. The location is "India · IST" only. `tests/content-audit.spec.ts` guards this.
- Every claim comes from `src/content/*`, transcribed from `docs/source/*.pdf`.
- Real work only (the client's Drive). Keep "Production partner: Vishay Creations". Never letterbox 9:16 reels.
- Reduced motion and no-JS must show all content.

### Client decisions (binding)

- **Contact:** adapters (WhatsApp / mailto / copy) in the `/route` builder; add an API adapter later if the client wants one.
- **Look:** light theme only (dark mode was dropped). The colours are **red + blue from the logo**: blue is the cornflower sampled from a screenshot of openai.com/codex the client supplied, and red is its exact complement. Every colour surface is **textured** (dots or grid).
- **Specialist skills** in `.claude/skills/` are optional tools; the SxBP direction always wins over their palettes and rules.
- **Hosting/launch:** `startup.bat` for the client's Windows machine (see §3).

---

## 2. Status

| Area | State |
|---|---|
| Stack | Next.js **16.3.8** (Turbopack), React 19.2, TS 5, Tailwind **4**, ESLint 9, gsap 3.15 (ScrollTrigger, SplitText, Flip, CustomEase, DrawSVG), @gsap/react, Lenis 1.3 |
| Pages | `/`, `/work`, `/work/[slug]` (14), `/capabilities`, `/capabilities/[slug]` (18), `/approach`, `/route`; `/contact` → `/route`; 404. **43 static pages build.** |
| Content | All 18 divisions verbatim (`divisions.ts`), the company profile (`site.ts`), 14 screenings (`work.ts`), 95 curated media assets (43 videos, 52 photos) in `public/media/` |
| SEO | metadataBase `https://www.sxbp.com`, canonicals, sitemap, robots, OG image (in the current palette), JSON-LD |
| Tests | `npm test` → **33/33 pass** (smoke + overflow at 3 viewports, axe, reduced motion, route builder → WhatsApp, content audit) |
| Checks | `npx tsc --noEmit`, `npx eslint src` and `npm run build` are clean. The axe colour-contrast audit is clean apart from elements caught mid-animation. |
| Launcher | `startup.bat` (Windows), tested under Wine with Windows Node 22 across 12 scenarios |
| Performance | Measured with `scripts/qa/perf.mjs` at 4× CPU: home load blocking time 2.4s (was 4.1s), home scroll ~30 fps (was 24), capabilities ~50 fps (was 34, with a 2s freeze removed), work ~53 fps, approach ~45 fps |
| Docs | `docs/design-brief.md` (the **current** colour and texture system), `docs/motion-system.md` (current), `design-research.md`, `site-architecture.md`, `content-map.md`, `plan.md` (the original approved plan, kept as a record) |

---

## 3. How to run

**Windows, one click:** double-click `startup.bat`. It checks Node ≥ 20.9, runs `npm install` only when `node_modules` is missing or older than `package-lock.json`, picks the first free port from 3100, starts the dev server and opens the browser once the site answers.
- Options, combinable in any order: `prod` (build + production server), a port number, `--no-open`, `help`.
- Its helpers are in `scripts/tooling/` (`deps-fresh.mjs`, `free-port.mjs`, `open-when-ready.mjs`). `.gitattributes` keeps `.bat` files CRLF.

**Anywhere:**

```bash
npm install
npm run dev -- --port 3100          # 3000 is taken by another project on the client's machine
npx tsc --noEmit && npx eslint src
npm run build && npm run start -- --port 3100
npm test                            # Playwright; starts/reuses a server on :3100
```

**QA scripts** (they expect a server on :3100; pass `--base=` otherwise; output goes to `qa-shots/`, which is gitignored):

```bash
node scripts/qa/shoot.mjs --url=/ --vp=1440x900 --at="0,25%,#method-title+200" --wait=1400 --repeat
node scripts/qa/debug.mjs --url=/ --scroll=4000                # page errors + probes
node scripts/qa/perf.mjs --url=/ --cpu=4 --scroll=7000         # load metrics + scroll fps/jank (prod build only)
```

- `shoot.mjs` positions accept px, `vh`, `%` or `#id+offset` (negative offsets as `#id+-200`). `--repeat` skips the intro curtain, and `--reduce` emulates reduced motion.
- Screen recordings were made with Playwright `recordVideo` while wheel-scrolling, then converted with ffmpeg.

**Cloud-session notes:**
- Run `npx next typegen` before `tsc` on a fresh checkout.
- Set `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` for `npm test` and all `scripts/qa/*` (the preinstalled Chromium differs from this Playwright version). Never run `playwright install`.
- `*.framer.website`, `openai.com` and `web.archive.org` are blocked by the environment's network policy.

### Media pipeline (only to re-curate)

The raw originals (`media-source/`, 1.5 GB) are gitignored and not in the repo; the processed `public/media/` is committed.
1. Run `scripts/media/inventory.mjs` then `contact-sheet.mjs`, or copy `docs/source/drive-contact-keys.json` / `download-plan.json` into `media-source/`.
2. Run `mosaic.mjs` and curate `selection.json`.
3. Run `download.mjs --probe`, then `download.mjs`.
4. Run `transcode.mjs` (needs ffmpeg with libsvtav1 + libx264).

The Drive root is `1aW_4Cg8rG6wv5QpH_2RvEjvzOkT59yWR`. Every video there is named "Vishay Creations.mov", so the Drive id is the only key.

---

## 4. Design system (current; details in `docs/design-brief.md`)

### Colour: red + blue, textured

| Token | Hex | Role |
|---|---|---|
| shell / petal | `#FDF9F7` / `#F3ECE9` | canvas / cards and the board |
| periwinkle / rose | `#C9D3FF` / `#FBC8C3` | soft acts (blue tint / red tint) |
| iris family | `#6281FD` (+ `#8F9FFB`, `#A4B4F8`, `#4658B1`) | Codex cornflower: `.act-iris` gradient fields, row floods, blue ticket headers |
| rouge family | `#E95157` (+ `#EE6461`, `#F19F99`, `#A33737`) | the exact OKLCH complement (same L/C, hue 270° → 22°): `.act-rouge` fields (finale) |
| blue / blue-ink | `#3651E6` / `#2F49D6` | **type and UI blue**: section labels, accent words, links, buttons, selection, focus |
| signal / signal-ink | `#FF3131` / `#B01C22` | logo red (route line, stickers, display accents) / small red text |
| ink / muted | `#12121A` / `#55556A` | text |
| violet | `#8C52FF` | "selected" (route toggles) |

- **Acts re-scope colour variables.** Inside `.act-iris`/`.act-rouge`, red accents become white or ink and blue becomes ink. Inside `.act-rose`/`.act-periwinkle`, red deepens to signal-ink and blue to blue-ink. Don't hard-code colours in components; use the tokens so these overrides keep contrast.
- **Textures:**
  - iris: white dot matrix
  - rouge: white grid
  - periwinkle: blue grid
  - rose: red dots
  - `grid-paper` utility: a faint ink grid faded at the edges (hero, departures board, footer)
- **Accent words alternate red and blue** from section to section. The hero's second line is blue. Wordmarks follow the logo: SOCIAL blue, BRAND PILOT red.
- Primary buttons are blue pills. On red fields they are ink.

### Type

- **Bricolage Grotesque** (variable `wdth`/`opsz`, display at `font-stretch` 76–88%, mega tracking −0.022em).
- **Instrument Serif** italic for the one accent word per headline.
- **Geist** for body, and **Geist Mono** for the `[ 01 ]` labels.

### Motion grammar (`src/lib/motion/tokens.ts`; details in `docs/motion-system.md`)

- **Eases:** `pilot` (entrances), `glide` (swaps and lines), `none` (scrub).
- **Durations:** 0.2 / 0.35 / 0.6 / 0.9 / 1.3. **Staggers** are capped at 0.5s total.
- **`cinema`** (CSS variant and `MQ.cinema`) means desktop ≥768 **and** motion allowed. A head script sets `html.js-motion`, and `intro` on the first visit.
- **Reveals use IntersectionObserver** (`src/lib/motion/observe.ts`), not ScrollTrigger. Keep the ScrollTrigger count low (§6).

### Home acts (in order)

| # | Act | What it does |
|---|---|---|
| 0 | Curtain | Logomark, first visit only |
| 1 | Hero (shell + `grid-paper` + blue/red glows) | "EVERY BUSINESS / **HAS SOMETHING** (blue) / *worth showing.*"; a fan of 5 reels with stickers ("Real work · no stock", "Made in 9:16 ✦"); a spinning route badge |
| 1→2 | One pin (+230%) | The centre reel takes over; a dotted cornflower field rises; the manifesto fills char by char; "activity" is struck, "impact" lands white |
| 3 | Ladder (periwinkle, CSS sticky) | The red word swaps seen → moving forward; a framed reel crossfades |
| 4 | Screenings (pin) | A horizontal rail of 9:16 reels; cards tilt on hover; "Watch" cursor |
| 4b | Marquee (iris field) | "WE WILL SHOW / *you will grow*" with inline reel stickers; velocity-driven |
| 5 | Capabilities | Tickers + a 4-cluster index; rows flood cornflower; cursor reel preview |
| 6 | **Departures board** (pin +300%) | `MethodBoard`: a split-flap board; the active station floods, flaps, Next → Boarding → Cleared |
| 7 | Audiences (rose) | Tabs; route chips from `suggestRoute()` |
| 8 | AI | Strike-and-replace typography |
| 9 | Finale (rouge field, gridded) | "WE WILL SHOW." fills, and "YOU WILL GROW." grows in white |
| — | Footer (`grid-paper`) | Contacts, a live IST clock, a giant logo-coloured wordmark |

Division pages show their approach as **boarding-pass tickets** (`ApproachRoute`) that deal out from a stack. `/approach` reuses the departures board and has blue/red vision/mission fields.

### Pointer gimmicks (`src/components/fx/`; fine pointers + motion only)

- A cursor follower (blue dot → labelled bubble over `[data-cursor]`).
- Magnetic `.magnetic` CTAs.
- `SpinBadge`.

All of them use event delegation, so they survive page transitions.

---

## 5. Changes history (newest first, condensed)

1. **Colour in type + textures + performance.** Blue type tokens, alternating accents, logo wordmarks, textured acts, and the performance pass (§6).
2. **Matched red + saturation + tickets.** The red became the exact complement of the Codex blue; saturation was raised; division approach routes became tickets.
3. **Codex palette + departures board.** From the client's openai.com/codex screenshot; the wavy method timeline (`MethodRoute`) was replaced by `MethodBoard`.
4. **Logo red/blue + gimmicks.** Marquee, cursor, magnetic CTAs, badge, stickers, and card tilt. Fixed from a recording review: method title overlap, blurry rail posters, late AI lines, no mobile ladder reel, and the nav overlapping the hero.
5. **Light theme.** Dark mode dropped. The ladder was rebuilt (framed undimmed reel; fixed clipped word fragments).
6. **First cloud session.** `suggestRoute()` implemented; content-audit false positive fixed (`aspect-[4/5]`); SplitText `aria-label` a11y bug fixed (only headings get `aria: "auto"`); tests made offline-safe; `startup.bat`.

---

## 6. Gotchas (read before editing)

1. **`clearProps: undefined` crashes GSAP.** Add optional keys conditionally (see `SplitReveal`).
2. **A base `relative` beats a caller's `absolute`** in Tailwind's order. `Reel`, `Photo`, `RouteToggle` and `SpinBadge` add `relative` only when the caller didn't pass `absolute`/`fixed`.
3. **A transformed ancestor re-anchors `absolute` children.** GSAP transforms on the hero CTA row did this to the badge, so the badge now sits outside that row.
4. **StrictMode double-invokes `useGSAP`.** Pin `y: 0` when tweening `yPercent`.
5. **Geometry from `offset*` layout boxes, never `getBoundingClientRect`** (takeover, rail, tickets).
6. **`-webkit-text-stroke` on Bricolage shows its internal contours.** The `.lane` effect uses `background-clip:text` stripes.
7. **Tailwind scans `src/` only** (`@import "tailwindcss" source("..")`).
8. **ESLint react-hooks v7:** no `contextSafe` closures reading refs; no setState in effects.
9. **SplitText `aria`:** use `"auto"` only on h1–h6. `aria-label` on spans and paragraphs is an axe violation.
10. **`gsap.quickSetter` has no `scale` shorthand.** Use `scaleX` + `scaleY`.
11. **GSAP's `context.add(fn)` returns void** (it runs `fn` now, inside the context). For late work inside a `matchMedia` handler, call `() => context.add(() => …)`.
12. **Keep ScrollTriggers few.** Every `ScrollTrigger.refresh()` re-measures them all, and with three pins on home each extra trigger made refreshes slower. One-shot reveals go through `observeOnce` (IntersectionObserver); per-item scroll effects go in one `onUpdate`.
13. **Hover state never goes in React state on big lists.** `DivisionIndex` re-rendered 18 reels per hover (a 2s freeze); it now toggles data attributes.
14. **Videos:** never set `preload="auto"` on visibility. `play()` from the budget starts the download, so reels that stay on their poster cost nothing.
15. **Next 16:** `params` is a Promise (`PageProps<"/x/[slug]">`). `next lint` no longer exists.
16. **Windows:** PowerShell `Set-Content` re-encodes UTF-8, so use the Edit tool. With PowerShell 5.1 quoting, prefer `git commit -F file`.
17. **Batch files:** call any `.cmd` (npm, a node shim) with `call`, or the script ends silently. Wine's `where` and `findstr /r /x` don't behave like Windows', so the launcher avoids them.

---

## 7. Next steps (in order)

1. **Run the 5 reviewer agents** (creative-director, motion-director, conversion-critic, frontend-reviewer, visual-qa; personas in `.claude/agents/`; runner: Workflow tool with `scriptPath: scripts/tooling/review-workflow.js`, model pinned). The **motion-director review is owed** under `AGENTS.md` after all the motion changes. Fix substantive findings, then run a second round.
2. **Full visual QA sweep** of every route at 1440×900, 1280×720, 1024×768, 768×1024, 390×844 and 360×800, plus `--reduce`. Inner pages at tablet sizes have had the least attention.
3. **Home load cost.** It's still the heaviest page (blocking time ~2.4s at 4× CPU), mostly React hydration plus the setup of the three pinned acts. Ideas: defer setup of below-the-fold acts to idle time (mind pin order: `refreshPriority` / `ScrollTrigger.sort()`); trim the hero's first-frame work.
4. **Route builder tests** for the mailto and copy adapters (WhatsApp is covered).
5. **Production smoke test:** the sitemap output, the OG image render, all 14 + 18 slugs.
6. **Optional:** a `/lab` bench for hero variants; a scroll-scrubbed short-GOP hero clip.

---

## 8. File map

```
startup.bat              Windows launcher (+ scripts/tooling/{deps-fresh,free-port,open-when-ready}.mjs)
src/app/                 layout.tsx (fonts, head motion script, Nav/Footer/SmoothScroll/PointerFx, JSON-LD), page.tsx (home acts),
                         work/, capabilities/, approach/, route/, sitemap.ts, robots.ts, opengraph-image.tsx, not-found.tsx,
                         globals.css (tokens, acts + textures, utilities incl. grid-paper/lane, view-transition CSS)
src/content/             divisions.ts, site.ts, work.ts, media.generated.json
src/lib/                 gsap.ts, motion/{tokens,observe}.ts, route/{store,suggest,enquiry}.ts, seo.ts, previews.ts
src/components/home/     Opening, Ladder, Screenings, Marquee, MethodBoard, Audiences, AiAmplifies, Finale
src/components/fx/       PointerFx (cursor + magnetic), SpinBadge
src/components/          capabilities/{DivisionIndex,DivisionTicker,RouteToggle,ApproachRoute (tickets)}, work/{WorkIndex,ScreeningMedia},
                         route/RouteBuilder, approach/PrincipleStack, media/{Reel,Photo,video-budget}, motion/{SplitReveal,Reveal,SmoothScroll},
                         layout/{Nav,Footer,FooterWordmark,Clock,PageShell,PageHeader}, brand/{Mark,mark-paths}, seo/JsonLd
tests/                   site.spec.ts, content-audit.spec.ts (playwright.config.ts honours PW_CHROMIUM_PATH)
scripts/qa/              shoot.mjs, debug.mjs, perf.mjs
scripts/media/           inventory, contact-sheet, mosaic, selection.json, download, transcode
scripts/tooling/         agents.mjs (regenerates reviewer agents), review-workflow.js
docs/                    design-brief (current colour/texture), motion-system (current), design-research, site-architecture,
                         content-map, plan (original plan, kept as record), source/ (PDFs + Drive inventory)
.claude/agents + .opencode/agents   5 reviewers     .opencode/skills   6 project skills     .claude/skills   optional specialists
```
