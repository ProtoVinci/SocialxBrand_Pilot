// Curation aid: fetches small Drive thumbnails for every contact-sheet tile and
// composes labelled mosaics (media-source/mosaic-N.jpg) that can be reviewed as images.
import { readFile, mkdir, writeFile, access } from "node:fs/promises";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const base = new URL("../../media-source/", import.meta.url);
const keyed = JSON.parse(await readFile(new URL("contact-keys.json", base), "utf8"));
await mkdir(new URL("thumbs/", base), { recursive: true });

const TW = 120, TH = 200, LABEL = 18, COLS = 10, ROWS = 6;
const exists = (u) => access(u).then(() => true, () => false);

async function thumb(item) {
  const file = new URL(`thumbs/${item.key}.jpg`, base);
  if (!(await exists(file))) {
    const res = await fetch(`https://drive.google.com/thumbnail?id=${item.id}&sz=w240`);
    if (!res.ok) return null;
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
  }
  try {
    return await sharp(fileURLToPath(file)).resize(TW, TH, { fit: "cover" }).jpeg().toBuffer();
  } catch {
    return null;
  }
}

// small concurrency pool so Drive isn't hammered
const tiles = new Array(keyed.length);
let next = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (next < keyed.length) {
    const i = next++;
    tiles[i] = await thumb(keyed[i]);
  }
}));

const perSheet = COLS * ROWS;
for (let s = 0; s * perSheet < keyed.length; s++) {
  const slice = keyed.slice(s * perSheet, (s + 1) * perSheet);
  const composites = [];
  slice.forEach((item, i) => {
    const x = (i % COLS) * TW, y = Math.floor(i / COLS) * (TH + LABEL);
    const buf = tiles[s * perSheet + i];
    if (buf) composites.push({ input: buf, left: x, top: y });
    const video = item.mime.startsWith("video");
    const svg = `<svg width="${TW}" height="${LABEL}"><rect width="100%" height="100%" fill="${video ? "#2a1f55" : "#222"}"/><text x="4" y="13" font-family="monospace" font-size="12" fill="#fff">${item.key}${video ? " [V]" : ""}</text></svg>`;
    composites.push({ input: Buffer.from(svg), left: x, top: y + TH });
  });
  const out = new URL(`mosaic-${s + 1}.jpg`, base);
  await sharp({ create: { width: COLS * TW, height: ROWS * (TH + LABEL), channels: 3, background: "#111" } })
    .composite(composites).jpeg({ quality: 80 }).toFile(fileURLToPath(out));
  console.log(`wrote mosaic-${s + 1}.jpg (${slice[0].key} .. ${slice.at(-1).key})`);
}
