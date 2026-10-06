// Full visual sweep: every route × every required viewport × a few scroll positions,
// composed into one contact sheet per route (qa-shots/sweep-<route>.jpg) plus a JSON report
// of overflow and page errors. usage: node scripts/qa/sweep.mjs [--routes=/,/work] [--reduce]
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
const base = arg("base", "http://localhost:3100");
const reduce = process.argv.includes("--reduce");
const ROUTES = arg("routes", "/,/work,/work/restaurant-hospitality,/capabilities,/capabilities/performance-marketing,/approach,/route").split(",");
const VIEWPORTS = arg("vps", "1440x900,1280x720,1024x768,768x1024,390x844,360x800").split(",").map((v) => v.split("x").map(Number));
const POSITIONS = arg("at", "0,20%,40%,60%,80%,100%").split(",");
const TILE_W = 300;

await mkdir("qa-shots", { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const report = [];

for (const route of ROUTES) {
  const rows = [];
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? "reduce" : "no-preference", hasTouch: w < 768, isMobile: w < 768 });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(2200);
    const shots = [];
    for (const pos of POSITIONS) {
      const y = await page.evaluate((p) => {
        const max = document.documentElement.scrollHeight - innerHeight;
        return p.endsWith("%") ? Math.round((parseFloat(p) / 100) * max) : Number(p);
      }, pos);
      await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
      await page.waitForTimeout(900);
      shots.push(await sharp(await page.screenshot()).resize({ width: TILE_W }).toBuffer());
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    report.push({ route, viewport: `${w}x${h}`, overflow, errors });
    rows.push({ label: `${w}x${h}`, shots, tileH: Math.round((h * TILE_W) / w) });
    await ctx.close();
  }
  // compose: one row per viewport, label on the left
  const LABEL = 90, GAP = 8;
  const width = LABEL + POSITIONS.length * (TILE_W + GAP);
  const height = rows.reduce((s, r) => s + r.tileH + GAP, 0);
  const comps = [];
  let y = 0;
  for (const r of rows) {
    comps.push({ input: Buffer.from(`<svg width="${LABEL}" height="40"><text x="6" y="24" font-family="monospace" font-size="14" fill="#fff">${r.label}</text></svg>`), left: 0, top: y });
    r.shots.forEach((s, i) => comps.push({ input: s, left: LABEL + i * (TILE_W + GAP), top: y }));
    y += r.tileH + GAP;
  }
  const name = `qa-shots/sweep${reduce ? "-reduce" : ""}-${route.replace(/\W+/g, "_") || "home"}.jpg`;
  await sharp({ create: { width, height, channels: 3, background: "#222" } }).composite(comps).jpeg({ quality: 78 }).toFile(name);
  console.log(name);
}
await browser.close();
await writeFile(`qa-shots/sweep${reduce ? "-reduce" : ""}-report.json`, JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.overflow > 1 || r.errors.length);
console.log(bad.length ? `PROBLEMS:\n${JSON.stringify(bad, null, 2)}` : "all clean: no overflow, no page errors");
