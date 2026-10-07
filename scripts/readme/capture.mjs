// Regenerates every README asset from the running site (dev server on :3100):
//   banner.png         built from the real logo paths, palette, Inter and real work stills
//   *.jpg              section screenshots (desktop 1440x900) and phone screenshots (390x844)
//   hero.webp          animated: the always-playing capsules, then the capsule-to-fullscreen morph
//   work.webp          animated: the endlessly looping work panel
//   node scripts/readme/capture.mjs
import { chromium } from "playwright";
import { mkdir, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";

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
const hideDevBadge = (p) => p.addInitScript(() => addEventListener("DOMContentLoaded", () => {
  const st = document.createElement("style"); st.textContent = "nextjs-portal{display:none!important}"; document.head.append(st);
}));
const shoot = async (file, { url = "/", vp = [1440, 900], at, settle = 1600 } = {}) => {
  const p = await browser.newPage({ viewport: { width: vp[0], height: vp[1] } });
  await hideDevBadge(p);
  await p.goto(base + url, { waitUntil: "networkidle" });
  await p.waitForTimeout(2600); // intro choreography
  if (at) await p.evaluate((sel) => { const el = document.querySelector(sel); (el.closest("section") ?? el).scrollIntoView({ block: "start" }); }, at);
  await p.waitForTimeout(settle);
  await p.screenshot({ path: `${out}/${file}`, type: "jpeg", quality: 82 });
  await p.close();
  console.log(file);
};
await shoot("hero.jpg");
await shoot("work.jpg", { at: "#work" });
await shoot("capabilities.jpg", { at: "#capabilities-title" });
await shoot("method.jpg", { at: "#method-title", settle: 2400 });
await shoot("ladder.jpg", { at: "#ladder-title" });
await shoot("work-index.jpg", { url: "/work" });
await shoot("division.jpg", { url: "/capabilities/social-media-marketing" });
await shoot("route.jpg", { url: "/route" });
await shoot("phone-hero.jpg", { vp: [390, 844] });
await shoot("phone-capabilities.jpg", { vp: [390, 844], at: "#capabilities-title" });
await shoot("phone-work.jpg", { vp: [390, 844], at: "#work" });

// ── animated clips (recorded, then encoded to small looping WebP) ──
const clip = async (file, act, { vp = [1440, 900], fps = 14, width = 960 } = {}) => {
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, recordVideo: { dir: `${out}/_rec`, size: { width: vp[0], height: vp[1] } } });
  const p = await ctx.newPage();
  await hideDevBadge(p);
  await p.goto(base + "/", { waitUntil: "networkidle" });
  const t0 = Date.now();
  const startAt = await act(p);
  const video = p.video();
  await ctx.close();
  const src = await video.path();
  const ss = Math.max(0, (startAt - t0) / 1000);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", ss.toFixed(2), "-i", src, "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`,
    "-c:v", "libwebp_anim", "-lossless", "0", "-q:v", "62", "-compression_level", "6", "-loop", "0", `${out}/${file}`]);
  console.log(file);
};
// hero: let the capsules play and roll over, then scroll so the top capsule morphs to full screen
await clip("hero.webp", async (p) => {
  await p.waitForTimeout(2400);
  const start = Date.now();
  await p.waitForTimeout(4600);
  for (let k = 0; k < 26; k++) { await p.mouse.wheel(0, 70); await p.waitForTimeout(70); }
  await p.waitForTimeout(1600);
  return start;
});
// work panel: park it on screen and let the loops run with no input
await clip("work.webp", async (p) => {
  await p.waitForTimeout(1500);
  await p.evaluate(() => { const el = document.querySelector("#work [data-track]").parentElement.parentElement; const r = el.getBoundingClientRect(); window.scrollBy(0, r.top + r.height / 2 - innerHeight / 2); });
  await p.waitForTimeout(1500);
  const start = Date.now();
  await p.waitForTimeout(5000);
  return start;
});
await rm(`${out}/_rec`, { recursive: true, force: true });
await browser.close();
