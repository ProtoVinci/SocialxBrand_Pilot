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

## 4. Design system (current, after the prototype-1 merge)

Two prototypes: **prototype 1** = `C:UsersParthDesktopsujal_site` (visual reference only, never edited);
**prototype 2** = this repo (the primary). Styling came from prototype 1; content and motion are prototype 2.

### Type
Inter only (self-hosted, `src/app/fonts.ts`), system monospace for labels. Display is medium weight with tight
negative tracking. The `serif-accent` utility name is kept, but it is now Inter regular (no serif).

### Colour (token names kept from the old palette, so components re-themed in place)
| Token | Hex | Role |
|---|---|---|
| shell / petal / sand | `#FAF8F5` / `#F3EFE8` / `#F5F1EB` | warm canvas / subtle cards / alternate band |
| line / line-strong | `#E8E2D8` / `#D5CDBD` | card borders / hover |
| blue (cobalt ink) / blue-ink | `#2A3BA4` / `#1F2C85` | secondary accent: labels, links. Large accents use `ink-cobalt` (gradient text) |
| signal (vermilion) / signal-ink | `#D9412E` / `#B02D1C` | display red / small red text |
| cta / cta-hover | `#C4351F` / `#A8301F` | primary button fill (white text 5.4:1) |
| ink / muted | `#181614` / `#6B665F` | text |
Acts: `act-iris` (cobalt mid-tones), `act-rouge` (vermilion mid-tones), `act-periwinkle`, `act-rose` (tints), all with ink text.

### Home, top to bottom
1. **Hero** (`Opening.tsx`): Hanzo layout. Centred three-line headline with always-playing media capsules
   (`HeroPill`), window-light glare drifting (`fx/HeroGlare`), tools orbit (`fx/ToolsOrbit`, simple-icons). On
   scroll, the top capsule morphs into a full-screen reel, then the manifesto plays.
2. **Ladder**: "Marketing is more than being…". The reel swipes like a feed.
3. **Recent work** (`WorkShowcase`): Hanzo panel. Two endlessly looping columns (left up, right down), folder disc
   fixed at the panel centre. Vertical reels are staged upright in landscape tiles, never cropped.
4. **Marquee**.
5. **Capabilities** (`capabilities/DivisionBoard`): Elevix-style bento. Four cluster tiles plus a stage. Fits one
   screen at every desktop size (`short:` variant for short laptops). The stage changes only on pointermove or
   focus, after an intent delay; it runs an idle tour.
6. **Method board** (CSS sticky, scrambled names that resolve), then Audiences, AI, Finale.

### Wayfinding
`Crumbs` on every inner page, `WhereNext` at every inner page end, nav Home link, and the nav reappears near the
page end. Footer has Home and Back to top.

---

## 5. Changes history (newest first, condensed)

0. **Prototype-1 merge (2026-10-07, local session).** In order:
   - Retheme: Inter, warm canvas, vermilion and cobalt.
   - Hanzo hero: capsules, glare, orbit, morph takeover. The capsules use no SplitText; see §6.
   - Hanzo work panel; Elevix bento capabilities.
   - Reel-feed ladder and scrambled method board.
   - Wayfinding (crumbs, where-next).
   - Method board moved from a GSAP pin to CSS sticky (CLS 1.0 → 0).
   - New QA scripts (below).
1. **Colour in type + textures + performance.** Blue type tokens, alternating accents, logo wordmarks, textured acts, and the performance pass (§6).
2. **Matched red + saturation + tickets.** The red became the exact complement of the Codex blue; saturation was raised; division approach routes became tickets.
3. **Codex palette + departures board.** From the client's openai.com/codex screenshot; the wavy method timeline (`MethodRoute`) was replaced by `MethodBoard`.
4. **Logo red/blue + gimmicks.** Marquee, cursor, magnetic CTAs, badge, stickers, and card tilt. Fixed from a recording review: method title overlap, blurry rail posters, late AI lines, no mobile ladder reel, and the nav overlapping the hero.
5. **Light theme.** Dark mode dropped. The ladder was rebuilt (framed undimmed reel; fixed clipped word fragments).
6. **First cloud session.** `suggestRoute()` implemented; content-audit false positive fixed (`aspect-[4/5]`); SplitText `aria-label` a11y bug fixed (only headings get `aria: "auto"`); tests made offline-safe; `startup.bat`.

---

## 6. Gotchas (read before editing)

- **Never SplitText an element that contains React components** (the hero capsules). It rebuilds the DOM from copies,
  React keeps updating the detached originals, and the screen freezes. The hero lines use plain clip masks.
- **Prefer CSS sticky over GSAP `pin`** for long scenes. A pin engages a tick late, so landing mid-scene (back
  button, anchors) draws it a screen out of place.
- **Auto-cycling UI needs fixed box sizes.** Any height change shifts every pinned scene below it.
- **Hover previews: use pointermove plus an intent delay, never pointerenter.** Scrolling fires pointerenter.
- **Windows:** never write files with PowerShell 5.1 Get-Content/Set-Content (BOMs and cp1252 mojibake). Repo files
  are CRLF, so node string matches on "
" can silently miss. In Git Bash, `--routes=/` becomes a Windows path; run
  the QA scripts from PowerShell.
- **QA scripts** (dev server on :3100): `sweep.mjs` (stills), `record.mjs` (video plus console),
  `check-shift.mjs` (CLS and height stability), `check-flow.mjs` (a way home from every page end),
  `check-motion.mjs` (loops, disc, board).

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

0. **Prototype-1 merge: styling, hero and work panel are done.** Still open from `docs/merge-sujal-site.md`: the Pilot Check quiz, the FAQ, the problem-vs-solution section. Ask the user before adding them.
   Optional: make the hero takeover reel continue the clip the top capsule is showing.
1. **Reviewer round 1 is done** (`docs/reviews/round-1.json`), and batches 1 and 2 are fixed (`ea11be2`). Still open:
   - Footer: contact-grid and wordmark collisions; WhatsApp prominence; tap targets (RouteToggle h-9, footer links).
   - AI struck-line contrast: raise to about 0.55.
   - Dead-end CTA bands at the end of `/work`, `/work/[slug]` and the division pages.
   - Code: ScreeningMedia/AiAmplifies one-shots → `observeOnce`; DivisionTicker listener cleanup; DivisionIndex lazy previews; WorkIndex `aria-live` → count element.
   - Media: logo tile in 9:16 → contain; re-extract the blurred Celebrations poster.
   - Copy: hero CTA microcopy.
   - Creative: manifesto→ladder seam; inner-page hero objects; a `/route` redesign.

   After that, run reviewer round 2. The Workflow runner script has CRLF line endings, so pass it **inline**, not by `scriptPath`, and pin `model: "claude-opus-5-5"`.
2. **Re-sweep** after the fixes: `node scripts/qa/sweep.mjs`, and again with `--reduce`. The last full sweep was clean at all 6 viewports.
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
src/components/home/     Opening, Ladder, WorkShowcase, Marquee, MethodBoard, Audiences, AiAmplifies, Finale
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
