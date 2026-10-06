// Content integrity: the site must say exactly what the client's documents say, and nothing
// that looks like invented proof. Runs against source files, no browser needed.
import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { divisions } from "../src/content/divisions";
import { site } from "../src/content/site";

// The 18 names exactly as listed in the Services & Divisions master document (contents page).
const PDF_DIVISIONS = [
  "Digital Marketing Strategy & Consulting", "Social Media Marketing", "Social Media Management", "Content Marketing",
  "Content Creation", "Graphic Design", "Video Production", "Video Editing & Animation", "Photography",
  "Branding & Brand Identity", "Creative Advertising & Campaigns", "Performance Marketing", "Search — SEO & Local SEO",
  "WhatsApp Marketing", "Creator / Brand Growth", "YouTube & Organic Video Marketing", "Reputation, PR & Community",
  "AI Marketing & AI Automation",
];

test("all 18 divisions present, in order, with the PDF names", () => {
  expect(divisions.map((d) => d.name)).toEqual(PDF_DIVISIONS);
  divisions.forEach((d, i) => {
    expect(d.number).toBe(i + 1);
    expect(d.groups.length).toBeGreaterThan(0);
    expect(d.deliverables.length).toBeGreaterThan(0);
    expect(d.approach.length).toBeGreaterThan(3);
  });
});

test("contact details match the company profile", () => {
  expect(site.email).toBe("socialxbrandpilot@gmail.com");
  expect(site.phoneDisplay).toBe("+91 8432935877");
  expect(site.url).toBe("https://www.sxbp.com");
});

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|json)$/.test(f) && !f.endsWith(".generated.json") ? [p] : [];
  });

test("no invented-proof patterns in site source", () => {
  // Words that only appear when someone fabricates social proof. Extend, never relax.
  const banned = [
    /testimonial/i, /\bawards?\b/i, /\baward-winning\b/i, /\b\d+\+?\s*(happy\s+)?clients\b/i,
    /\b\d+\s*years?\s+(of\s+)?experience\b/i, /\btrusted by\b/i, /\b\d+(\.\d+)?\s*%\s*(growth|increase|roi)\b/i,
    /(?<!\[)\b(4|5)(\.\d)?\s*\/\s*5\b(?!\])/, /\bmumbai\b|\bpune\b|\bdelhi\b|\bbangalore\b/i,
  ];
  const offenders: string[] = [];
  // divisions.ts is the PDF service catalogue ("Testimonials" there is a content type the agency
  // produces, not a claim) and is verified name-by-name against the PDF in the first test.
  for (const file of walk("src").filter((f) => !f.replaceAll("\\", "/").endsWith("content/divisions.ts"))) {
    const text = readFileSync(file, "utf8");
    for (const re of banned) if (re.test(text)) offenders.push(`${file}: ${re}`);
  }
  expect(offenders).toEqual([]);
});
