---
name: visual-qa
description: How to visually inspect the SOCIALxBRAND PILOT site with the project's Playwright scripts across the six required viewports and reduced motion, and what defects to look for. Use after any UI or motion change.
---

# Visual QA

## Tools

- `npm run dev`. The dev server runs on :3100 (configured in `.claude/launch.json`; auto-ports if taken).
- **Frames**: `node scripts/qa/shoot.mjs --url=/ --vp=1440x900 --at="0,40vh,25%,#ladder-title+-200" --wait=1400 [--reduce] [--repeat] [--name=x]`.
  - Positions accept px, `vh`, `%` of the page, or `#id+offset`.
  - `--repeat` skips the first-visit intro curtain.
  - Output goes to `qa-shots/` (gitignored), plus a JSON line with `scrollHeight`, `overflowX` and page errors.
- **Probes**: `node scripts/qa/debug.mjs --url=/ --scroll=4000 --probe="<js expression>"` prints page errors with stacks.
- The Playwright MCP (globally configured in OpenCode and in `.mcp.json`) can also drive the browser interactively.

## Viewports (all required)

1440×900 · 1280×720 · 1024×768 · 768×1024 · 390×844 · 360×800, plus `--reduce` at 1440×900 and 390×844.

## Defect checklist

- [ ] `overflowX: false` and `errors: []` on every route.
- [ ] No text collides with media or other text. Watch the hero headline against the fan, and toggles in index rows.
- [ ] No clipped descenders under split-line masks. No orphaned single words in display headings.
- [ ] 9:16 work stays 9:16 (or a deliberate 4:5 crop). Posters are never black.
- [ ] Small red text on paper uses `signal-ink`. Muted text on ink uses `fog` or brighter.
- [ ] Consistent gutters (`.gutter`). Bracketed labels are aligned with the headline's left edge.
- [ ] Reduced motion shows complete content: no hidden blocks, no pins, the full ladder list, and a static strike or red "impact".
- [ ] Mobile has no pins, swipe rails snap, and tap targets are ≥ 44px.
