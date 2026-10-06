// Performance probe: load metrics plus scroll smoothness under CPU throttling.
// usage: node scripts/qa/perf.mjs [--url=/] [--base=http://localhost:3100] [--cpu=4] [--vp=1440x900] [--scroll=6000]
// Run against a production build (`npm run build && npm run start -- --port 3100`), never `next dev`.
import { chromium } from "playwright";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
const base = arg("base", "http://localhost:3100");
const url = arg("url", "/");
const cpu = Number(arg("cpu", "4"));
const [w, h] = arg("vp", "1440x900").split("x").map(Number);
const scrollPx = Number(arg("scroll", "6000"));

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: w, height: h } });
await ctx.addInitScript(() => {
  sessionStorage.setItem("sxbp.intro", "1"); // measure the repeat-visit path, not the one-off curtain
  window.__perf = { lcp: 0, cls: 0, longTasks: [] };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__perf.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__perf.longTasks.push({ t: e.startTime, d: e.duration }); }).observe({ type: "longtask", buffered: true });
});
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });

await page.goto(base + url, { waitUntil: "load" });
await page.waitForTimeout(4000);
const load = await page.evaluate(() => {
  const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
  const tbt = window.__perf.longTasks.filter((l) => l.t < 6000).reduce((s, l) => s + Math.max(0, l.d - 50), 0);
  // bytes over the wire per type (resource timing; compressed size, like Lighthouse reports)
  const kb = { js: 0, css: 0, font: 0, img: 0, media: 0 };
  for (const r of performance.getEntriesByType("resource")) {
    const ext = r.name.split("?")[0].split(".").pop();
    const k = ext === "js" ? "js" : ext === "css" ? "css" : ["woff2", "woff", "ttf"].includes(ext) ? "font"
      : ["avif", "webp", "jpg", "jpeg", "png", "svg"].includes(ext) ? "img" : ["mp4", "webm"].includes(ext) ? "media" : null;
    if (k) kb[k] += r.transferSize || r.encodedBodySize || 0;
  }
  for (const k in kb) kb[k] = Math.round(kb[k] / 1024);
  return { fcp: Math.round(fcp), lcp: Math.round(window.__perf.lcp), cls: +window.__perf.cls.toFixed(3), tbt: Math.round(tbt), kb };
});

// Scroll the way a visitor does (wheel steps), sampling every animation frame meanwhile.
const before = await page.evaluate(() => window.__perf.longTasks.length);
await page.evaluate(() => {
  window.__frames = [];
  const tick = (t) => { window.__frames.push(t); if (window.__sampling) requestAnimationFrame(tick); };
  window.__sampling = true;
  requestAnimationFrame(tick);
});
await page.mouse.move(w / 2, h / 2);
for (let y = 0; y < scrollPx; y += 100) { await page.mouse.wheel(0, 100); await page.waitForTimeout(16); }
await page.waitForTimeout(1200);
const scroll = await page.evaluate((before) => {
  window.__sampling = false;
  const f = window.__frames;
  const gaps = f.slice(1).map((t, i) => t - f[i]);
  const dur = (f.at(-1) - f[0]) / 1000;
  const lt = window.__perf.longTasks.slice(before);
  return {
    fps: +(gaps.length / dur).toFixed(1),
    jank: +(100 * gaps.filter((g) => g > 50).length / gaps.length).toFixed(1), // % frames slower than 50 ms
    worstFrame: Math.round(Math.max(...gaps)),
    longTasks: lt.length,
    longestTask: Math.round(Math.max(0, ...lt.map((l) => l.d))),
  };
}, before);

console.log(JSON.stringify({ url, cpu: `${cpu}x`, load, scroll }));
await browser.close();
