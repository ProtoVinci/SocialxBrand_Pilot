// Client logos for the feedback cards: the owner's originals in docs/source/feedback-logos/
// (1080px JPEGs, up to 171KB) become 168px WebP squares (3× the 56px slot) in public/clients/,
// named by feedback id so src/content/feedback.ts can reference them. Square crop from the
// centre; the card shows them as a circle.
// Run: node scripts/media/feedback-logos.mjs
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../../", import.meta.url);
const p = (rel) => fileURLToPath(new URL(rel, root));

// feedback id → the owner's file name (as supplied; "Sabdesh" is Sandesh Caterers)
const logos = {
  "24-benne-tribe": "Benne_Tribe.jpg",
  "celebration-cakes-bakery": "Celebration.jpg",
  "coastal-tawa-bhiwandi": "Coastal.jpg",
  "cool-goti-soda": "Cool_Goti.jpg",
  "firdosh-marbel-arts": "Firdos.jpg",
  "the-local-katta": "Local Katta.jpg",
  "sandesh-caterers": "Sabdesh.jpg",
  "thet-tumchya-gharatun": "Thet_Tumchya.jpg",
};

await mkdir(p("public/clients"), { recursive: true });
for (const [id, file] of Object.entries(logos)) {
  const out = `public/clients/${id}.webp`;
  const info = await sharp(p(`docs/source/feedback-logos/${file}`))
    .resize(168, 168, { fit: "cover" })
    .webp({ quality: 82 })
    .toFile(p(out));
  console.log(`${file} → ${out} (${(info.size / 1024).toFixed(1)}KB)`);
}
