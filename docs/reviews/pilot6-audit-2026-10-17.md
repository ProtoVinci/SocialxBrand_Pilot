# Pilot6 full audit: report, 2026-10-17

Source brief: `docs/briefs/SocialxBrand_Pilot6_Full_Audit_and_Fix_Plan.md`. Starting point: commit `4b36873`. Nothing is committed. No dependency was added.

## Owner decisions (2026-10-17)

- **Client feedback stays published.** The brief recommended hiding the nine quotes until each client confirms the exact wording. The owner chose to keep them live on the permission the clients already gave. `feedback.ts` now says so plainly (its header used to claim the quotes were the clients' exact words, which contradicted the entries).
- **Drive file lists leave the repository**, without rewriting git history.
- **All phases in one pass**, and the hero capsules' pace changes only if measurement shows it is a cause.

## Findings and what was done

| # | Finding | Status | Evidence / change |
|---|---|---|---|
| P0.20 | Drive "resource keys" in a public repo | **Partly confirmed, fixed** | The repository is public. The `key` fields are contact-sheet positions (e.g. "8-1"), not Drive resource keys; there are no key or token fields. But the files held the Drive **file ids**, names and folder paths of 500 portfolio files, and the folder is shared by link, so the ids open the files. Worse, two things the brief did not list: the **root folder id** was hard-coded in `scripts/media/inventory.mjs` and written in `HANDOVER.md`, and every page's HTML and RSC payload sent visitors a `driveId` for all 95 assets (unused by any code). Now: the three lists moved to the git-ignored `media-source/` (where the scripts read and write them); `driveId` removed from `media.generated.json` and from `transcode.mjs`; the root id is read from `SXBP_DRIVE_ROOT` (kept locally in `media-source/drive-root.env`). The ids remain in **old commits** and in the live site until it is redeployed. New tests: no Drive ids in `src/` or `scripts/`, none in the home page HTML. |
| P0.9 | Feedback marked approved before wording is confirmed | **Owner decision: keep** | Contradictory header fixed; each entry's `sourceRef` still records that the wording awaits the client's confirmation. |
| P0.1 / P1.4 | Hero → Selected Work hitch from overlapping video work | **Confirmed in part, improved** | See *Measurements*. Blocking all video during the boundary scroll removed most long tasks, so video is a real contributor. The capsules were already off screen before the cards started playing; the overlap was the **three work cards starting their downloads and decoders in the same frame**. The budget now starts **one cold video at a time** (`video-budget.ts`: the next starts when the previous can play, errors, stalls or is released; no timers). Capsules now **change clip only while at least 75% on screen**, and keep playing their current clip when partly scrolled away (`HeroPill.tsx`); a handover under way when that happens still finishes. |
| P0.2 | Playback cap is not a download cap | **Confirmed, policy kept** | Cards and work reels already use `preload="none"` and download only when granted a slot. The capsules' next clip keeps `preload="auto"`: measured at 1MB per 6 seconds at the top of the page, and it is what makes each handover start on a decoded frame. |
| P1.3 | Capsule cadence (1.4s / 1.7s) | **Measured: unchanged** | The capsules leave the screen before the cards start, and the cadence change was not needed once clip changes stop on scroll. |
| P1.4 (option) | Lighter clips for the cards | **Tried, rejected** | The 360p "preview" clip is only 202px wide for portrait reels; on a 1440px laptop (314px cards) it was visibly soft in a side-by-side frame comparison. Cards keep the 720p clip from md up. A ~480p tier needs ffmpeg and the raw originals (HANDOVER §7). |
| P1.5 | HeroGlare cost | **Not changed** | Not identified as a contributor at the boundary in these traces; earlier passes already pause its drift off screen. |
| P1.6 | Timings inconclusive | **Method followed** | Production builds, interleaved A/B, medians and ranges, separate byte counts. Real devices still not measured (HANDOVER §7). |
| P1.7 / P1.8 | DevWarmup; bundle splitting | **No change** | DevWarmup is development-only. No bundle split without evidence. |
| P1.10 / P1.17 | Feedback carousel behaviour | **Kept (owner asked for the loop)** | Already: Pause/Play, holds on hover and keyboard focus, off screen and in hidden tabs, no movement under reduced motion, labelled buttons. Covered by existing tests. |
| P1.11 / P1.12 / P1.14 | Collections, service decision path, founder facts | **Owner input** | Labels already say "Work collection" and "Typical deliverables". What a client must provide, approval and review rules, scopes and prices, and founder sign-off need the owner (list below). |
| P1.13 | Contact is a hand-off | **Unchanged (by design)** | The page says plainly that the site sends nothing. |
| P2.15 | Footer "Visit" link | **Fixed** | It opened this same site in a new tab; removed. Social profiles go there once supplied. |
| P2.16 | Hero message | **Already met** | Brand line, then `heroLede` in plain words, then See our work and Explore services. |
| P1.18 | Firefox / WebKit | **Not tested** | Not installed here; needs a download (HANDOVER §7). |
| P2.19 | Media fallback | **Verified, test added** | With every video request failing, the capsules and work cards keep their posters and the page throws no errors. |
| P1.21 | Repository weight | **Fixed where safe** | README images regenerated for the current site: 5.5MB → 1.6MB (the two animations were 2.7MB and 1.4MB; one 150KB hero animation now, built from frames with `sharp`, so no ffmpeg is needed). The out-of-date QA script `check-motion.mjs` (it tested the removed work panel and departures board) deleted. Earlier the same day: 46 unused media intermediates (6.8MB) and the unused `simple-icons` dependency removed. `.claude` and `.opencode` kept. |
| P2.22 | Which document is current | **Fixed** | Finished briefs moved to `docs/briefs/archive/`, each with a "Historical reference" line pointing at its report. `HANDOVER.md` (was last updated 2026-10-09) and `README.md` (described the pre-refactor home page) rewritten to the current site. `AGENTS.md` now names the owner-supplied exceptions to the content rule. |

## Measurements

Production builds, 4× CPU, 1440×900 unless noted. Baseline `:3101` = this tree before the media changes; candidate `:3102`. Runs alternate A/B.

**Hero → Selected Work boundary** (wheel scroll 0 → 1400px; long tasks, frames and trace work during the scroll):

| | Baseline | Candidate |
|---|---|---|
| Video bytes at the top, 6s idle | 1031KB (8 requests) | 1031KB (8) |
| Video bytes during the scroll | 5475KB (3 card clips) | 5475KB (3) |
| Videos playing at once (max) | 3 | 3 |
| Long tasks, median (13 pairs) | 1 (range 0–12) | 0 (range 0–19) |
| Frame gaps > 50ms, median | 9 (0–15) | 4 (0–21) |
| Script time, median | 1226ms | 1100ms |

The medians favour the candidate, but both builds had a few very bad runs from background load on this laptop, so this is **suggestive, not conclusive**. A control run with all video blocked (baseline build) gave 0–3 long tasks, against 3–4 with video, which is what identified video start-up as a contributor. Phone size (390×844, touch, 5 pairs): no long tasks in either build, no difference; the cards there already use the 360p clip, which the capsules have cached.

**Routes** (`scripts/qa/perf.mjs`, 3 interleaved pairs per route, medians):

| Route | LCP ms | TBT ms | Scroll fps | Long tasks while scrolling | Image / video KB at load |
|---|---|---|---|---|---|
| / | 1772 → 1532 | 456 → 471 | 53.2 → 51.8 | 0 → 0 | 453 / 927 → same |
| /work | 432 → 376 | 251 → 285 | 60 → 60 | 0 → 0 | 462 / 0 → same |
| /work/creator-content | 396 → 288 | 264 → 265 | 60 → 60 | 0 → 0 | 255 / 2506 → same |
| /capabilities/social-media-marketing | 492 → 344 | 250 → 264 | 60 → 60 | 0 → 0 | 228 / 0 → same |
| /about | 372 → 408 | 253 → 210 | 60 → 60 | 0 → 0 | 127 / 0 → same |
| /route | 412 → 396 | 259 → 259 | 59.8 → 60 | 0 → 0 | 81 / 0 → same |

No regression on any route. TBT ranges overlap on every route (for example Home 427–637 vs 458–526, a service page 210–905 vs 173–870), so the timing differences are noise; **no timing improvement is claimed**. Bytes at load are identical: the changes affect what starts when, not what loads.

## Checks

- `npx tsc --noEmit`, `npx eslint src tests scripts` and `npm run build` (44 static pages) are clean.
- **Playwright, production build, 1 worker:** **85 passed, 0 failed, 62 skipped by design.** New: capsules stop changing clip when partly scrolled away, one cold video start at a time (both fail on the baseline build and pass on the candidate), posters survive failed video loads, no Drive ids in the home page or in `src/` and `scripts/`.
- `check-flow`: a way on and a way home at the end of every route, `/about` included. `check-shift`: CLS 0.0000 and stable height on every route at 1440, 768 and 390.
- Firefox and WebKit: not installed, not tested.

## Files changed

- `src/components/media/video-budget.ts` (one cold start at a time)
- `src/components/home/HeroPill.tsx` (clip changes only while settled on screen; handover always finishes)
- `src/content/media.generated.json`, `scripts/media/transcode.mjs`, `scripts/media/inventory.mjs` (no Drive ids)
- `src/content/feedback.ts` (header matches the entries)
- `src/components/layout/Footer.tsx` (no "Visit" link)
- `scripts/qa/{check-flow,check-shift,sweep,record,media-audit}.mjs` (`/about` added), `scripts/qa/check-motion.mjs` (deleted)
- `scripts/readme/capture.mjs` (current sections; animated WebP via sharp), `docs/assets/readme/*`
- `tests/regressions.spec.ts`, `tests/content-audit.spec.ts`
- `README.md`, `HANDOVER.md`, `AGENTS.md`, `docs/briefs/` (archive), this report
- Removed from the repository: `docs/source/drive-inventory.json`, `drive-contact-keys.json`, `download-plan.json` (now in `media-source/`)

## Owner input needed (nothing below was invented)

1. **Feedback:** each client's OK of their own line (forward it to them); edit `feedback.ts` with any change.
2. **Founders:** each founder's OK of name spelling, title, bio, focus list and portrait.
3. **Drive:** whether the portfolio folder should stay shared by link. If not, restrict it in Drive; that also makes the ids in old commits useless. Rewriting git history is possible but needs a force-push.
4. **Services:** what a client needs to provide, how work is approved and reviewed, real scopes, inclusions, exclusions and any pricing approach.
5. **Work collections:** which are single client projects, SxBP's role versus Vishay Creations', and publication permission.
6. **Alt text** for the 52 work photographs; **official social profile URLs** for the footer.
7. **Browsers and devices:** permission to install Firefox and WebKit for Playwright here; a check on a real iPhone and a mid-range Android phone.
