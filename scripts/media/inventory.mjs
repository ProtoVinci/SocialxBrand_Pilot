// Crawls the public Drive portfolio folder via the lightweight embeddedfolderview
// endpoint and writes media-source/inventory.json (id, name, mime, category path).
// Drive gives every video the same filename, so the Drive id is the only stable key.
import { mkdir, writeFile } from "node:fs/promises";

// The Drive folder id is not kept in the repository: pass it in the environment, e.g.
//   SXBP_DRIVE_ROOT=<folder id> node scripts/media/inventory.mjs
const ROOT_ID = process.env.SXBP_DRIVE_ROOT;
if (!ROOT_ID) {
  console.error("Set SXBP_DRIVE_ROOT to the portfolio's Drive folder id (from the folder's share link).");
  process.exit(1);
}
const OUT = new URL("../../media-source/inventory.json", import.meta.url);

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();

async function crawl(id, path, out) {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${id}`);
  if (!res.ok) throw new Error(`folder ${id}: HTTP ${res.status}`);
  const html = await res.text();
  const chunks = html.split('<div class="flip-entry" id="entry-').slice(1);
  for (const chunk of chunks) {
    const entryId = chunk.slice(0, chunk.indexOf('"'));
    const title = decode(chunk.match(/<div class="flip-entry-title">([^<]*)<\/div>/)?.[1] ?? "");
    if (chunk.includes("https://drive.google.com/drive/folders/")) {
      await crawl(entryId, [...path, title], out);
    } else {
      const mime = chunk.match(/\/16\/type\/([^"]+)"/)?.[1] ?? "unknown";
      out.push({ id: entryId, name: title, mime, path: path.join(" / ") });
    }
  }
}

const files = [];
await crawl(ROOT_ID, [], files);
await mkdir(new URL("../../media-source/", import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(files, null, 2));
const byKind = files.reduce((acc, f) => ((acc[f.mime] = (acc[f.mime] ?? 0) + 1), acc), {});
console.log(`inventory: ${files.length} files`, byKind);
