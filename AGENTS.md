<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SOCIALxBRAND PILOT website: project rules

The motion-led site for SOCIALxBRAND PILOT, an Indian digital marketing agency. **The motion IS the website.**

## Non-negotiables

1. **No invented content.** Never add clients, results, metrics, ROI, testimonials, awards, follower counts, years in business, a team, certifications, partnerships, prices or a city. The location is "India · IST". Every claim must trace to `src/content/*` (transcribed from the client PDFs; see `docs/content-map.md`).
2. **Real work only.** Media comes from the client's Drive via `scripts/media/*`. Work copy describes what is visible. Keep the "Production partner: Vishay Creations" credit.
3. **One motion grammar.** Use `src/lib/motion/tokens.ts` and `@/lib/gsap`. Read the `motion-design` skill before touching any animation.
4. **Reduced motion and no-JS must be complete.** Never hide content without a failsafe.
5. **Vertical work stays vertical.** Never letterbox 9:16 reels.

## Commands

| Task | Command |
|---|---|
| Dev | `npm run dev` (port 3100 via `.claude/launch.json`) |
| Build | `npm run build` |
| Types / lint | `npx tsc --noEmit` · `npx eslint src` |
| Visual QA | `node scripts/qa/shoot.mjs --url=/ --vp=1440x900 --at="0,25%,50%"` |
| Media pipeline | `node scripts/media/inventory.mjs` → `contact-sheet.mjs`/`mosaic.mjs` (curate into `selection.json`) → `download.mjs` (`--probe` first) → `transcode.mjs` |
| Regenerate reviewer agents | `node scripts/tooling/agents.mjs` |

## Map

- `src/content/`: divisions (18), site (profile), work (screenings), `media.generated.json`
- `src/lib/`: gsap registration, motion tokens, route store, suggestions and enquiry adapters, SEO helpers
- `src/components/`: `motion/` (SplitReveal, Reveal, SmoothScroll), `media/` (Reel, Photo, VideoBudget), `home/` (acts), `capabilities/`, `work/`, `route/`, `layout/`
- `docs/`: research, brief, architecture, content map, motion system

## Agent tooling

- **Project skills** (`.opencode/skills/`): brand-storytelling, agency-copy, conversion-review, motion-design, visual-qa, accessibility-performance.
- **Reviewer agents** (`.opencode/agents/` and `.claude/agents/`, generated): creative-director, motion-director (mandatory after motion changes), conversion-critic, frontend-reviewer, visual-qa.
- **Third-party skills** (`.claude/skills/`) are optional specialists. Use one only when it materially helps, and never let its fixed palettes or rules override this project's direction.
