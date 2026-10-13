import { test, expect, type Page } from "@playwright/test";

// Regression guards for the audit fixes (SocialxBrand_Complete_Audit_and_Claude_Code_Plan.md).
// Each test names the plan item it protects.

/** Records every addEventListener/removeEventListener so a test can count the listeners still live. */
const trackListeners = () => {
  const w = window as unknown as { __listeners: { t: EventTarget; type: string; fn: unknown; signal?: AbortSignal; removed: boolean }[] };
  w.__listeners = [];
  const add = EventTarget.prototype.addEventListener;
  const remove = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (type: string, fn: unknown, opts?: boolean | AddEventListenerOptions) {
    const signal = typeof opts === "object" ? opts?.signal : undefined;
    w.__listeners.push({ t: this, type, fn, signal, removed: false });
    return add.call(this, type, fn as EventListener, opts as AddEventListenerOptions);
  };
  EventTarget.prototype.removeEventListener = function (type: string, fn: unknown, opts?: boolean | EventListenerOptions) {
    for (const l of w.__listeners) if (l.t === this && l.type === type && l.fn === fn) l.removed = true;
    return remove.call(this, type, fn as EventListener, opts);
  };
};

test("#9 DivisionTicker: its listeners are removed (not stacked) when reduced motion toggles", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.addInitScript(trackListeners);
  await page.goto("/capabilities", { waitUntil: "networkidle" });
  const live = () =>
    page.evaluate(() => {
      const w = window as unknown as { __listeners: { t: Element; type: string; signal?: AbortSignal; removed: boolean }[] };
      return w.__listeners.filter((l) => l.t instanceof Element && l.t.hasAttribute("data-ticker-row") && (l.type === "pointerenter" || l.type === "pointerleave") && !l.removed && !l.signal?.aborted).length;
    });
  const rows = await page.locator("[data-ticker-row]").count();
  expect(await live()).toBe(rows * 2);
  for (let i = 0; i < 3; i++) {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(150);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.waitForTimeout(150);
  }
  expect(await live(), "listeners after 3 reduced-motion toggles").toBe(rows * 2);
});

test("#5 work tiles: touch pointer moves do not trigger hover; a mouse does", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/", { waitUntil: "networkidle" });
  const tile = page.locator('#work a[href^="/work/"]').first();
  await tile.scrollIntoViewIfNeeded();
  const fire = (pointerType: string) => tile.evaluate((el, pointerType) => el.dispatchEvent(new PointerEvent("pointermove", { pointerType, bubbles: true, isPrimary: true })), pointerType);
  await fire("touch");
  await page.waitForTimeout(150);
  await expect(tile).not.toHaveAttribute("data-hot", "");
  await fire("mouse");
  await expect(tile).toHaveAttribute("data-hot", "");
});

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

test("#2 home: the hero takeover reel is not fetched or played at load, only once the scroll scene starts", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  const clip = /wedding-films-05\.(mp4|webm)/;
  const requested: string[] = [];
  page.on("request", (r) => { if (clip.test(r.url())) requested.push(r.url()); });
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  expect(requested, "takeover clip requested before any scroll").toEqual([]);
  await page.mouse.move(720, 450);
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(100); }
  await expect.poll(() => requested.length, { timeout: 8000 }).toBeGreaterThan(0);
});

test("#7 home capabilities stage: at most two reels are mounted, however many divisions the tour visits", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/", { waitUntil: "networkidle" });
  const stage = page.locator("#board-stage");
  await stage.scrollIntoViewIfNeeded();
  const chips = page.locator("section[aria-labelledby^='board-'] a");
  expect(await chips.count()).toBe(18);
  let most = 0;
  for (const i of [0, 5, 11, 17, 3, 9, 14]) {
    await chips.nth(i).focus(); // keyboard focus selects a division
    await page.waitForTimeout(250);
    most = Math.max(most, await stage.locator("video").count());
  }
  expect(most).toBeLessThanOrEqual(2);
  expect(most).toBeGreaterThan(0);
});

test("#6 capabilities index: the cursor preview mounts at most two reels while hovering many rows", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  await page.goto("/capabilities", { waitUntil: "networkidle" });
  const rows = page.locator("section[aria-labelledby^='cluster-'] li");
  const total = await rows.count();
  expect(total).toBe(18);
  const previews = page.locator("div.pointer-events-none.absolute.left-0.top-0.z-20");
  expect(await previews.locator("video").count(), "before any hover").toBe(0);
  let most = 0;
  for (let i = 0; i < total; i += 3) {
    await rows.nth(i).scrollIntoViewIfNeeded();
    const box = (await rows.nth(i).boundingBox())!;
    await page.mouse.move(box.x + 200, box.y + box.height / 2);
    await page.mouse.move(box.x + 230, box.y + box.height / 2); // real movement, then rest for the intent delay
    await page.waitForTimeout(260);
    most = Math.max(most, await previews.locator("video").count());
  }
  expect(most).toBeLessThanOrEqual(2);
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
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  expect(clips, "full-size clips requested at load, before any scroll").toEqual([]);
  // and when a reel does play, it is the WebM that is fetched on such a device
  await page.mouse.move(720, 450);
  for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, 200); await page.waitForTimeout(80); }
  await expect.poll(() => clips.some((c) => c.endsWith(".webm")), { timeout: 8000 }).toBe(true);
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
  await page.getByRole("button", { name: /review route/i }).click();
  await expect(page.getByRole("heading", { name: /review and send your route/i })).toBeVisible();
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
    expect(href).toMatch(/^mailto:socialxbrandpilot@gmail\.com\?subject=/);
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

test("route page: phones get a direct contact row above the builder; desktop keeps the side panel", async ({ page }, info) => {
  await page.goto("/route", { waitUntil: "networkidle" });
  const row = page.getByText("Prefer to talk?");
  if (info.project.name === "mobile") {
    await expect(row).toBeVisible();
    const links = row.locator("xpath=..").getByRole("link");
    await expect(links.nth(0)).toHaveAttribute("href", /^https:\/\/wa\.me\/918432935877$/);
    await expect(links.nth(1)).toHaveAttribute("href", "tel:+918432935877");
    await expect(links.nth(2)).toHaveAttribute("href", "mailto:socialxbrandpilot@gmail.com");
  } else if (info.project.name === "desktop") {
    await expect(row).toBeHidden();
    await expect(page.getByRole("heading", { name: /or just talk to us/i })).toBeVisible();
  }
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

test("#10 home AI pairs play once as they arrive and end struck-through with the replacement in place", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "desktop and reduced-motion cover it");
  await page.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  await page.goto("/", { waitUntil: "networkidle" });
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
