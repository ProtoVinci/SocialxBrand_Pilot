// Spot-checks the home page's idle motion: the work panel loops keep moving with no input,
// the disc holds the viewport centre, the board starts scrambled and resolves when reached.
import { chromium } from "playwright";
const base = process.env.QA_BASE ?? "http://localhost:3100";
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const scrambled = await page.$$eval("[data-row] h3", (hs) => hs.map((h) => [...h.querySelectorAll("[data-ch]")].map((t) => t.textContent).join("")));
// bring the work panel's middle to the viewport centre, then stop scrolling
await page.evaluate(() => { const p = document.querySelector("#work [data-track]").parentElement.parentElement; const r = p.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - innerHeight / 2); });
await page.waitForTimeout(1500);
const t = () => page.$$eval("#work [data-track]", (ts) => ts.map((x) => new DOMMatrix(getComputedStyle(x).transform).m42.toFixed(1)));
const a = await t(); await page.waitForTimeout(2000); const b = await t();
const disc = await page.$eval('a[aria-label="See all recent work"]', (d) => { const r = d.getBoundingClientRect(); return Math.round(r.top + r.height / 2); });
// now scroll the board through and read it back
await page.evaluate(() => document.getElementById("method-title").scrollIntoView());
for (let k = 0; k < 12; k++) { await page.mouse.wheel(0, 300); await page.waitForTimeout(120); }
await page.waitForTimeout(1500);
const resolved = await page.$$eval("[data-row] h3", (hs) => hs.map((h) => [...h.querySelectorAll("[data-ch]")].map((t) => t.textContent).join("")));
console.log(JSON.stringify({ scrambled, loopY_before: a, loopY_after: b, discCentreY: disc, viewportCentreY: 450, resolved }, null, 1));
await browser.close();
