// Turns downloaded originals into web media + a typed manifest.
//   videos → 8s muted loop: AV1 WebM (primary) + H.264 MP4 (fallback), 360p preview, poster
//   photos → AVIF + WebP at responsive widths + 16px LQIP
// Never upscales. Loop start skips leading black frames (many reels fade in from black).
// Output: public/media/**, src/content/media.generated.json
import { readFile, mkdir, writeFile, access, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const run = promisify(execFile);
const root = new URL("../../", import.meta.url);
const p = (rel) => fileURLToPath(new URL(rel, root));
const exists = (f) => access(f).then(() => true, () => false);
const FORCE = process.argv.includes("--force");

const plan = JSON.parse(await readFile(p("media-source/download-plan.json"), "utf8"));
const LOOP_SECONDS = 8;
// Sources filmed sideways with no rotation metadata (their Drive thumbnails are sideways too).
const ROTATE = { "30-8": "transpose=2", "32-2": "transpose=2" };
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const PHOTO_WIDTHS = [480, 960, 1600];

async function probe(file) {
  const { stdout } = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=width,height:stream_side_data=rotation:format=duration", "-of", "json", file]);
  const j = JSON.parse(stdout);
  const s = j.streams[0];
  const rot = Math.abs(Number(s.side_data_list?.find((d) => "rotation" in d)?.rotation ?? 0));
  const [w, h] = rot === 90 || rot === 270 ? [s.height, s.width] : [s.width, s.height];
  return { w, h, duration: Number(j.format.duration) };
}

async function firstVisibleSecond(file) {
  // blackdetect over the first 6 seconds; start after the opening black run if there is one
  const { stderr } = await run("ffmpeg", ["-hide_banner", "-t", "6", "-i", file, "-vf",
    "blackdetect=d=0.2:pix_th=0.12", "-an", "-f", "null", "-"], { maxBuffer: 1 << 24 });
  const m = stderr.match(/black_start:0(?:\.0+)?\s+black_end:([\d.]+)/);
  return m ? Number(m[1]) + 0.3 : 0.5;
}

const even = (n) => Math.max(2, Math.round(n / 2) * 2);

async function video(item, index) {
  const src = p(`media-source/raw/${item.id}`);
  if (!(await exists(src))) return null;
  const name = `${item.screening}-${String(index).padStart(2, "0")}`;
  const outDir = p(`public/media/v/`);
  await mkdir(outDir, { recursive: true });
  const probed = await probe(src);
  const turn = ROTATE[item.key];
  const { duration } = probed;
  const [w, h] = turn ? [probed.h, probed.w] : [probed.w, probed.h];
  const portrait = h >= w;
  // target long edge 1280 (720p class), never upscale
  const scale = Math.min(1, 1280 / Math.max(w, h));
  const tw = even(w * scale), th = even(h * scale);
  const start = Math.min(await firstVisibleSecond(src), Math.max(0, duration - LOOP_SECONDS));
  const len = Math.min(LOOP_SECONDS, duration - start);
  const pre = turn ? `${turn},` : "";
  const vf = `${pre}fps=30,scale=${tw}:${th}:flags=lanczos,format=yuv420p`;
  const files = {
    webm: `${outDir}${name}.webm`, mp4: `${outDir}${name}.mp4`,
    preview: `${outDir}${name}-preview.mp4`, poster: `${outDir}${name}-poster.jpg`,
  };
  const common = ["-hide_banner", "-y", "-ss", String(start), "-t", String(len), "-i", src, "-an", "-map_metadata", "-1"];
  const force = FORCE || Boolean(ONLY?.includes(item.key));
  if (force || !(await exists(files.mp4))) {
    await run("ffmpeg", [...common, "-vf", vf, "-c:v", "libx264", "-preset", "slow", "-crf", "24",
      "-profile:v", "high", "-pix_fmt", "yuv420p", "-g", "60", "-maxrate", "2.4M", "-bufsize", "4.8M",
      "-movflags", "+faststart", files.mp4]);
  }
  if (force || !(await exists(files.webm))) {
    // mbr caps grainy sources, where capped CRF would otherwise balloon past the H.264 file
    await run("ffmpeg", [...common, "-vf", vf, "-c:v", "libsvtav1", "-preset", "6", "-crf", "36",
      "-svtav1-params", "mbr=1600", "-g", "60", "-pix_fmt", "yuv420p", files.webm]);
  }
  // AV1 only earns its place when it is meaningfully smaller than the universal MP4
  const [webmSize, mp4Size] = await Promise.all([stat(files.webm), stat(files.mp4)]).then((s) => s.map((x) => x.size));
  const useWebm = webmSize < mp4Size * 0.9;
  if (force || !(await exists(files.preview))) {
    await run("ffmpeg", [...common, "-vf", `${pre}fps=24,scale=-2:${portrait ? 360 : 240},format=yuv420p`,
      "-c:v", "libx264", "-preset", "slow", "-crf", "30", "-movflags", "+faststart", files.preview]);
  }
  if (force || !(await exists(files.poster))) {
    await run("ffmpeg", ["-hide_banner", "-y", "-ss", String(start + Math.min(1.2, len / 3)), "-i", src,
      "-frames:v", "1", "-vf", `${pre}scale=${tw}:${th}:flags=lanczos`, "-q:v", "3", files.poster]);
  }
  const posterBase = `${outDir}${name}-poster`;
  await sharp(files.poster).avif({ quality: 50, effort: 4 }).toFile(`${posterBase}.avif`);
  await sharp(files.poster).webp({ quality: 72 }).toFile(`${posterBase}.webp`);
  const lqip = await sharp(files.poster).resize(16).webp({ quality: 40 }).toBuffer();
  return {
    id: name, kind: "video", screening: item.screening, driveId: item.id,
    width: tw, height: th, orientation: portrait ? "portrait" : "landscape", seconds: Number(len.toFixed(2)),
    src: { webm: useWebm ? `/media/v/${name}.webm` : null, mp4: `/media/v/${name}.mp4`, preview: `/media/v/${name}-preview.mp4` },
    bytes: useWebm ? webmSize : mp4Size,
    poster: { avif: `${posterBase.replace(p("public"), "").replaceAll("\\", "/")}.avif`, webp: `${posterBase.replace(p("public"), "").replaceAll("\\", "/")}.webp` },
    lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
  };
}

async function photo(item, index) {
  const src = p(`media-source/raw/${item.id}`);
  if (!(await exists(src))) return null;
  const name = `${item.screening}-${String(index).padStart(2, "0")}`;
  const outDir = p(`public/media/p/`);
  await mkdir(outDir, { recursive: true });
  const img = sharp(src).rotate();
  const meta = await img.metadata();
  const oriented = meta.orientation && meta.orientation >= 5 ? { w: meta.height, h: meta.width } : { w: meta.width, h: meta.height };
  const widths = PHOTO_WIDTHS.filter((w) => w < oriented.w).concat(Math.min(oriented.w, 1600)).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  const srcset = { avif: [], webp: [] };
  for (const w of widths) {
    const avif = `${outDir}${name}-${w}.avif`, webp = `${outDir}${name}-${w}.webp`;
    if (FORCE || !(await exists(avif))) await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).avif({ quality: 50, effort: 4 }).toFile(avif);
    if (FORCE || !(await exists(webp))) await sharp(src).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(webp);
    srcset.avif.push({ w, url: `/media/p/${name}-${w}.avif` });
    srcset.webp.push({ w, url: `/media/p/${name}-${w}.webp` });
  }
  const lqip = await sharp(src).rotate().resize(16).webp({ quality: 40 }).toBuffer();
  return {
    id: name, kind: "photo", screening: item.screening, driveId: item.id,
    width: oriented.w, height: oriented.h, orientation: oriented.h >= oriented.w ? "portrait" : "landscape",
    srcset, lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
  };
}

const counters = {};
const out = [];
const failures = [];
for (const item of plan) {
  counters[item.screening] = (counters[item.screening] ?? 0) + 1;
  const idx = counters[item.screening];
  try {
    const r = item.mime.startsWith("video") ? await video(item, idx) : await photo(item, idx);
    if (r) { out.push(r); console.log(`ok   ${r.id} ${r.width}x${r.height}`); }
    else console.log(`skip ${item.key} (not downloaded)`);
  } catch (e) {
    failures.push(item.key);
    console.log(`FAIL ${item.key}: ${String(e.message).split("\n")[0]}`);
  }
}
await writeFile(p("src/content/media.generated.json"), JSON.stringify(out, null, 2));
console.log(`manifest: ${out.length} assets, failures: ${failures.join(", ") || "none"}`);
