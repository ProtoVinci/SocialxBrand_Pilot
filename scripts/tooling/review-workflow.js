export const meta = {
  name: 'sxbp-review-round-1',
  description: 'Run the 5 SxBP reviewer agents (creative, motion, conversion, frontend, visual-qa) read-only against the running site',
  phases: [{ title: 'Review', detail: '5 reviewer personas in parallel, read-only' }],
}

const M = 'claude-opus-5-5'
const REVIEWERS = ['creative-director', 'motion-director', 'conversion-critic', 'frontend-reviewer', 'visual-qa']

const SCHEMA = {
  type: 'object',
  properties: {
    reviewer: { type: 'string' },
    verdict: { type: 'string', description: '2-3 sentence overall judgement' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'major', 'minor'] },
          where: { type: 'string', description: 'route + section, or file:line' },
          problem: { type: 'string' },
          why: { type: 'string' },
          fix: { type: 'string', description: 'concrete fix with values' },
        },
        required: ['severity', 'where', 'problem', 'fix'],
      },
    },
    top3: { type: 'array', items: { type: 'string' } },
  },
  required: ['reviewer', 'verdict', 'findings', 'top3'],
}

phase('Review')
const results = await parallel(REVIEWERS.map((r) => () => agent(
  `You are the "${r}" reviewer for the SOCIALxBRAND PILOT website. The repo root is the directory containing HANDOVER.md (locally C:\\Users\\Parth\\Desktop\\sujal_2\\SocialxBrand_Pilot on Windows: use the PowerShell tool and cd there first; in a cloud checkout use the repo root).
FIRST read your full persona and instructions in .claude/agents/${r}.md and follow them exactly. Also skim HANDOVER.md §4–§5 for the decided direction and known gotchas (do not re-litigate decided direction; critique execution).
HARD RULES: READ-ONLY. Do not edit, create or delete project files (screenshots go to the gitignored qa-shots/ folder via the scripts, which is fine). Do not run npm install, git, or kill processes.
The dev server is ALREADY running at http://localhost:3100 — do not start another. Capture frames with: node scripts/qa/shoot.mjs --url=<route> --vp=<WxH> --at="<positions>" --wait=1400 --repeat --name=${r}-<label>   (positions: px, Nvh, N% of page, or #id+offset; add --reduce for reduced motion). Then look at the PNGs with the Read tool. Probe DOM with node scripts/qa/debug.mjs --url=<route> --scroll=<px> --probe="<js>".
Routes: /, /work, /work/restaurant-hospitality, /capabilities, /capabilities/performance-marketing, /approach, /route. Be efficient: prioritise what your persona cares about most; ~15–25 screenshots max.
Return only verified findings (you saw it in a frame or in code), ranked most-severe first, with concrete fixes.`,
  { label: `review:${r}`, phase: 'Review', schema: SCHEMA, model: M },
)))

return results.filter(Boolean)