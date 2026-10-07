// Records a real scroll-through of each route (video) and captures every console error /
// warning, failed request and page error on the way. Videos land in qa-shots/rec/.
//   node scripts/qa/record.mjs [--routes=/,/work] [--vp=1440x900]
import { chromium } from "playwright";
import { mkdir, rename } from "node:fs/promises";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const base = process.env.QA_BASE ?? "http://localhost:3100";
const routes = arg("routes", "/,/work,/work/creator-content,/capabilities,/capabilities/social-media-marketing,/approach,/route").split(",");
const [w, h] = arg("vp", "1440x900").split("x").map(Number);
await mkdir("qa-shots/rec", { recursive: true });

const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const report = {};
for (const r of routes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, recordVideo: { dir: "qa-shots/rec/tmp", size: { width: 960, height: 600 } } });
  const page = await ctx.newPage();
  const log = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") log.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
  page.on("pageerror", (e) => log.push(`pageerror: ${e.message.slice(0, 300)}`));
  page.on("requestfailed", (q) => { const u = q.url(); if (!u.includes("_next/webpack-hmr")) log.push(`requestfailed: ${u.replace(base, "")} ${q.failure()?.errorText}`); });
  page.on("response", (s) => { if (s.status() >= 400) log.push(`http ${s.status()}: ${s.url().replace(base, "")}`); });
  await page.goto(base + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  // a human-paced scroll: small wheel steps, with pauses
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 240) { await page.mouse.wheel(0, 240); await page.waitForTimeout(110); }
  await page.waitForTimeout(1500);
  // and back up a little, to exercise reversed scrubs
  for (let k = 0; k < 10; k++) { await page.mouse.wheel(0, -400); await page.waitForTimeout(90); }
  await page.waitForTimeout(800);
  const video = page.video();
  await ctx.close();
  const name = `qa-shots/rec/${r === "/" ? "home" : r.slice(1).replace(/\//g, "_")}-${w}.webm`;
  await rename(await video.path(), name);
  report[r] = { video: name, issues: [...new Set(log)] };
  console.log(r.padEnd(40), log.length ? `${new Set(log).size} issue(s)` : "clean");
  for (const l of new Set(log)) console.log("   ", l);
}
await browser.close();
