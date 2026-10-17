// Media + runtime audit per route: how many <video> elements are mounted, how many play at
// once, which video/media requests fire (and their bytes), plus console errors and failed requests.
// Walks the page the way a visitor does (wheel steps) and samples the DOM as it goes.
// Run against a PRODUCTION server (`npm run build && npm run start -- --port 3101`), never `next dev`.
// usage: node scripts/qa/media-audit.mjs [--base=http://localhost:3101] [--vp=1440x900] [--touch] [--reduce]
//        [--routes=/,/work,/capabilities] [--json]
import { chromium } from "playwright";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
const base = arg("base", "http://localhost:3101");
const [w, h] = arg("vp", "1440x900").split("x").map(Number);
const touch = process.argv.includes("--touch");
const reduce = process.argv.includes("--reduce");
const asJson = process.argv.includes("--json");
const detail = process.argv.includes("--detail");
const routes = arg("routes", "/,/work,/work/restaurant-hospitality,/capabilities,/capabilities/performance-marketing,/approach,/about,/route").split(",");

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const results = [];
for (const route of routes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: touch ? 2 : 1, hasTouch: touch, isMobile: touch, reducedMotion: reduce ? "reduce" : "no-preference" });
  await ctx.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  const page = await ctx.newPage();
  const errors = [], failed = [], media = new Map();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 140)); });
  page.on("requestfailed", (r) => failed.push(r.url().replace(base, "") + " (" + (r.failure()?.errorText ?? "?") + ")"));
  page.on("requestfinished", async (r) => {
    const url = r.url().replace(base, "");
    if (!/\.(mp4|webm)(\?|$)/.test(url)) return;
    const size = await r.sizes().then((s) => s.responseBodySize + s.responseHeadersSize).catch(() => 0);
    media.set(url, (media.get(url) ?? 0) + size);
  });
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const sample = () => page.evaluate(() => {
    const vs = [...document.querySelectorAll("video")];
    return { mounted: vs.length, playing: vs.filter((v) => !v.paused && !v.ended && v.readyState > 1).length, withSrc: vs.filter((v) => v.currentSrc || v.querySelector("source")).length };
  });
  const atLoad = await sample();
  let maxPlaying = atLoad.playing, maxMounted = atLoad.mounted;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.mouse.move(w / 2, h / 2);
  for (let y = 0; y < total; y += 400) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(120);
    if ((y / 400) % 4 === 0) { const s = await sample(); maxPlaying = Math.max(maxPlaying, s.playing); maxMounted = Math.max(maxMounted, s.mounted); }
  }
  await page.waitForTimeout(800);
  const end = await sample();
  const info = await page.evaluate(() => ({ pinSpacers: document.querySelectorAll(".pin-spacer").length, overflow: document.documentElement.scrollWidth - innerWidth }));
  const bytes = [...media.values()].reduce((a, b) => a + b, 0);
  results.push({ route, videoElementsAtLoad: atLoad.mounted, playingAtLoad: atLoad.playing, maxMounted, maxPlayingAtOnce: maxPlaying, mediaRequests: media.size, mediaKB: Math.round(bytes / 1024), pinSpacers: info.pinSpacers, overflowPx: info.overflow, errors: errors.length, failedRequests: failed.length, endMounted: end.mounted });
  if (detail) console.error(route, "media requests:", [...media].map(([u, b]) => u.split("/").pop() + " " + Math.round(b / 1024) + "KB").join(", "));
  if (errors.length || failed.length) console.error(route, { errors: errors.slice(0, 3), failed: failed.slice(0, 3) });
  await ctx.close();
}
await browser.close();
if (asJson) console.log(JSON.stringify(results));
else console.table(results);
