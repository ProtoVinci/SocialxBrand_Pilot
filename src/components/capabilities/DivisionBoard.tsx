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
    <div ref={root} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,25rem)] lg:gap-16">
      {/* all 18, as chips */}
      <div className="flex flex-col gap-7" onPointerLeave={() => window.clearTimeout(intent.current)}>
        {clusters.map((c) => {
          const rows = divisions.map((x, i) => ({ x, i })).filter(({ x }) => x.cluster === c.id);
          return (
            <section key={c.id} aria-labelledby={`board-${c.id}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2">
                <h3 id={`board-${c.id}`} className="label text-ink/80">{c.name}</h3>
                <span className="label text-muted">{rows.length} {rows.length === 1 ? "division" : "divisions"}</span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-2">
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
                      className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm sm:px-3.5 sm:py-2 sm:text-[0.95rem] text-ink shadow-[0_1px_2px_rgb(28_25_23/0.04)] transition-[background-color,border-color,color,box-shadow] duration-500 ease-[var(--ease-pilot)] hover:border-line-strong data-[on]:border-blue data-[on]:bg-blue data-[on]:text-white data-[on]:shadow-[0_10px_24px_-12px_rgb(42_59_164/0.6)]"
                    >
                      <span className="label text-signal-ink transition-colors duration-500 group-data-[on]:text-white/75">{pad(x.number)}</span>
                      {x.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* the stage */}
      <div id="board-stage" className="brand-card relative max-lg:order-first overflow-hidden rounded-[26px] p-3 lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)] lg:self-start">
        <div className="flex gap-4 lg:flex-col">
          {/* the reel: stacked layers, only the active one visible; a slow dissolve with a slight settle */}
          <div aria-hidden className="relative aspect-[9/16] w-28 shrink-0 overflow-hidden rounded-[18px] bg-ink sm:w-36 lg:w-full lg:aspect-auto lg:h-[min(44svh,24rem)]">
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
            <span className="label absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-white backdrop-blur">
              {pad(d.number)} / 18
            </span>
          </div>

          {/* the words: keyed so each change re-runs a gentle rise */}
          <div key={d.slug} className="min-w-0 flex-1 animate-[stage-in_0.6s_var(--ease-pilot)_both] px-1 py-1 lg:px-2 lg:pb-2 motion-reduce:animate-none">
            <p className="label text-blue">{clusters.find((c) => c.id === d.cluster)?.name}</p>
            <p className="mt-1 font-display text-title font-medium">{d.shortName}</p>
            <p className="mt-2 line-clamp-3 text-sm text-muted">{d.whatItIs[0]}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
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
