# HANDOVER: SOCIALxBRAND PILOT website

> **New session told only "continue"?** Read this whole file, then `AGENTS.md`. Pick up at **§7 Next steps**, in order. Keep this file current and commit it with your changes.

Last updated: 2026-10-17 (Pilot6 full audit, see §5 and `docs/reviews/pilot6-audit-2026-10-17.md`). Repo: https://github.com/ProtoVinci/SocialxBrand_Pilot. **Work directly on `main`.** The client asked for one branch only. A leftover remote branch `claude/epic-einstein-dj8x13` points at an old commit of `main`; delete it if it still exists (the cloud session's git proxy refuses branch deletions).

---

## 1. The job

Build the complete, motion-led website for **SOCIALxBRAND PILOT** (SxBP), an Indian digital marketing agency. Promise: "We will show, you will grow." The brief's core line is **"The motion IS the website."**

- **Client priorities, in order:** motion design > visual quality > typography > interaction > brand expression > UX > content structure > architecture.
- The client wants excellent typography, strong animation, video and photos that feel alive, and (since the redesign rounds) **prominent red + blue colour, textured, never flat or "vibe-coded"**.

### Hard rules

- **Never invent** metrics, ROI, ratings, awards, follower counts, years in business, certifications, partnerships, prices or a city. The location is "India · IST" only. `tests/content-audit.spec.ts` guards this.
- Every claim comes from `src/content/*`: the company PDFs in `docs/source/`, plus what the owner supplied directly: the founders (`founders.ts`) and the client feedback (`feedback.ts`: drafted on the clients' behalf with their permission and published on the owner's decision; see that file's header). Never add to either without the owner.
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
| Stack | Next.js **16.3.8** (Turbopack), React 19.2, TS 5, Tailwind **4**, ESLint 9, gsap 3.15 (ScrollTrigger, SplitText, Flip, CustomEase), @gsap/react, Lenis 1.3 |
| Pages | `/`, `/work`, `/work/[slug]` (14 collections), `/capabilities`, `/capabilities/[slug]` (18), `/approach`, `/about`, `/route`; `/contact` → `/route`; 404. **44 static pages build.** |
| Content | 18 services verbatim (`divisions.ts`) in four groups (`service-groups.ts`), the company profile (`site.ts`), 14 work collections (`work.ts`), 95 curated media assets (43 videos, 52 photos) in `public/media/`, two founders (`founders.ts`, portraits in `public/founders/`), nine client feedback entries with logos (`feedback.ts`, `public/clients/`) |
| SEO | metadataBase = `siteUrl` (`src/lib/site-url.ts`: `NEXT_PUBLIC_SITE_URL`, else the Vercel production domain, else `site.url` = `https://www.socialxbrandpilot.com`), canonicals, sitemap, robots, JSON-LD (organisation, services, breadcrumbs, the founders as Person). Share image: `src/app/opengraph-image.jpg`. |
| Tests | `npm test -- --workers=1` against a production build (`PORT=3102`) → **85 passed, 0 failed, 62 skipped by design** (2026-10-17). Run-once tests skip on the other two projects. Smoke and overflow at three viewports, axe, reduced motion, the contact flow, the content audit, and one regression guard per fixed audit item (`tests/regressions.spec.ts`, grouped by brief). |
| Checks | `npx tsc --noEmit`, `npx eslint src tests scripts` and `npm run build` are clean (2026-10-17). `check-flow` and `check-shift` pass on every route. |
| Launcher | `startup.bat` (Windows) |
| Layout | **Client-first, 2026-10-16** (`docs/reviews/client-first-refactor-2026-10-16.md`): Home is hero → selected work → four service groups → four steps → client feedback → contact; plain labels (Work, Services, How we work, About, Contact us); every service page in one pattern; Contact puts WhatsApp, call and email first, with an optional brief. |
| Performance | Latest: `docs/reviews/pilot6-audit-2026-10-17.md` (hero → work boundary: one cold video start at a time; capsules stop changing clip when partly scrolled away). Earlier passes: `performance-fixes-2026-10-15.md`, `post-phase-audit-2026-10-15.md`, `deep-audit-2026-10-17.md`. This laptop's background load swings totals up to 2×: compare builds **interleaved**, and compare trace work, not fps. Real phones and laptop GPUs have not been measured. |
| Docs | `README.md` (setup, architecture, QA), this file (current state), `docs/reviews/` (one dated report per brief), `docs/briefs/` (the current brief; finished ones in `archive/`), `docs/design-brief.md`, `docs/motion-system.md`, `docs/content-map.md` |

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
node scripts/qa/shoot.mjs --url=/ --vp=1440x900 --at="0,25%,#services-title+200" --wait=1400 --repeat
node scripts/qa/debug.mjs --url=/ --scroll=4000                # page errors + probes
node scripts/qa/perf.mjs --url=/ --cpu=4 --scroll=7000         # load metrics + scroll fps/jank (prod build only)
node scripts/qa/media-audit.mjs [--vp=390x844 --touch] [--detail]   # <video> elements mounted/playing, video requests and bytes per route (prod build only)
```

- `shoot.mjs` positions accept px, `vh`, `%` or `#id+offset` (negative offsets as `#id+-200`). `--repeat` skips the intro curtain, and `--reduce` emulates reduced motion.
- Screen recordings were made with Playwright `recordVideo` while wheel-scrolling, then converted with ffmpeg.

**Cloud-session notes:**
- Run `npx next typegen` before `tsc` on a fresh checkout.
- Set `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome` for `npm test` and all `scripts/qa/*` (the preinstalled Chromium differs from this Playwright version). Never run `playwright install`.
- `*.framer.website`, `openai.com` and `web.archive.org` are blocked by the environment's network policy.

### Media pipeline (only to re-curate)

The raw originals (`media-source/`, 1.5 GB) are gitignored and not in the repo; the processed `public/media/` is committed.
1. Run `scripts/media/inventory.mjs` then `contact-sheet.mjs`, with `SXBP_DRIVE_ROOT` set. The Drive lists they write (`inventory.json`, `contact-keys.json`, `download-plan.json`) stay in the git-ignored `media-source/`, never in the repository.
2. Run `mosaic.mjs` and curate `selection.json`.
3. Run `download.mjs --probe`, then `download.mjs`.
4. Run `transcode.mjs` (needs ffmpeg with libsvtav1 + libx264).

The Drive root folder id is passed as `SXBP_DRIVE_ROOT` (it is not kept in the repository). Every video there is named "Vishay Creations.mov", so the Drive id is the only key.

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
1. **Hero** (`Opening.tsx`): the brand line "Every business has something worth showing." with two media capsules
   (`HeroPill`) that play the client's reels and roll to the next clip, the window-light glare (`fx/HeroGlare`),
   a plain-language line (`heroLede`) and two CTAs: See our work, Explore services.
2. **Selected work** (`sections/SelectedWork`): four featured collections; card clips play through the budget.
3. **Services** (`sections/ServiceGroups`): the 18 services in four groups.
4. **How we work** (`sections/ProcessSteps`): four steps.
5. **Client feedback** (`sections/ClientFeedback` + `FeedbackCarousel`): one card per published entry, moving on by
   itself with a Pause button; still under reduced motion.
6. **Closing call to action** (`sections/ClosingCta`).

### Wayfinding
`Crumbs` on every inner page, `WhereNext` at every inner page end, and the footer row (Home, Work, Services, How we
work, About, Contact us, Back to top). The nav bar hides "Home" between 768 and 1023px (the logo is the way home).

---

## 5. Changes history (newest first, condensed)

000. **2026-10-15 to 10-17: five briefs** (each in `docs/briefs/`, each with a report in `docs/reviews/`):
   - **Pilot6 full audit** (`pilot6-audit-2026-10-17.md`): Drive ids out of the repository and the pages; one cold video start at a time; hero capsules stop changing clip when partly scrolled away; footer "Visit" link removed; README and this file brought up to date; finished briefs archived.
   - **Founders, client feedback, cleanup** (owner requests, 2026-10-17): `/about`; feedback cards with client logos, moving on by themselves with a Pause; repository tidied (briefs to `docs/briefs/`, client originals to `docs/source/`, unused media intermediates and the unused `simple-icons` dependency removed).
   - **Deep audit** (`deep-audit-2026-10-17.md`): capsule posters windowed, "Work collection" labels and format filters, plain 404, "Typical deliverables", menu focus loop.
   - **Client-first refactor** (`client-first-refactor-2026-10-16.md`): the home page rebuilt around what a client needs; the scroll scenes, boards and tickers were removed (in git history).
   - **Performance passes** (`performance-fixes-2026-10-15.md`, `post-phase-audit-2026-10-15.md`): the shared video budget everywhere, Home → Work without the exit transition, hero cost cuts.

00. **Audit-plan implementation (2026-10-09, local session).** Source: `docs/briefs/archive/SocialxBrand_Complete_Audit_and_Claude_Code_Plan.md`; every item, with status and evidence, is in `docs/reviews/audit-implementation-2026-10-09.md`. In short:
   - **Fixed a real download bug:** calling `video.load()` on a `preload="none"` video fetches the whole file in Chromium; the earlier AV1 switch called it on mount, so hardware-AV1 machines downloaded every reel on a page at once. `Reel` now picks its clip through the `src` attribute (see §6).
   - Media: the hero takeover reel (2.5MB) is started by the pinned scene, not at load; the capabilities stage and cursor preview mount at most two reels (were 18); small thumbnails and phone layouts use the 360p clip (`Reel variant="preview"`); Nav menu previews are poster-only (`still`).
   - Runtime: no tween/delayedCall per scroll update (WorkShowcase, Marquee); PointerFx on one rAF per frame; touch ignored by pointer effects; DivisionTicker listeners cleaned up with an AbortController; one-shot reveals via `observeOnce`; RouteBuilder scrolls through Lenis when it runs; below-the-fold sections set up when about a screen away (`useGSAPNear`).
   - Cost: WorkShowcase card backdrop uses the 16×28 placeholder (raster −27%); `.grid-paper` is its own layer (raster on `/approach` −53%); phones get a lighter hero glare (draw −30%); global CSS transitions narrowed; route transitions 670ms → 440ms.
   - Bundle: Flip and DrawSVG left the shared bundle; `pad()` moved out of `content/divisions.ts` so Work and Approach stop shipping the division content (shared JS 244 → 234KB gz).
   - Client-facing: hero lede + CTAs, Services / Selected work labels, direct contact row on phones, honest enquiry copy, adapters tested. Needs-owner-input items are listed in the report and in §7.
   - Earlier the same day: menu overlap fix, hydration warning (browser extension) suppressed, share thumbnail + deployment-aware site URL, India/IST clock removed, hero headline larger on phones, touch video playback on the work panel.

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
  `check-shift.mjs` (CLS and height stability), and `check-flow.mjs` (a way home from every page end).

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
14. **Videos:** never set `preload="auto"` on visibility, and **never call `video.load()` on a `preload="none"` reel** (Chromium fetches the whole file, measured; `Reel` switches clips by `src`). `play()` from the budget starts the download, so reels that stay on their poster cost nothing.
15. **Next 16:** `params` is a Promise (`PageProps<"/x/[slug]">`). `next lint` no longer exists.
16. **Windows:** PowerShell `Set-Content` re-encodes UTF-8, so use the Edit tool. With PowerShell 5.1 quoting, prefer `git commit -F file`.
17. **Batch files:** call any `.cmd` (npm, a node shim) with `call`, or the script ends silently. Wine's `where` and `findstr /r /x` don't behave like Windows', so the launcher avoids them.
18. **Manual reels are started by their owner** (the hero takeover from the pinned scene's `onUpdate`; the stage via its handle), never by an IntersectionObserver on a hidden box: it counts as visible and loads at page load.
19. **`useGSAPNear` is only for non-pinned sections that do not change layout when set up.** The Method board's text scramble caused layout shift when set up on arrival and is eager again.
20. **Measure work, not fps.** Frame rate varies ±10 fps on the dev laptop; use the trace-event compositor draw/raster time for an identical scripted scroll (method in `docs/motion-system.md`). Headless Chromium uses a software renderer: real GPU cost is not measured.
21. **Git Bash:** `MSYS_NO_PATHCONV=1` stops `/work`-style arguments becoming Windows paths, but also stops `/tmp/...` arguments being translated for node; set it only for the commands that need it.
22. **`useGSAP` with `dependencies` only reverts on unmount** unless `revertOnUpdate: true`. In a component that never unmounts (Nav), the callback's cleanup then never runs and triggers pile up, one per change.
23. **Every `<video>` goes through `video-budget`** (`requestPlay`/`release`, or `useBudgetedVideo` for a raw `<video>`). No `autoPlay`, and no hover wake on `pointerenter` (it fires when content scrolls under a resting cursor): wake on a real `pointermove` that is not touch.
24. **`RouteExit` must stay the first child in `PageShell`.** It hides the outgoing page before that page's GSAP contexts revert; without it, leaving home forced a full-page layout per ScrollTrigger kill.
25. **Don't scrub the opacity of a large painted layer without its own compositor layer** (`will-change: opacity`): the hero's textured dim field was re-rasterised on every scroll frame.
26. **Animations started later (observer / scroll callbacks) must be owned**: record them with the matchMedia handler's `context.add(() => …)` (as `SplitReveal` does) or keep handles and kill them in cleanup. In development `window.__gsap` exposes `{ gsap, ScrollTrigger }` for tests.
27. **Don't narrow the hero timeline's `invalidateOnRefresh` to the card tweens**: tried, and the card lands wrong after a resize and after a reload mid-scene.
29. **Portrait "preview" clips are 202px wide** (360p means the short side). They suit thumbnails and phone cards only: on a 1440px laptop the work cards (314px) looked visibly soft with them, so cards use the 720p clip from md up.
30. **The budget starts one cold video at a time** (no decoded frame yet); the next starts on the previous one's `canplay`. A test that logs starts must judge "in flight" by element state, not event order: the budget starts the next video from inside the previous one's `canplay` handler.
28. **Compare performance only interleaved.** Background load on this laptop turned a 50 fps Home scroll into an "18 fps" reading once; a single before/after pair is not evidence.

---

## 7. Next steps (in order)

1. **Owner input** (nothing was invented; full list in `docs/reviews/pilot6-audit-2026-10-17.md`): each client's confirmation of their feedback line; each founder's approval of their bio and portrait; real service scopes, inclusions and exclusions; official social profile URLs; accurate alt text for the 52 work photographs; per-collection attribution (SxBP's role and the production partner's).
2. **Drive access:** the portfolio folder is shared by link, and its ids are in old commits of this public repository. Decide whether the folder should stay link-shared; if not, restrict it in Drive (that also makes the old ids useless). Rewriting git history is possible but needs a force-push.
3. **Cross-browser:** Home → Work, the menu and the capsules have been tested in Chromium only. Run the Playwright suite with Firefox and WebKit installed (`npx playwright install firefox webkit`, a few hundred MB) and check Safari on a real iPhone.
4. **Real devices:** profile the hero → work boundary on an ordinary laptop and a mid-range phone (headless Chromium here uses a software renderer and has no AV1 hardware decode).
5. **A mid-resolution video tier** (~480p) would let the work cards use lighter clips without softness: needs ffmpeg (libsvtav1 + libx264) and the raw originals (not in the repository).

---

## 8. File map

```
startup.bat              Windows launcher (+ scripts/tooling/{deps-fresh,free-port,open-when-ready}.mjs)
src/app/                 layout.tsx, page.tsx (home), work/, capabilities/, approach/, about/, route/, not-found.tsx,
                         sitemap.ts, robots.ts, opengraph-image.jpg, globals.css
src/content/             divisions.ts, service-groups.ts, site.ts, work.ts, founders.ts, feedback.ts, media.generated.json
src/lib/                 gsap.ts (+ gsap-flip.ts), motion/{tokens,observe,defer}.ts, route/{store,suggest,enquiry}.ts,
                         seo.ts, site-url.ts, category-line.ts, pad.ts, use-min-width.ts
src/components/          home/{Opening,HeroPill,AiAmplifies}, sections/{SelectedWork,CardReel,ServiceGroups,ProcessSteps,
                         ClientFeedback,FeedbackCarousel,ClosingCta}, work/{WorkIndex,ScreeningMedia}, route/RouteBuilder,
                         media/{Reel,Photo,video-budget,codec}, motion/{SplitReveal,Reveal,SmoothScroll}, fx/{HeroGlare,PointerFx},
                         layout/{Nav,NavProgress,NoExitTransition,RouteExit,DevWarmup,Footer,FooterWordmark,PageShell,PageHeader,
                         WhereNext,Crumbs}, capabilities/PlanRouteLink, brand/{Mark,mark-paths}, seo/JsonLd
tests/                   site.spec.ts, regressions.spec.ts (one guard per fixed audit item), content-audit.spec.ts
scripts/qa/              shoot, debug, perf, media-audit, check-flow, check-shift, sweep, record
scripts/media/           inventory, contact-sheet, mosaic, selection.json, download, transcode, feedback-logos, founders
scripts/readme/          capture.mjs (README images)
scripts/tooling/         agents.mjs (regenerates reviewer agents), review-workflow.js
docs/                    briefs/ (+ archive/), reviews/, source/ (PDFs, client logos and photos), assets/readme/,
                         design-brief, motion-system, design-research, site-architecture, content-map, plan (original, kept as record)
.claude/agents + .opencode/agents   5 reviewers     .opencode/skills   6 project skills     .claude/skills   optional specialists
```
