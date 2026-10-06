// Visual QA: captures frames of a route at a viewport while scrolling, so motion-critical
// states (pins, scrubs, reveals) can be inspected as stills.
// usage: node scripts/qa/shoot.mjs --url=/ --vp=1440x900 --at=0,900,1800 [--reduce] [--wait=900] [--name=home]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
const base = arg("base", "http://localhost:3100");
const url = arg("url", "/");
const [w, h] = arg("vp", "1440x900").split("x").map(Number);
const at = arg("at", "0").split(",").map((s) => s.trim());
const wait = Number(arg("wait", "900"));
const name = arg("name", url.replace(/\W+/g, "_") || "home");
const reduce = process.argv.includes("--reduce");
const fresh = !process.argv.includes("--repeat");

await mkdir("qa-shots", { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reduce ? "reduce" : "no-preference" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
if (!fresh) await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
await page.goto(base + url, { waitUntil: "networkidle" });
await page.waitForTimeout(2600);

for (const pos of at) {
  // positions: absolute px, "<n>vh", "<n>%" of the page, or "#id" / "#id+<px>" (element top)
  const y = await page.evaluate(({ pos, h }) => {
    if (pos.startsWith("#")) {
      const [id, off] = pos.split("+");
      const el = document.querySelector(id);
      return el ? el.getBoundingClientRect().top + window.scrollY + Number(off ?? 0) : 0;
    }
    if (pos.endsWith("%")) return Math.round((parseFloat(pos) / 100) * (document.documentElement.scrollHeight - h));
    if (pos.endsWith("vh")) return Math.round((parseFloat(pos) / 100) * h);
    return Number(pos);
  }, { pos, h });
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(wait);
  const file = `qa-shots/${name}-${w}x${h}${reduce ? "-reduce" : ""}-${pos}.png`;
  await page.screenshot({ path: file });
  console.log(file);
}
const metrics = await page.evaluate(() => ({ scrollHeight: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > window.innerWidth }));
console.log(JSON.stringify({ ...metrics, errors }));
await browser.close();
