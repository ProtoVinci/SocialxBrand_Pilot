// Founder portraits for /about: the owner's originals in docs/source/founders/ (a 2628×4672 JPEG
// and a 1024×1536 PNG, 1.6–2.1MB) become matching 4:5 head-and-shoulders crops, as AVIF + WebP at
// 480 and 800px wide, in public/founders/. The crop boxes are hand-set per photo so both faces sit
// at about the same height and size.
// Run: node scripts/media/founders.mjs
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../../", import.meta.url);
const p = (rel) => fileURLToPath(new URL(rel, root));

const portraits = {
  "sanket-shedge": { file: "Sanket.jpeg", crop: { left: 0, top: 250, width: 2628, height: 3285 } },
  "sujal-pisal": { file: "Sujal.PNG", crop: { left: 190, top: 0, width: 720, height: 900 } },
};
const WIDTHS = [480, 800];

await mkdir(p("public/founders"), { recursive: true });
for (const [id, { file, crop }] of Object.entries(portraits)) {
  for (const w of WIDTHS) {
    const base = sharp(p(`docs/source/founders/${file}`)).extract(crop).resize(w, Math.round(w * 1.25));
    for (const [fmt, opts] of [["avif", { quality: 55 }], ["webp", { quality: 78 }]]) {
      const out = `public/founders/${id}-${w}.${fmt}`;
      const info = await base.clone()[fmt](opts).toFile(p(out));
      console.log(`${out} (${(info.size / 1024).toFixed(1)}KB)`);
    }
  }
}
