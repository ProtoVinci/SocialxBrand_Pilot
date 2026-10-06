// Debug helper: loads a route, prints page errors with stacks, and evaluates a probe script.
// usage: node scripts/qa/debug.mjs --url=/ --probe="<js expression>" [--scroll=1800]
import { chromium } from "playwright";
const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=") ?? d;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(arg("w", "1440")), height: Number(arg("h", "900")) } });
page.on("pageerror", (e) => console.log("PAGEERROR", e.message, "\n", (e.stack || "").split("\n").slice(0, 6).join("\n")));
await page.goto(`http://localhost:3100${arg("url", "/")}`, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const scroll = Number(arg("scroll", "0"));
if (scroll) { await page.evaluate((y) => window.scrollTo(0, y), scroll); await page.waitForTimeout(1200); }
const probe = arg("probe", "");
if (probe) console.log(JSON.stringify(await page.evaluate(probe), null, 2));
await browser.close();
