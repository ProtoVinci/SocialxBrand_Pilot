// Regenerates every README asset from a running build (production on :3100 by default; set QA_BASE):
//   banner.png         built from the real logo paths, palette, Inter and real work stills
//   *.jpg              section screenshots (desktop 1440x900) and phone screenshots (390x844)
//   hero.webp          animated: the hero capsules playing and rolling to the next clip
//   node scripts/readme/capture.mjs
// Animated frames are page screenshots joined by sharp, so no ffmpeg is needed.
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import sharp from "sharp";

const base = process.env.QA_BASE ?? "http://localhost:3100";
const out = "docs/assets/readme";
await mkdir(out, { recursive: true });
const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});

// ── banner ─────────────────────────────────────────────────────────
{
  const paths = await readFile("src/components/brand/mark-paths.ts", "utf8");
  const grab = (name) => paths.match(new RegExp(`${name}\\s*=\\s*\\n?\\s*"([^"]+)"`))[1];
  const RIBBON = grab("RIBBON"), TRIANGLE = grab("TRIANGLE");
  // inlined: a setContent page may not load file:// resources
  const b64 = async (f) => (await readFile(f)).toString("base64");
  const inter = `data:font/woff2;base64,${await b64("node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2")}`;
  const stills = {};
  for (const id of ["restaurant-hospitality-01", "wedding-films-05", "brand-films-01"]) stills[id] = `data:image/webp;base64,${await b64(`public/media/v/${id}-poster.webp`)}`;
  const still = (id) => stills[id];
  const html = `<!doctype html><meta charset="utf-8"><style>
    @font-face { font-family: Inter; src: url(${inter}) format("woff2"); font-weight: 100 900; }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1600px; height: 520px; font-family: Inter; letter-spacing: -0.015em; color: #181614; overflow: hidden;
      background: radial-gradient(ellipse 60% 70% at 18% 0%, rgb(217 65 46 / .07), transparent 70%),
                  radial-gradient(ellipse 50% 60% at 95% 30%, rgb(42 59 164 / .07), transparent 65%),
                  linear-gradient(to right, rgb(28 25 23 / .045) 1px, transparent 1px) 0 0 / 36px 36px,
                  linear-gradient(to bottom, rgb(28 25 23 / .045) 1px, transparent 1px) 0 0 / 36px 36px, #faf8f5; }
    .wrap { position: absolute; left: 96px; top: 92px; }
    .row { display: flex; align-items: center; gap: 22px; }
    .word { font-size: 64px; font-weight: 600; letter-spacing: -0.04em; }
    .word b { color: #2a3ba4; font-weight: 600; } .word i { font-style: normal; color: #d9412e; }
    h1 { margin-top: 34px; font-size: 92px; line-height: 1.02; font-weight: 500; letter-spacing: -0.05em; }
    h1 span { color: #d9412e; font-weight: 400; }
    p { margin-top: 26px; font-size: 22px; color: #6b665f; }
    .pills { position: absolute; right: 90px; top: 70px; width: 470px; height: 380px; }
    .pill { position: absolute; border-radius: 30px; overflow: hidden; box-shadow: 0 30px 60px -24px rgb(28 25 23 / .45); outline: 1px solid rgb(28 25 23 / .1); }
    .pill img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 28%; display: block; }
  </style><body>
    <div class="wrap">
      <div class="row">
        <svg viewBox="0 0 362 534" width="46" fill="#d9412e"><path d="${RIBBON}"/><path d="${RIBBON}" transform="translate(0 186)"/><path d="${TRIANGLE}"/></svg>
        <div class="word"><b>SOCIAL</b>x<i>BRAND PILOT</i></div>
      </div>
      <h1>We will show,<br><span>you will grow.</span></h1>
      <p>The motion-led website for an Indian digital marketing agency.</p>
    </div>
    <div class="pills">
      <div class="pill" style="left:0;top:40px;width:210px;height:300px;rotate:-6deg"><img src="${still("restaurant-hospitality-01")}"></div>
      <div class="pill" style="left:150px;top:0;width:230px;height:350px;z-index:2"><img src="${still("wedding-films-05")}"></div>
      <div class="pill" style="left:300px;top:50px;width:190px;height:290px;rotate:6deg"><img src="${still("brand-films-01")}"></div>
    </div>
  </body>`;
  const p = await browser.newPage({ viewport: { width: 1600, height: 520 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/banner.png` });
  await p.close();
  console.log("banner.png");
}

// ── screenshots ────────────────────────────────────────────────────
// a repeat visit: no one-off intro curtain, so every shot starts from the settled page
const page = async (vp) => {
  const p = await browser.newPage({ viewport: { width: vp[0], height: vp[1] } });
  await p.addInitScript(() => sessionStorage.setItem("sxbp.intro", "1"));
  return p;
};
const shoot = async (file, { url = "/", vp = [1440, 900], at, settle = 1800 } = {}) => {
  const p = await page(vp);
  await p.goto(base + url, { waitUntil: "load" });
  await p.waitForTimeout(1500);
  if (at) {
    // walk down to the section, so the reveals on the way have played as they would for a visitor
    await p.evaluate(async (sel) => {
      const el = document.querySelector(sel).closest("section") ?? document.querySelector(sel);
      const y = el.getBoundingClientRect().top + scrollY - 40;
      for (let t = 0; t < y; t += 300) { scrollTo(0, t); await new Promise((r) => setTimeout(r, 60)); }
      scrollTo(0, y);
    }, at);
  }
  await p.waitForTimeout(settle);
  await p.screenshot({ path: `${out}/${file}`, type: "jpeg", quality: 80 });
  await p.close();
  console.log(file);
};
await shoot("hero.jpg");
await shoot("selected-work.jpg", { at: "#selected-work-title" });
await shoot("services.jpg", { at: "#services-title" });
await shoot("process.jpg", { at: "#process-title" });
await shoot("feedback.jpg", { at: "#feedback-title" });
await shoot("work-index.jpg", { url: "/work" });
await shoot("service.jpg", { url: "/capabilities/social-media-marketing" });
await shoot("about.jpg", { url: "/about", at: "#founders-title" });
await shoot("contact.jpg", { url: "/route" });
await shoot("phone-hero.jpg", { vp: [390, 844] });
await shoot("phone-services.jpg", { vp: [390, 844], at: "#services-title" });
await shoot("phone-work.jpg", { vp: [390, 844], at: "#selected-work-title" });

// ── animated hero (screenshots joined into a small looping WebP) ──
{
  const p = await page([1440, 900]);
  await p.goto(base + "/", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const frames = [];
  const every = 120; // ms between frames; the delay below plays them back at the same pace
  for (let k = 0; k < 50; k++) {
    const t = Date.now();
    frames.push(await sharp(await p.screenshot({ type: "png" })).resize(960).png().toBuffer());
    await p.waitForTimeout(Math.max(0, every - (Date.now() - t)));
  }
  await p.close();
  const info = await sharp(frames, { join: { animated: true } })
    .webp({ quality: 55, effort: 6, loop: 0, delay: frames.map(() => every) })
    .toFile(`${out}/hero.webp`);
  console.log(`hero.webp (${Math.round(info.size / 1024)}KB)`);
}
await browser.close();
