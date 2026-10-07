// User-flow check: no page may strand a visitor. For every route it scrolls to the very
// bottom and asserts the nav bar is back on screen, a Home link is reachable without
// scrolling up, the page offers onward links, and inner pages show a breadcrumb trail.
// Then it walks one real journey: home -> "See Recent Work" -> /work -> a screening -> home.
import { chromium } from "playwright";
const base = process.env.QA_BASE ?? "http://localhost:3100";
const routes = ["/", "/work", "/work/creator-content", "/capabilities", "/capabilities/social-media-marketing", "/approach", "/route"];
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const problems = [];

for (const r of routes) {
  await page.goto(base + r, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // scroll down in steps (so the nav sees a downward scroll), ending at the very bottom
  for (let k = 0; k < 40; k++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(60); }
  await page.waitForTimeout(900);
  const s = await page.evaluate(() => {
    const bar = document.querySelector("body header, header[style*='site-header']");
    const r = bar?.getBoundingClientRect();
    const onScreen = (el) => { const b = el.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight && b.width > 0; };
    const homes = [...document.querySelectorAll('a[href="/"]')].filter(onScreen).length;
    return {
      atBottom: Math.abs(scrollY + innerHeight - document.documentElement.scrollHeight) < 4,
      navVisible: !!r && r.bottom > 10,
      homeLinksOnScreen: homes,
      onward: document.querySelectorAll("#where-next-title, #finale-title").length,
      crumbs: !!document.querySelector('nav[aria-label="Breadcrumb"]'),
    };
  });
  const issues = [];
  if (!s.navVisible) issues.push("nav hidden at page end");
  if (s.homeLinksOnScreen === 0) issues.push("no Home link on screen at page end");
  if (r !== "/" && !s.onward) issues.push("no onward section");
  if (r !== "/" && !s.crumbs) issues.push("no breadcrumbs");
  console.log(r.padEnd(40), JSON.stringify(s), issues.length ? "  <-- " + issues.join("; ") : "  ok");
  if (issues.length) problems.push(r);
}

// the journey from the report: home -> disc -> /work -> a screening -> home via breadcrumb
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.click('a[aria-label="See all recent work"]');
await page.waitForURL("**/work");
await page.click('#main a[href^="/work/"]');
await page.waitForURL("**/work/*");
await page.click('nav[aria-label="Breadcrumb"] a[href="/"]');
await page.waitForURL(base + "/");
console.log("journey home -> disc -> /work -> screening -> home: ok");

await browser.close();
if (problems.length) { console.error("FAILED:", problems.join(", ")); process.exit(1); }
console.log("all routes: a way on and a way home at the end of every page");
