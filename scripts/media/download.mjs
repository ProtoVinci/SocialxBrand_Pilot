// Downloads the curated originals listed in selection.json into media-source/raw/.
// 1) probes every file's size with a 1-byte ranged request (curl -r 0-0) and aborts
//    if the total exceeds the budget; 2) downloads with resume + retry, 3 at a time.
// Files are named by Drive id: every Drive video reports the same filename.
import { readFile, mkdir, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const base = new URL("../../media-source/", import.meta.url);
const BUDGET_BYTES = 1.8 * 1024 ** 3;
const PROBE_ONLY = process.argv.includes("--probe");

const keyed = JSON.parse(await readFile(new URL("contact-keys.json", base), "utf8"));
const byKey = new Map(keyed.map((k) => [k.key, k]));
const selection = JSON.parse(await readFile(new URL("../../scripts/media/selection.json", import.meta.url), "utf8"));

const items = [];
for (const [slug, { videos, photos }] of Object.entries(selection.screenings)) {
  for (const key of [...videos, ...photos]) {
    const k = byKey.get(key);
    if (!k) throw new Error(`unknown key ${key}`);
    items.push({ ...k, screening: slug });
  }
}

const url = (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

async function probe(item) {
  const { stdout } = await run("curl.exe", ["-s", "-L", "-r", "0-0", "-D", "-", "-o", "NUL", url(item.id)], { maxBuffer: 1 << 20 });
  const range = stdout.match(/content-range:\s*bytes 0-0\/(\d+)/i);
  const type = [...stdout.matchAll(/content-type:\s*([^\r\n;]+)/gi)].at(-1)?.[1] ?? "";
  return { size: range ? Number(range[1]) : null, type };
}

async function pool(list, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < list.length) {
      const item = list[i++];
      await fn(item);
    }
  }));
}

await pool(items, 4, async (item) => Object.assign(item, await probe(item)));
const unknown = items.filter((i) => !i.size || i.type.includes("text/html"));
const total = items.reduce((s, i) => s + (i.size ?? 0), 0);
console.log(`probed ${items.length} files, total ${(total / 1024 ** 2).toFixed(0)} MB, unresolved ${unknown.length}`);
unknown.forEach((u) => console.log(`  unresolved ${u.key} ${u.id} (${u.type})`));
await mkdir(new URL("raw/", base), { recursive: true });
await writeFile(new URL("download-plan.json", base), JSON.stringify(items, null, 2));
if (total > BUDGET_BYTES) {
  console.error(`total exceeds budget (${(BUDGET_BYTES / 1024 ** 3).toFixed(1)} GB) — trim selection.json`);
  process.exit(1);
}
if (PROBE_ONLY) process.exit(0);

let done = 0;
await pool(items.filter((i) => i.size), 3, async (item) => {
  const out = fileURLToPath(new URL(`raw/${item.id}`, base));
  const have = await stat(out).then((s) => s.size, () => 0);
  if (have !== item.size) {
    await run("curl.exe", ["-s", "-L", "--fail", "--retry", "5", "--retry-delay", "3", "-C", "-", "-o", out, url(item.id)], { maxBuffer: 1 << 20 });
  }
  const got = (await stat(out)).size;
  done += 1;
  console.log(`[${done}] ${item.key} ${item.screening} ${(got / 1024 ** 2).toFixed(1)} MB${got === item.size ? "" : " SIZE MISMATCH"}`);
});
