// Builds a local, gitignored contact sheet (public/__contact/index.html) of Drive
// thumbnails grouped by category, so pieces can be curated visually before any
// original is downloaded. Each tile is labelled with a short key: <category#>-<index>.
import { readFile, mkdir, writeFile } from "node:fs/promises";

const inv = JSON.parse(await readFile(new URL("../../media-source/inventory.json", import.meta.url), "utf8"));
const MAX_PHOTOS_PER_GROUP = 36;

const groups = new Map();
for (const f of inv) {
  if (!groups.has(f.path)) groups.set(f.path, []);
  groups.get(f.path).push(f);
}

const keyed = [];
let g = 0;
let html = `<!doctype html><meta charset="utf-8"><title>contact sheet</title>
<style>body{background:#111;color:#eee;font:12px/1.3 ui-monospace,monospace;margin:16px}
h2{font-size:14px;margin:28px 0 8px;color:#ff5a4f}.row{display:flex;flex-wrap:wrap;gap:6px}
figure{margin:0;width:132px}img{width:132px;height:180px;object-fit:cover;background:#222;display:block}
figcaption{padding:2px 0}.v figcaption{color:#9f8bff}</style>`;
for (const [path, files] of groups) {
  g += 1;
  const videos = files.filter((f) => f.mime.startsWith("video"));
  const photos = files.filter((f) => f.mime.startsWith("image")).slice(0, MAX_PHOTOS_PER_GROUP);
  html += `<h2>${g}. ${path} — ${videos.length} video / ${files.length - videos.length} image</h2><div class="row">`;
  [...videos, ...photos].forEach((f, i) => {
    const key = `${g}-${i + 1}`;
    keyed.push({ key, ...f });
    const cls = f.mime.startsWith("video") ? "v" : "p";
    html += `<figure class="${cls}"><img loading="lazy" src="https://drive.google.com/thumbnail?id=${f.id}&sz=w400"><figcaption>${key} ${cls === "v" ? "▶" : ""}</figcaption></figure>`;
  });
  html += `</div>`;
}

await mkdir(new URL("../../public/__contact/", import.meta.url), { recursive: true });
await writeFile(new URL("../../public/__contact/index.html", import.meta.url), html);
await writeFile(new URL("../../media-source/contact-keys.json", import.meta.url), JSON.stringify(keyed, null, 2));
console.log(`contact sheet: ${groups.size} groups, ${keyed.length} tiles`);
