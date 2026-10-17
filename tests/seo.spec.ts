import { expect, test, type APIRequestContext } from "@playwright/test";

/**
 * Technical SEO checks on the served HTML (no browser rendering): robots.txt, the sitemap, and
 * for every sitemap URL its status, title, description, canonical, share tags and JSON-LD.
 * Meant for a production server (`npm run build && npm run start -- --port 3100`), where the
 * metadata is final; it also runs against `next dev`. Request-only, so it runs in one project.
 * docs/seo.md lists what each check protects.
 */

// the origin every absolute URL must use: the build's NEXT_PUBLIC_SITE_URL, else the profile's domain
const ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.socialxbrandpilot.com").replace(/\/+$/, "");

test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "request-only checks run once"));

const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const metas = (html: string, key: string) =>
  [...html.matchAll(/<meta [^>]*>/g)].map((m) => m[0]).filter((t) => attr(t, "property") === key || attr(t, "name") === key).map((t) => attr(t, "content"));
const decode = (s = "") => s.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const local = (url: string) => new URL(url).pathname;
/** "https://host" and "https://host/" are the same URL (Next writes the root canonical without the slash). */
const same = (a?: string, b?: string) => !!a && !!b && new URL(a).href === new URL(b).href;

async function sitemapUrls(request: APIRequestContext) {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

test("robots.txt allows the site and points at the canonical sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/plain");
  const txt = await res.text();
  expect(txt).toMatch(/User-Agent: \*\nAllow: \//);
  expect(txt).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  // no blanket block, no public route family disallowed, no Host line (Google ignores it)
  const disallowed = [...txt.matchAll(/^Disallow: (.*)$/gm)].map((m) => m[1].trim());
  expect(disallowed).toEqual(["/__contact/"]);
  expect(txt).not.toMatch(/^Host:/m);
});

test("the sitemap lists every public route once, on the canonical origin", async ({ request }) => {
  const urls = await sitemapUrls(request);
  expect(new Set(urls).size).toBe(urls.length);
  for (const u of urls) expect(u.startsWith(`${ORIGIN}/`), u).toBe(true);
  const paths = urls.map(local);
  for (const p of ["/", "/work", "/capabilities", "/approach", "/about", "/route"]) expect(paths).toContain(p);
  expect(paths.filter((p) => p.startsWith("/capabilities/"))).toHaveLength(18);
  expect(paths.filter((p) => p.startsWith("/work/")).length).toBeGreaterThan(0);
  expect(paths.some((p) => p.includes("?") || p.includes("__contact") || (p !== "/" && p.endsWith("/")))).toBe(false);
});

test("every sitemap page has unique metadata, a self canonical, share tags and valid JSON-LD", async ({ request }) => {
  test.setTimeout(180_000);
  const urls = await sitemapUrls(request);
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const url of urls) {
    const path = local(url);
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(200);
    const html = await res.text();

    // title and description: present and unique across the site
    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1]);
    expect(title, path).not.toBe("");
    expect(titles.has(title), `${path} repeats the title of ${titles.get(title)}`).toBe(false);
    titles.set(title, path);
    const description = decode(metas(html, "description")[0]);
    expect(description.length, path).toBeGreaterThan(50);
    expect(descriptions.has(description), `${path} repeats the description of ${descriptions.get(description)}`).toBe(false);
    descriptions.set(description, path);

    // exactly one canonical, pointing at this page on the canonical origin
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
    expect(canonicals, path).toHaveLength(1);
    expect(same(canonicals[0], url), `${path} canonical ${canonicals[0]}`).toBe(true);
    expect(metas(html, "robots").some((r) => r?.includes("noindex")), path).toBe(false);

    // share tags: one of each, og:url = the canonical, images on the canonical origin
    for (const key of ["og:title", "og:description", "og:url", "og:image", "og:type", "og:site_name", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
      expect(metas(html, key), `${path} ${key}`).toHaveLength(1);
    }
    expect(same(metas(html, "og:url")[0], url), `${path} og:url`).toBe(true);
    expect(decode(metas(html, "og:title")[0])).toBe(title);
    for (const key of ["og:image", "twitter:image"]) expect(metas(html, key)[0]!.startsWith(`${ORIGIN}/`), `${path} ${key}`).toBe(true);
    expect(metas(html, "twitter:card")[0]).toBe("summary_large_image");

    // one h1
    expect(html.match(/<h1[\s>]/g) ?? [], path).toHaveLength(1);

    // JSON-LD: parses, stays on the canonical origin, carries nothing the site cannot back up
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    const ld = blocks.map((b) => JSON.parse(b));
    const raw = blocks.join("\n");
    for (const u of raw.match(/https?:\/\/[^"\\]+/g) ?? []) {
      if (!u.startsWith("https://schema.org")) expect(u.startsWith(`${ORIGIN}/`) || u === ORIGIN, `${path} JSON-LD url ${u}`).toBe(true);
    }
    for (const banned of ["AggregateRating", "Review", "LocalBusiness", "ProfessionalService", "PostalAddress", "SearchAction", "VideoObject", "FAQPage", "priceRange", "offers"]) {
      expect(raw.includes(`"${banned}"`), `${path} JSON-LD has ${banned}`).toBe(false);
    }
    const nodes = ld.flatMap((d) => d["@graph"] ?? [d]);
    expect(nodes.filter((n) => n["@type"] === "Organization"), path).toHaveLength(1);
    expect(nodes.filter((n) => n["@type"] === "WebSite"), path).toHaveLength(1);
    if (path !== "/") {
      const crumbs = nodes.find((n) => n["@type"] === "BreadcrumbList");
      expect(crumbs, `${path} breadcrumbs`).toBeTruthy();
      expect(same(crumbs.itemListElement.at(-1).item, url), `${path} last crumb`).toBe(true);
    }
    if (path.startsWith("/capabilities/")) {
      const service = nodes.find((n) => n["@type"] === "Service");
      expect(service?.url, path).toBe(url);
      // the schema describes the service the page shows: its name is the page's h1
      expect(html).toContain(`>${service.name.replace(/&/g, "&amp;")}</h1>`);
    }
  }
});

test("an unknown URL is a real 404, kept out of the index", async ({ request }) => {
  for (const path of ["/no-such-page", "/capabilities/no-such-service", "/work/no-such-collection"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(404);
    const robots = metas(await res.text(), "robots");
    expect(robots, path).toEqual(["noindex"]);
  }
});

test("the share image is served", async ({ request }) => {
  const res = await request.get("/opengraph-image.jpg");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/jpeg");
});
