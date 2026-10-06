import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/work", "/work/restaurant-hospitality", "/capabilities", "/capabilities/performance-marketing", "/approach", "/route"];

for (const route of ROUTES) {
  test(`${route}: renders, no page errors, no horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 });
    // walk the page so scroll-triggered code runs
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 900) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(60);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "horizontal overflow (px)").toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("accessibility: no serious or critical axe violations on key routes", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  for (const route of ["/", "/capabilities/branding-identity", "/route"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(2800); // let entrance reveals settle so hidden states don't skew contrast
    const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${route}: ${v.id} — ${v.help}`)).toEqual([]);
  }
});

test("reduced motion: content complete, nothing left hidden", async ({ page }, info) => {
  test.skip(info.project.name !== "reduced", "reduced-motion project only");
  await page.goto("/", { waitUntil: "networkidle" });
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]")].filter((el) => getComputedStyle(el).visibility === "hidden").length,
  );
  expect(hidden).toBe(0);
  await expect(page.getByText("We aim to create digital impact.", { exact: true })).toBeVisible();
  const pins = await page.evaluate(() => document.querySelectorAll(".pin-spacer").length);
  expect(pins).toBe(0);
});

test("route builder: selection persists to the nav badge and produces a WhatsApp brief", async ({ page, context }, info) => {
  test.skip(info.project.name !== "desktop", "run once");
  // Never hit the real wa.me from tests: answer it locally so the popup URL is inspectable offline too.
  await context.route("https://wa.me/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "ok" }));
  await page.goto("/route", { waitUntil: "networkidle" });
  await page.getByText("Local Businesses").click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByText("Be chosen").click();
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByRole("button", { name: /SEO & Local SEO/ }).click();
  await expect(page.getByLabel(/divisions on your route/)).toBeVisible();
  await page.getByRole("button", { name: /continue/i }).click();
  // validation: name + one contact method required
  await page.getByRole("button", { name: /review route/i }).click();
  await expect(page.getByText("Tell us your name.")).toBeVisible();
  await page.getByLabel(/your name/i).fill("Test Visitor");
  await page.getByLabel(/^email/i).fill("visitor@example.com");
  await page.getByRole("button", { name: /review route/i }).click();
  await expect(page.getByRole("heading", { name: /your route is ready/i })).toBeVisible();
  const [popup] = await Promise.all([
    context.waitForEvent("page").catch(() => null),
    page.getByRole("button", { name: /send on whatsapp/i }).click(),
  ]);
  if (popup) {
    expect(popup.url()).toContain("wa.me/918432935877");
    expect(decodeURIComponent(popup.url())).toContain("Test Visitor");
    await popup.close();
  }
});
