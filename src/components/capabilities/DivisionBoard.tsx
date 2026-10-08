"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { MQ } from "@/lib/motion/tokens";
import { clusters, divisions, pad } from "@/content/divisions";
import type { VideoAsset } from "@/content/work";
import { Reel, type ReelHandle } from "@/components/media/Reel";
import { RouteToggle } from "./RouteToggle";

// reduced-motion preference as a subscription (server render assumes calm: no tour until hydrated)
const subscribe = (cb: () => void) => { const mq = window.matchMedia(MQ.reduce); mq.addEventListener("change", cb); return () => mq.removeEventListener("change", cb); };
const useCalm = () => useSyncExternalStore(subscribe, () => window.matchMedia(MQ.reduce).matches, () => true);

/** One look per cluster: a solid cobalt hero tile and three lighter textured tiles. */
const THEME = {
  "strategy-creative": {
    span: "lg:col-span-8",
    card: "bg-blue text-white",
    texture: "bg-[linear-gradient(to_right,rgb(255_255_255/.1)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/.1)_1px,transparent_1px)] bg-[size:44px_44px]",
    numeral: "text-white/[0.07]",
    label: "text-white", count: "text-white/70",
    chip: "border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 data-[on]:border-white data-[on]:bg-white data-[on]:text-ink data-[on]:shadow-[0_10px_24px_-12px_rgb(0_0_0/0.45)]",
    chipNum: "text-white/65 group-data-[on]:text-signal-ink",
  },
  "performance-search": {
    span: "lg:col-span-3",
    card: "bg-rose text-ink",
    texture: "bg-[radial-gradient(circle,rgb(176_45_28/.22)_1.1px,transparent_1.6px)] bg-[size:16px_16px]",
    numeral: "text-signal-ink/[0.08]",
    label: "text-ink/80", count: "text-ink/60",
    chip: "border-ink/10 bg-white text-ink hover:border-ink/25 data-[on]:border-blue data-[on]:bg-blue data-[on]:text-white data-[on]:shadow-[0_10px_24px_-12px_rgb(42_59_164/0.6)]",
    chipNum: "text-signal-ink group-data-[on]:text-white/75",
  },
  direct: {
    span: "lg:col-span-2",
    card: "bg-sand text-ink ring-1 ring-inset ring-line",
    texture: "",
    numeral: "text-ink/[0.06]",
    label: "text-ink/80", count: "text-ink/60",
    chip: "border-ink/10 bg-white text-ink hover:border-ink/25 data-[on]:border-blue data-[on]:bg-blue data-[on]:text-white data-[on]:shadow-[0_10px_24px_-12px_rgb(42_59_164/0.6)]",
    chipNum: "text-signal-ink group-data-[on]:text-white/75",
  },
  "growth-pr-ai": {
    span: "lg:col-span-3",
    card: "bg-periwinkle text-ink",
    texture: "bg-[repeating-radial-gradient(circle_at_100%_100%,transparent_0_34px,rgb(42_59_164/.14)_34px_35px)]",
    numeral: "text-blue/[0.08]",
    label: "text-ink/80", count: "text-ink/60",
    chip: "border-ink/10 bg-white text-ink hover:border-ink/25 data-[on]:border-blue data-[on]:bg-blue data-[on]:text-white data-[on]:shadow-[0_10px_24px_-12px_rgb(42_59_164/0.6)]",
    chipNum: "text-signal-ink group-data-[on]:text-white/75",
  },
} as const;

type Props = { previews: Record<string, VideoAsset | undefined> };

const INTENT_MS = 140;   // a pointer has to rest on a chip this long before the stage changes
const TOUR_MS = 4200;    // idle pace of the self-guided tour
const HOLD_MS = 9000;    // after a visitor picks a division, the tour waits this long

/**
 * The 18 divisions on the home page, compact: every division is a chip, grouped by cluster,
 * so all 18 fit in a few lines, beside one "stage" that presents the active division (its
 * reel, number, name and one line) with a link and the add-to-route toggle.
 *
 * Calm by design (the old per-row hover preview fired on every row that slid under a still
 * cursor while scrolling):
 *  - the stage only follows deliberate input: real pointer movement (not pointerenter, which
 *    scrolling also fires) or keyboard focus, after a short intent delay;
 *  - changes are a slow cross-dissolve with a slight settle, one reel playing at a time;
 *  - idle, it tours the divisions on its own at an unhurried pace, pausing when offscreen.
 * Reduced motion: no tour, instant swaps. No JS: chips are plain links; the stage shows #01.
 */
export function DivisionBoard({ previews }: Props) {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const reels = useRef<(ReelHandle | null)[]>([]);
  const intent = useRef<number | undefined>(undefined);
  const heldUntil = useRef(0);
  const [inView, setInView] = useState(false);
  const calm = useCalm();
  const d = divisions[active];
  // divisions without footage of their own (strategy, SEO...) borrow from the pool of real work,
  // so the stage never goes dark
  const pool = divisions.map((x) => previews[x.slug]).filter((v): v is VideoAsset => Boolean(v));
  const reelFor = (k: number) => previews[divisions[k].slug] ?? pool[k % Math.max(1, pool.length)];

  const pick = useCallback((i: number, byUser: boolean) => {
    if (byUser) heldUntil.current = Date.now() + HOLD_MS;
    setActive(i);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(root.current!);
    return () => io.disconnect();
  }, []);

  // the tour
  useEffect(() => {
    if (calm || !inView) return;
    const t = setInterval(() => {
      if (Date.now() < heldUntil.current) return;
      setActive((n) => (n + 1) % divisions.length);
    }, TOUR_MS);
    return () => clearInterval(t);
  }, [calm, inView]);

  // one reel plays: the active one, and only while the board is on screen
  useEffect(() => {
    reels.current.forEach((r, k) => (inView && !calm && k === active ? r?.play() : r?.pause()));
  }, [active, inView, calm]);

  const hover = (i: number) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => pick(i, true), INTENT_MS);
  };

  return (
    // bento (after the Elevix references): the big cobalt tile holds Strategy & Creative (11),
    // three smaller textured tiles hold the rest, and the stage spans both rows on the right
    <div ref={root} className="grid gap-3 sm:gap-4 lg:grid-cols-12" onPointerLeave={() => window.clearTimeout(intent.current)}>
      {clusters.map((c, ci) => {
        const t = THEME[c.id as keyof typeof THEME];
        const rows = divisions.map((x, i) => ({ x, i })).filter(({ x }) => x.cluster === c.id);
        return (
          <section
            key={c.id}
            aria-labelledby={`board-${c.id}`}
            className={`relative isolate overflow-hidden rounded-[26px] p-4 sm:p-5 short:p-3.5 ${t.card} ${t.span}`}
          >
            <span aria-hidden className={`absolute inset-0 -z-10 ${t.texture}`} />
            <span aria-hidden className={`pointer-events-none absolute -bottom-[0.18em] -right-[0.04em] -z-10 font-display text-[clamp(5rem,9vw,9rem)] font-medium leading-none tracking-[-0.06em] ${t.numeral}`}>{pad(ci + 1)}</span>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h3 id={`board-${c.id}`} className={`label ${t.label}`}>{c.name}</h3>
              <span className={`label ${t.count}`}>{rows.length} {rows.length === 1 ? "division" : "divisions"}</span>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2 short:mt-2">
              {rows.map(({ x, i }) => (
                <li key={x.slug}>
                  <Link
                    href={`/capabilities/${x.slug}`}
                    transitionTypes={["nav-forward"]}
                    // pointermove, not pointerenter: a chip scrolling under a still cursor changes nothing
                    onPointerMove={() => { if (active !== i) hover(i); }}
                    onFocus={() => pick(i, true)}
                    aria-describedby={i === active ? "board-stage" : undefined}
                    data-on={i === active ? "" : undefined}
                    className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-[background-color,border-color,color,box-shadow] duration-500 ease-[var(--ease-pilot)] sm:px-3.5 sm:text-[0.92rem] short:py-1 short:text-[0.85rem] ${t.chip}`}
                  >
                    <span className={`label transition-colors duration-500 ${t.chipNum}`}>{pad(x.number)}</span>
                    {x.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* the stage */}
      <div id="board-stage" className="brand-card relative max-lg:order-first overflow-hidden rounded-[26px] p-3 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:self-stretch">
        <div className="flex gap-4 lg:flex-col">
          {/* the reel: stacked layers, only the active one visible; a slow dissolve with a slight settle */}
          <div aria-hidden className="relative aspect-[9/16] w-28 shrink-0 overflow-hidden rounded-[18px] bg-ink sm:w-36 lg:w-full lg:aspect-auto lg:h-[clamp(11rem,32svh,20rem)] short:h-[26svh]">
            {divisions.map((x, k) => {
              const asset = reelFor(k);
              const on = k === active;
              return asset ? (
                <div
                  key={x.slug}
                  className={`absolute inset-0 transition-[opacity,scale,filter] ease-[var(--ease-pilot)] motion-reduce:duration-0 ${on ? "scale-100 opacity-100 blur-0 duration-[900ms]" : "scale-[1.04] opacity-0 blur-[3px] duration-[700ms]"}`}
                >
                  <Reel ref={(r) => { reels.current[k] = r; }} asset={asset} mode="manual" className="h-full w-full" />
                </div>
              ) : null;
            })}
            <span key={d.slug} className="absolute bottom-3 left-3 right-3 hidden flex-col items-start gap-1.5 lg:flex">
              {d.groups.slice(0, 2).map((g, k) => (
                <span key={g.title} style={{ animationDelay: `${0.15 + k * 0.12}s` }} className="max-w-full truncate rounded-[10px] bg-white/92 px-3 py-1.5 text-[0.8rem] font-medium text-ink shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)] animate-[stage-in_0.6s_var(--ease-pilot)_both] motion-reduce:animate-none">{g.title}</span>
              ))}
            </span>
            <span className="label absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-white backdrop-blur">
              {pad(d.number)} / 18
            </span>
          </div>

          {/* the words: keyed so each change re-runs a gentle rise */}
          <div key={d.slug} className="min-w-0 flex-1 animate-[stage-in_0.6s_var(--ease-pilot)_both] px-1 py-1 lg:px-2 lg:pb-2 motion-reduce:animate-none">
            <p className="label text-blue">{clusters.find((c) => c.id === d.cluster)?.name}</p>
            {/* fixed text boxes: the tour must never change the stage height, or everything below
                (and every pinned scroll scene) would jump on each step */}
            <p className="mt-1 line-clamp-2 min-h-[2.3em] font-display text-title font-medium">{d.shortName}</p>
            <p className="mt-2 line-clamp-3 min-h-[4.5em] text-sm leading-normal text-muted short:line-clamp-2 short:min-h-[3em]">{d.whatItIs[0]}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link href={`/capabilities/${d.slug}`} transitionTypes={["nav-forward"]} className="inline-flex items-center gap-2 rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cta-hover">
                Explore <span aria-hidden>→</span>
              </Link>
              <RouteToggle slug={d.slug} name={d.shortName} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
