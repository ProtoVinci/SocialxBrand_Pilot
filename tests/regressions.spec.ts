import { test, expect, type Page } from "@playwright/test";

// Regression guards for the audit fixes (docs/briefs/archive/SocialxBrand_Complete_Audit_and_Claude_Code_Plan.md).
// Each test names the plan item it protects.

/** Records window.scrollBy calls, then walks the route builder to its second step on a short viewport (where it must scroll). */
async function stepChangeScrollCalls(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __scrollBy: string[] };
    w.__scrollBy = [];
    const by = window.scrollBy.bind(window);
    window.scrollBy = ((a?: ScrollToOptions | number, b?: number) => {
      w.__scrollBy.push(JSON.stringify(a));
      return typeof a === "object" ? by(a) : by(a as number, b as number);
    }) as typeof window.scrollBy;
  });
  await page.goto("/route", { waitUntil: "networkidle" });
  await page.getByText("Local Businesses").click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  // a DOM click, so Playwright does not scroll the page itself and hide what the builder does
  await page.getByRole("button", { name: /continue/i }).evaluate((b) => (b as HTMLElement).click());
  await page.waitForTimeout(1500);
  return page.evaluate(() => ({ scrollY: window.scrollY, calls: (window as unknown as { __scrollBy: string[] }).__scrollBy }));
}

test("#12 route builder: with Lenis running, a step change is scrolled by Lenis, not by a native smooth scroll", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.setViewportSize({ width: 1440, height: 500 });
  const { scrollY, calls } = await stepChangeScrollCalls(page);
  expect(scrollY, "the page was scrolled to the new step").toBeGreaterThan(100);
  expect(calls.filter((c) => c.includes("smooth")), "native smooth scrollBy calls").toEqual([]);
});

test.describe("route builder without Lenis (touch)", () => {
  test.use({ viewport: { width: 390, height: 500 }, hasTouch: true, isMobile: true });
  test("#12 keeps the browser's own smooth scroll when Lenis is not running", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "run once");
    const { scrollY, calls } = await stepChangeScrollCalls(page);
    expect(scrollY).toBeGreaterThan(100);
    expect(calls.filter((c) => c.includes("smooth"))).toHaveLength(1);
  });
});

test("#23 a device that decodes AV1 in hardware: reels still fetch nothing until they play (no video.load() at mount)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  // pretend the decoder is power-efficient, which is what switches reels to their WebM source
  await page.addInitScript(() => {
    sessionStorage.setItem("sxbp.intro", "1");
    Object.defineProperty(navigator, "mediaCapabilities", { value: { decodingInfo: async () => ({ supported: true, smooth: true, powerEfficient: true }) } });
  });
  const clips: string[] = [];
  page.on("request", (r) => { if (/\/media\/v\/[^/]+\.(mp4|webm)(\?|$)/.test(r.url()) && !/-preview\.mp4/.test(r.url())) clips.push(r.url().split("/").pop()!); });
  // a project page: its featured reel is on screen at load, the grid of reels is below the fold
  await page.goto("/work/restaurant-hospitality", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  expect(clips.length, `full-size clips requested at load, before any scroll: ${clips}`).toBeLessThanOrEqual(1);
  // and when a reel does play, it is the WebM that is fetched on such a device
  await page.mouse.move(720, 450);
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 200); await page.waitForTimeout(80); }
  await expect.poll(() => clips.filter((c) => c.endsWith(".webm")).length, { timeout: 8000 }).toBeGreaterThan(1);
});

/** Walks the route builder to its last step ("Review and send") with a valid brief. */
async function reachSendStep(page: Page) {
  await page.goto("/route", { waitUntil: "networkidle" });
  await page.getByText("Local Businesses").click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByText("Be chosen").click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /SEO & Local SEO/ }).click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/your name/i).fill("Test Visitor");
  await page.getByLabel(/^email/i).fill("visitor@example.com");
  await page.getByRole("button", { name: /review brief/i }).click();
  await expect(page.getByRole("heading", { name: /review and send your brief/i })).toBeVisible();
}

test.describe("enquiry adapters (the documented contact architecture: WhatsApp, mailto, copy)", () => {
  test("email adapter opens a mailto: to the site address, and the brief names the real host (not a fixed domain)", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "run once");
    await page.addInitScript(() => {
      const w = window as unknown as { __opened: string[] };
      w.__opened = [];
      window.open = ((url?: string | URL) => { w.__opened.push(String(url)); return null; }) as typeof window.open;
    });
    await reachSendStep(page);
    await page.getByRole("button", { name: /send by email/i }).click();
    const [href] = await page.evaluate(() => (window as unknown as { __opened: string[] }).__opened);
    expect(href).toMatch(/^mailto:workwith\.sxbp@gmail\.com\?subject=/);
    const body = decodeURIComponent(href.split("body=")[1]);
    expect(body).toContain("Test Visitor");
    expect(body).toContain(`on ${new URL(page.url()).host})`);
    expect(body, "no hard-coded domain").not.toContain("sxbp.com");
    await expect(page.getByRole("status")).toContainText("Opening your email app");
  });

  test("copy adapter puts the brief on the clipboard and says only that it was copied", async ({ page, context }, info) => {
    test.skip(info.project.name !== "desktop", "run once");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await reachSendStep(page);
    await page.getByRole("button", { name: /copy the brief/i }).click();
    await expect(page.getByRole("status")).toContainText("Brief copied");
    const text = await page.evaluate(() => navigator.clipboard.readText());
    expect(text).toContain("Hello SOCIALxBRAND PILOT");
    expect(text).toContain("visitor@example.com");
  });

  test("the details step says plainly that nothing is stored or sent by the site", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "run once");
    await page.goto("/route", { waitUntil: "networkidle" });
    await page.getByText("Local Businesses").click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByText("Be chosen").click();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /SEO & Local SEO/ }).click();
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText(/does not store or send these details/i)).toBeVisible();
  });
});

test("contact page: WhatsApp, call and email come first, above the optional project brief, at every size", async ({ page }) => {
  await page.goto("/route", { waitUntil: "networkidle" });
  const direct = page.locator("section[aria-labelledby=direct-title] a");
  await expect(direct).toHaveCount(3);
  await expect(direct.nth(0)).toHaveAttribute("href", /^https:\/\/wa\.me\/918432935877$/);
  await expect(direct.nth(1)).toHaveAttribute("href", "tel:+918432935877");
  await expect(direct.nth(2)).toHaveAttribute("href", "mailto:workwith.sxbp@gmail.com");
  await expect(direct.nth(0)).toBeInViewport();
  const directTop = await direct.nth(0).evaluate((el) => el.getBoundingClientRect().top);
  const briefTop = await page.locator("#brief").evaluate((el) => el.getBoundingClientRect().top);
  expect(directTop).toBeLessThan(briefTop);
  // the hand-off is described as it really is
  await expect(page.getByText("The website does not submit the message automatically.")).toBeVisible();
});

test("project brief: services are optional, a visitor who is not sure can still reach the send step", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/route", { waitUntil: "networkidle" });
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/your name/i).fill("Test Visitor");
  await page.getByLabel(/^email/i).fill("visitor@example.com");
  await page.getByRole("button", { name: /review brief/i }).click();
  await expect(page.getByRole("heading", { name: /review and send your brief/i })).toBeVisible();
  await expect(page.getByText(/Services: not chosen yet/)).toBeVisible();
});

test("#10 one-shot reveals (now IntersectionObserver, not ScrollTrigger): the work-detail rises end fully visible", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "desktop and reduced-motion cover it");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/work/restaurant-hospitality", { waitUntil: "networkidle" });
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 500) { await page.evaluate((t) => window.scrollTo(0, t), y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1500);
  const states = await page.evaluate(() => [...document.querySelectorAll("[data-rise]")].map((e) => { const cs = getComputedStyle(e); return { opacity: cs.opacity, visibility: cs.visibility }; }));
  expect(states.length).toBeGreaterThan(3);
  expect(states.filter((s) => s.opacity !== "1" || s.visibility !== "visible"), "rises left hidden").toEqual([]);
});

test("#10 AI pairs (AI Marketing & Automation page) play once as they arrive and end struck-through with the replacement in place", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "desktop and reduced-motion cover it");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/capabilities/ai-marketing-automation", { waitUntil: "networkidle" });
  const pairs = page.locator("[data-pair]");
  const n = await pairs.count();
  expect(n).toBe(3);
  await page.locator("#ai-title").scrollIntoViewIfNeeded();
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 140); await page.waitForTimeout(150); }
  await page.waitForTimeout(2500);
  const ends = await page.evaluate(() => [...document.querySelectorAll("[data-pair]")].map((p) => {
    const should = getComputedStyle(p.querySelector("[data-should]")!).transform;
    const strike = getComputedStyle(p.querySelector("[data-strike]")!).transform;
    return { should, strike };
  }));
  // after the timeline: replacement line at rest (no translate), strike fully drawn (scaleX 1 or no transform)
  for (const e of ends) {
    expect(e.should === "none" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(e.should), `replacement line not in place: ${e.should}`).toBe(true);
    expect(e.strike === "none" || /matrix\(1, 0, 0, 1, 0, 0\)/.test(e.strike), `strike not drawn: ${e.strike}`).toBe(true);
  }
});

// ── Performance fixes (docs/briefs/archive/SocialxBrand_Performance_Fixes_README.md); each names the issue it guards ──

const playingVideos = (page: Page) => page.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.paused).length);

test("perf #4/#5 home: the hero capsules play through the shared budget (at most 3 videos at once, 2 on a phone)", async ({ page }, info) => {
  test.skip(info.project.name === "reduced", "nothing plays under reduced motion");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  let most = 0;
  // long enough for both capsules to hand over (current + outgoing clip each) more than once
  for (let i = 0; i < 45; i++) { most = Math.max(most, await playingVideos(page)); await page.waitForTimeout(100); }
  expect(most).toBeGreaterThan(0);
  expect(most).toBeLessThanOrEqual(info.project.name === "mobile" ? 2 : 3);
});

test("perf #10 work index: scrolling under a resting cursor fetches no previews; a real mouse movement plays one", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  const clips: string[] = [];
  page.on("request", (r) => { if (/\/media\/v\/[^?]+\.(mp4|webm)(\?|$)/.test(r.url())) clips.push(r.url()); });
  await page.goto("/work", { waitUntil: "networkidle" });
  await page.mouse.move(720, 450);
  for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(80); }
  await page.waitForTimeout(800);
  expect(clips, "previews fetched by tiles sliding under the cursor").toEqual([]);
  const reel = page.locator("[data-tile] video").first();
  await reel.scrollIntoViewIfNeeded();
  const box = (await reel.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
  await expect.poll(() => clips.length, { timeout: 8000 }).toBeGreaterThan(0);
});

test("perf #7/#12 navigation: Home → Work → back → Work, each page arrives visible and the home media stops", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const work = async () => {
    await page.locator('header a[href="/work"]').first().click();
    await page.waitForURL("**/work");
    await expect(page.locator("[data-tile]").first()).toBeVisible();
    await page.waitForTimeout(800);
    expect(await page.locator("#hero-title").count(), "home page left behind").toBe(0);
    expect(await playingVideos(page), "a video still plays after leaving home").toBe(0);
  };
  await work();
  await page.goBack();
  await page.waitForURL((u) => u.pathname === "/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await work();
});

// ── Post-phase audit (docs/briefs/archive/SocialxBrand_Pilot_PostPhase_Audit.md); each names the audit section ──

type GsapHook = { gsap: typeof import("gsap").gsap; ScrollTrigger: { getAll(): { trigger?: Element }[] } };
/** The development-only `window.__gsap` hook (src/lib/gsap.ts); absent from production builds. */
const hasGsapHook = (page: Page) => page.evaluate(() => "__gsap" in window);

test("audit §3 hero capsules: the media window stays bounded (≤3 clips per capsule) however long the carousel cycles", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  let most = 0;
  let currentWithoutClip = 0;
  // ~12s: the top capsule (1.4s beat) goes round its four clips twice
  for (let i = 0; i < 48; i++) {
    const s = await page.evaluate(() => [...document.querySelectorAll("[data-pill] > span")].map((pill) => ({
      clips: pill.querySelectorAll("video").length,
      // the slide on screen has its clip mounted (warmed during the previous beat)
      onHasClip: Boolean(pill.querySelector("[data-state=on] video")),
    })));
    most = Math.max(most, ...s.map((p) => p.clips));
    if (i > 12) currentWithoutClip += s.filter((p) => !p.onHasClip).length;
    await page.waitForTimeout(250);
  }
  expect(most, "clips mounted in one capsule").toBeLessThanOrEqual(3);
  expect(currentWithoutClip, "samples where the slide on screen had no clip").toBe(0);
});

test("audit §9 video budget: crossing the 768px breakpoint re-ranks at once (3 slots → 2 → 3)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/work/restaurant-hospitality", { waitUntil: "load" });
  const grid = page.locator("ul li video").first();
  await grid.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  const playing = () => page.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.paused).length);
  await expect.poll(playing, { timeout: 10000 }).toBe(3);
  await page.setViewportSize({ width: 700, height: 900 });
  await expect.poll(playing, { timeout: 5000 }).toBeLessThanOrEqual(2);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollBy(0, 1));
  await expect.poll(playing, { timeout: 10000 }).toBe(3);
});

test("audit §6/§11 leaving mid-animation: no tween left on removed nodes, trigger count flat across Home ↔ Work", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  test.skip(!(await hasGsapHook(page)), "needs the development-only window.__gsap hook (run against `next dev`)");
  await page.waitForTimeout(1000);
  const counts: number[] = [];
  for (let visit = 0; visit < 3; visit++) {
    // start the services and steps reveals (observer-created tweens), then leave at once
    const steps = page.locator("section[aria-labelledby=process-title]");
    const top = await steps.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y), top - 300);
    await page.waitForTimeout(120);
    // the bar has slid away on the scroll down: a DOM click, as a keyboard user or the menu would
    await page.locator('header a[href="/work"]').first().dispatchEvent("click");
    await page.waitForURL("**/work");
    await page.waitForTimeout(1200);
    const orphans = await page.evaluate(() => {
      const { gsap } = (window as unknown as { __gsap: GsapHook }).__gsap;
      return gsap.globalTimeline.getChildren(true, true, false)
        .flatMap((t) => (t as gsap.core.Tween).targets?.() ?? [])
        .filter((el): el is Element => el instanceof Element && !el.isConnected).length;
    });
    expect(orphans, "tweens still animating nodes of the page that was left").toBe(0);
    await page.goBack();
    await page.waitForURL((u) => u.pathname === "/");
    await page.waitForTimeout(2500);
    counts.push(await page.evaluate(() => (window as unknown as { __gsap: GsapHook }).__gsap.ScrollTrigger.getAll().length));
  }
  expect(new Set(counts).size, `ScrollTriggers on each return to home: ${counts}`).toBe(1);
  expect(errors).toEqual([]);
});

// ── Client-first layout (docs/briefs/archive/SocialxBrand_Client_First_Layout_Refactor_Plan.md) ──

test("client-first home: the first screen says what the agency does and leads to Work and Services; five sections, then the footer", async ({ page }, info) => {
  test.skip(info.project.name === "reduced", "desktop and phone cover it");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await expect(page.getByRole("heading", { level: 1, name: "Every business has something worth showing." })).toBeVisible();
  await expect(page.getByText(/18 marketing services/)).toBeInViewport();
  for (const [name, href] of [["See our work", "/work"], ["Explore services", "/capabilities"]] as const) {
    const link = page.locator("#main").getByRole("link", { name, exact: false }).first();
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toBeInViewport();
  }
  const sections = await page.evaluate(() => [...document.querySelectorAll("#main > div > section, #main section")].filter((s) => !s.parentElement?.closest("section")).length);
  // hero, selected work, services, steps, contact; plus client feedback once approved quotes exist
  expect(sections, "top-level home sections").toBeLessThanOrEqual(6);
});

test("client-first services: all 18 services listed under the four groups, each page in the same plain pattern", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  test.setTimeout(180_000);
  await page.goto("/capabilities", { waitUntil: "load" });
  for (const id of ["strategy-social", "content-creative", "reach-enquiries", "creators-community"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
  const hrefs = await page.locator("section[aria-labelledby=directory-title] a[href^='/capabilities/']").evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  expect(hrefs).toHaveLength(18);
  for (const href of hrefs) {
    await page.goto(href!, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const name of [/What this service helps with/, /Typical deliverables/, /How we work/, /Related services/]) {
      await expect(page.getByRole("heading", { name }), `${href}: ${name}`).toHaveCount(1);
    }
    await expect(page.getByRole("link", { name: /Discuss this service/ }).first()).toBeVisible();
  }
});

test("client-first language: no internal terms (Pilot Route, screening, station, division) in the visible pages", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  for (const route of ["/", "/work", "/work/restaurant-hospitality", "/capabilities", "/capabilities/social-media-management", "/approach", "/route"]) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const text = await page.evaluate(() => document.body.innerText);
    expect(text.match(/pilot route|screenings?\b|stations?\b|divisions?\b/gi), route).toBeNull();
  }
});

// ── Deep audit, 2026-10-17 (docs/briefs/archive/SocialxBrand_Pilot5_Deep_Audit_Client_Performance.md) ──

test("audit5 P1 hero capsules: posters follow the media window (≤3 per capsule), not all eight", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  let most = 0;
  for (let i = 0; i < 24; i++) {
    most = Math.max(most, ...(await page.evaluate(() => [...document.querySelectorAll("[data-pill] > span")].map((p) => p.querySelectorAll("img").length))));
    await page.waitForTimeout(250);
  }
  expect(most).toBeGreaterThan(0);
  expect(most, "poster images in one capsule").toBeLessThanOrEqual(3);
});

test("audit5 A11Y-2 reduced motion: the hero capsules hold their first still, with no video", async ({ page }, info) => {
  test.skip(info.project.name !== "reduced", "reduced-motion project only");
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(3500);
  const pills = await page.evaluate(() => [...document.querySelectorAll("[data-pill] > span")].map((p) => ({
    videos: p.querySelectorAll("video").length,
    on: [...p.querySelectorAll("[data-state]")].findIndex((s) => s.getAttribute("data-state") === "on"),
    poster: Boolean(p.querySelector("[data-state=on] img")),
  })));
  expect(pills.length).toBe(2);
  for (const p of pills) expect(p).toEqual({ videos: 0, on: 0, poster: true });
});

test("audit5 A11Y-1 menu: Tab and Shift+Tab stay inside the open menu; Escape closes it and returns focus", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/work", { waitUntil: "load" });
  const button = page.getByRole("button", { name: /menu/i });
  await button.click();
  await expect(page.locator("#site-menu")).toBeVisible();
  const inside = () => page.evaluate(() => {
    const a = document.activeElement;
    return Boolean(a && (document.getElementById("site-menu")?.contains(a) || a.getAttribute("aria-controls") === "site-menu"));
  });
  for (let i = 0; i < 9; i++) { await page.keyboard.press("Tab"); expect(await inside(), `Tab ${i + 1} left the menu`).toBe(true); }
  for (let i = 0; i < 9; i++) { await page.keyboard.press("Shift+Tab"); expect(await inside(), `Shift+Tab ${i + 1} left the menu`).toBe(true); }
  await page.keyboard.press("Escape");
  await expect(page.locator("#site-menu")).toBeHidden();
  await expect(button).toBeFocused();
});

test("audit5 C6 work filters: mixed collections count under every format they hold; counts match what shows", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/work", { waitUntil: "load" });
  const filters = page.getByRole("group", { name: /filter work/i }).getByRole("button");
  const expected: Record<string, number> = {};
  for (const name of ["All work", "Reels & films", "Photography", "Design & identity"]) {
    const btn = filters.filter({ hasText: name });
    expected[name] = Number((await btn.locator(".label").textContent())?.trim());
    await btn.click();
    await page.waitForTimeout(1200);
    await expect(page.locator("[data-tile]"), name).toHaveCount(expected[name]);
    if (name === "Photography") {
      for (const slug of ["portrait-fashion", "family-celebrations", "wedding-photography"]) await expect(page.locator(`[data-tile] a[href="/work/${slug}"]`)).toHaveCount(1);
    }
  }
  expect(expected["All work"]).toBe(14);
});

test("audit5 C3/C8 labels: work pages are collections, the 404 page says what happened", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/work/brand-films", { waitUntil: "load" });
  await expect(page.getByText(/^Work collection · /)).toBeVisible();
  const res = await page.goto("/no-such-page", { waitUntil: "load" });
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: /page not found/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to Home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "See our work" }).last()).toHaveAttribute("href", "/work");
});

test("audit5 C1 client feedback: one card per approved entry at the end of home, no ratings, looping on its own with a Pause", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  const { publishableFeedback } = await import("../src/content/feedback");
  const approved = publishableFeedback();
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  const section = page.locator("#client-feedback");
  if (!approved.length) { await expect(section).toHaveCount(0); return; }
  await expect(section.locator("li")).toHaveCount(approved.length);
  for (const f of approved) await expect(section.getByText(f.quote, { exact: true })).toHaveCount(1);
  await expect(section.getByText(/★|stars?|\/\s*5/i)).toHaveCount(0);
  // it sits after "How we work" and before the closing call to action
  const order = await page.evaluate(() => [...document.querySelectorAll("#main section[aria-labelledby]")].filter((s) => !s.parentElement?.closest("section")).map((s) => s.getAttribute("aria-labelledby")));
  expect(order.slice(-3)).toEqual(["process-title", "feedback-title", "closing-title"]);
  // it moves on by itself, card by card, and loops; it holds still on hover and after Pause
  const list = section.locator("ul");
  await section.scrollIntoViewIfNeeded();
  await page.mouse.move(5, 5);
  await expect.poll(() => list.evaluate((el) => el.scrollLeft), { timeout: 9000 }).toBeGreaterThan(0);
  const next = section.getByRole("button", { name: "Next feedback" });
  for (let i = 0; i < approved.length; i++) {
    if (await list.evaluate((el) => el.scrollLeft + el.clientWidth > el.scrollWidth - 4)) break;
    await next.click(); await page.waitForTimeout(450);
  }
  await next.click();
  await expect.poll(() => list.evaluate((el) => el.scrollLeft), { timeout: 3000 }).toBeLessThan(4);
  await section.getByRole("button", { name: "Pause feedback" }).click();
  await expect(section.getByRole("button", { name: "Play feedback" })).toHaveAttribute("aria-pressed", "true");
  const at = await list.evaluate((el) => el.scrollLeft);
  await page.waitForTimeout(6000);
  expect(await list.evaluate((el) => el.scrollLeft), "moved while paused").toBe(at);
});

test("audit5 client feedback under reduced motion: the row never moves on its own and offers no Pause", async ({ page }, info) => {
  test.skip(info.project.name !== "reduced", "reduced-motion project only");
  await page.goto("/", { waitUntil: "load" });
  const section = page.locator("#client-feedback");
  test.skip(!(await section.count()), "no approved feedback");
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(6000);
  expect(await section.locator("ul").evaluate((el) => el.scrollLeft)).toBe(0);
  await expect(section.getByRole("button", { name: /pause feedback/i })).toHaveCount(0);
});

for (const vt of ["native", "absent"] as const) {
  test(`audit5 P2 leaving home with View Transitions ${vt}: Work and Services open cleanly, back works, no errors`, async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "run once");
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.addInitScript((vt) => {
      sessionStorage.setItem("sxbp.intro", "1");
      if (vt === "absent") delete (Document.prototype as unknown as { startViewTransition?: unknown }).startViewTransition;
    }, vt);
    await page.goto("/", { waitUntil: "load" });
    for (const [href, check] of [["/work", "[data-tile]"], ["/capabilities", "#directory-title"]] as const) {
      await page.locator(`header a[href="${href}"]`).first().click();
      await page.waitForURL(`**${href}`);
      await expect(page.locator(check).first()).toBeVisible();
      await page.goBack();
      await page.waitForURL((u) => u.pathname === "/");
      await expect(page.locator("#hero-title")).toBeVisible();
    }
    // through the open menu too
    await page.getByRole("button", { name: /menu/i }).click();
    await page.locator('#site-menu a[href="/work"]').click();
    await page.waitForURL("**/work");
    await expect(page.locator("[data-tile]").first()).toBeVisible();
    await expect(page.locator("#site-menu")).toBeHidden();
    // the override is gone once home is: an inner route keeps the real API (when the browser has it)
    const own = await page.evaluate(() => Object.prototype.hasOwnProperty.call(document, "startViewTransition"));
    expect(own).toBe(false);
    expect(errors).toEqual([]);
  });
}

test("about: both founders with name, role, a loaded portrait and alt text; reachable from the nav and footer", async ({ page }, info) => {
  const { founders } = await import("../src/content/founders");
  await page.goto("/about", { waitUntil: "load" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText("The people behind");
  for (const f of founders) {
    const row = page.locator(`li#${f.id}`);
    // rows rise in as they enter the viewport (Reveal), so bring each one on screen first
    await row.scrollIntoViewIfNeeded();
    await expect(row.getByRole("heading", { level: 3, name: f.name })).toBeVisible();
    await expect(row.getByText(f.role, { exact: true })).toBeVisible();
    const img = row.getByRole("img", { name: f.portraitAlt });
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth)).toBeGreaterThan(0);
    // 4:5 portrait, never stretched
    const box = await img.boundingBox();
    expect(box!.height / box!.width).toBeCloseTo(1.25, 1);
  }
  expect(await page.locator('script[type="application/ld+json"]').evaluateAll((s) => s.filter((x) => x.textContent!.includes('"Person"')).length)).toBe(founders.length);
  await expect(page.locator("footer").getByRole("link", { name: "About", exact: true })).toHaveAttribute("href", "/about");
  if (info.project.name === "desktop") await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "About", exact: true })).toHaveAttribute("aria-current", "page");
});

// ── Pilot6 full audit, 2026-10-17 (docs/briefs/SocialxBrand_Pilot6_Full_Audit_and_Fix_Plan.md) ──

test("pilot6 P0.1 hero capsules: partly scrolled away, a capsule keeps playing its clip but stops changing it", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const top = page.locator("[data-pill=top] > span");
  const box = (await top.boundingBox())!;
  // scroll until about half of the top capsule has left the screen
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(box.y + box.height / 2));
  await page.waitForTimeout(1200); // let a handover already under way finish
  const onIndex = () => top.evaluate((pill) => [...pill.children].findIndex((s) => s.getAttribute("data-state") === "on"));
  const first = await onIndex();
  const seen = new Set<number>();
  for (let i = 0; i < 16; i++) { seen.add(await onIndex()); await page.waitForTimeout(250); } // ~3 beats of 1.4s
  expect([...seen], "slides shown while partly scrolled away").toEqual([first]);
  expect(await top.evaluate((pill) => [...pill.querySelectorAll("video")].filter((v) => !v.paused).length)).toBe(1);
  expect(await top.locator("[data-state=out]").count(), "an outgoing slide left mounted").toBe(0);
  // back in full view, it changes clip again
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(onIndex, { timeout: 4000 }).not.toBe(first);
});

test("pilot6 P1.4 video budget: one cold start at a time (the first work cards never start their downloads together)", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.addInitScript(() => {
    sessionStorage.setItem("sxbp.intro", "1");
    // at every play() on a video with no data yet, count the earlier such starts still in flight:
    // no frame yet, not paused, no error (judged by state, not by event order: the budget starts
    // the next video from inside the previous one's canplay handler)
    const w = window as unknown as { __cold: { most: number } };
    w.__cold = { most: 0 };
    const open = new Set<HTMLMediaElement>();
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      for (const el of open) if (el.readyState >= 2 || el.paused || el.error) open.delete(el);
      if (this.readyState < 2) { open.add(this); w.__cold.most = Math.max(w.__cold.most, open.size); }
      return play.call(this);
    };
  });
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  await page.mouse.move(720, 450);
  for (let y = 0; y < 1400; y += 100) { await page.mouse.wheel(0, 100); await page.waitForTimeout(30); }
  // the three work cards on screen all end up playing
  await expect.poll(() => page.evaluate(() => [...document.querySelectorAll("video")].filter((v) => !v.closest("[data-pill]") && !v.paused).length), { timeout: 10_000 }).toBe(3);
  expect(await page.evaluate(() => (window as unknown as { __cold: { most: number } }).__cold.most), "cold starts in flight at once").toBe(1);
});

test("pilot6 P2.19 video that fails to load: the capsules and work cards keep their posters", async ({ page }, info) => {
  test.skip(info.project.name === "reduced", "no video under reduced motion");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.route((u) => /\.(mp4|webm)$/.test(u.pathname), (r) => r.abort());
  await page.goto("/", { waitUntil: "load" });
  const loaded = (sel: string) => page.locator(sel).evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0));
  await expect.poll(() => loaded("[data-pill] [data-state=on] img")).toEqual([true, true]);
  const cards = page.locator("#main a video").first();
  await cards.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  const posters = await page.locator("#main a").filter({ has: page.locator("video") }).locator("picture img").evaluateAll((imgs) => imgs.slice(0, 3).map((i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0));
  expect(posters).toEqual([true, true, true]);
  expect(errors).toEqual([]);
});

test("pilot6 P0.20 no Google Drive ids are sent to visitors", async ({ page }) => {
  const res = await page.goto("/", { waitUntil: "load" });
  const html = await res!.text();
  expect(html).not.toContain("driveId");
});
