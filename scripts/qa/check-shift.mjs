// Layout-stability check: on each route and viewport, records the browser's own
// layout-shift entries (CLS) and any change in page height, first while the page sits idle at
// several scroll positions (catches auto-cycling UI that resizes) and then during a scroll.
// Anything that moves the page under a reader shows up here.
import { chromium } from "playwright";
const base = process.env.QA_BASE ?? "http://localhost:3100";
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const routes = arg("routes", "/,/work,/work/creator-content,/capabilities,/capabilities/social-media-marketing,/approach,/route").split(",");
const vps = arg("vps", "1440x900,768x1024,390x844").split(",").map((v) => v.split("x").map(Number));
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
let bad = 0;
for (const [w, h] of vps) {
  for (const r of routes) {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.addInitScript(() => {
      window.__shifts = [];
      new PerformanceObserver((l) => l.getEntries().forEach((e) => {
        if (e.hadRecentInput) return;
        const src = e.sources?.map((s) => s.node && (s.node.id || s.node.className?.toString?.().slice(0, 60) || s.node.nodeName)).filter(Boolean) ?? [];
        window.__shifts.push({ v: +e.value.toFixed(4), at: Math.round(scrollY), src });
      })).observe({ type: "layout-shift", buffered: true });
    });
    await p.goto(base + r, { waitUntil: "networkidle" });
    await p.waitForTimeout(2500);
    await p.evaluate(() => { window.__shifts = []; }); // ignore the load itself
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    const heights = new Set();
    for (const f of [0.2, 0.4, 0.6, 0.8]) {
      await p.evaluate((y) => window.scrollTo(0, y), Math.round(total * f));
      for (let k = 0; k < 3; k++) { await p.waitForTimeout(2200); heights.add(await p.evaluate(() => document.documentElement.scrollHeight)); }
    }
    const shifts = await p.evaluate(() => window.__shifts);
    const cls = shifts.reduce((a, s) => a + s.v, 0);
    const unstable = heights.size > 1;
    const flag = cls > 0.02 || unstable;
    if (flag) bad++;
    console.log(`${w}x${h}`.padEnd(10), r.padEnd(38), `cls=${cls.toFixed(4)}`, unstable ? `height varied: ${[...heights].join(",")}` : "height stable", flag ? "  <--" : "");
    if (flag) for (const s of shifts.slice(0, 6)) console.log("      ", JSON.stringify(s));
    await p.close();
  }
}
await browser.close();
if (bad) { console.error(`${bad} unstable page(s)`); process.exit(1); }
console.log("layout stable everywhere");
