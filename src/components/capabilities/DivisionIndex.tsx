"use client";
import Link from "next/link";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, ViewTransition } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";
import { clusters, divisions, pad } from "@/content/divisions";
import type { VideoAsset } from "@/content/work";
import { Reel, type ReelHandle } from "@/components/media/Reel";
import { RouteToggle } from "./RouteToggle";

type StageHandle = { show: (slug: string | null) => void };

/**
 * The cursor-following preview's reels. Only the shown division's reel and the one before it (so a
 * row-to-row change can cross-fade) are ever mounted; the other sixteen never exist. It owns its
 * own state, so showing a preview re-renders this stage only, never the 18 rows.
 */
const PreviewStage = forwardRef<StageHandle, { previews: Record<string, VideoAsset | undefined> }>(function PreviewStage({ previews }, handle) {
  const [active, setActive] = useState<string | null>(null);
  // newest first, at most two
  const [layers, setLayers] = useState<string[]>([]);
  const reels = useRef<Record<string, ReelHandle | null>>({});

  useImperativeHandle(handle, () => ({
    show: (slug) => {
      setActive(slug);
      if (slug) setLayers((l) => [slug, ...l.filter((s) => s !== slug)].slice(0, 2));
    },
  }), []);

  // one reel plays: the shown one
  useEffect(() => {
    Object.entries(reels.current).forEach(([k, r]) => (k === active ? r?.play() : r?.pause()));
  }, [active, layers]);

  return layers.map((slug) => {
    const asset = previews[slug];
    return asset ? (
      <div key={slug} className={`absolute inset-0 transition-opacity duration-300 ${slug === active ? "opacity-100" : "opacity-0"}`}>
        {/* 176px wide: the 360p clip is plenty and a tenth of the bytes */}
        <Reel ref={(r) => { reels.current[slug] = r; }} asset={asset} variant="preview" mode="manual" className="h-full w-full" />
      </div>
    ) : null;
  });
});

type Props = {
  /** One preview reel per division slug (if its related work has video). */
  previews: Record<string, VideoAsset | undefined>;
  headingLevel?: "h2" | "h3";
};

/**
 * The 18 divisions as an index, grouped into the four clusters of the company profile.
 * Fine pointers get a 9:16 preview that follows the cursor (quickTo, lerped); each row
 * links to its division page and carries an add-to-route toggle.
 * Hover never touches React state: the active preview is a data attribute and the row
 * nudge is CSS, so moving across 18 rows re-renders nothing.
 */
export function DivisionIndex({ previews, headingLevel = "h3" }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const stage = useRef<StageHandle>(null);
  // set while the preview is enabled (fine pointer + motion); null otherwise
  const follow = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const H = headingLevel;

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`${MQ.finePointer} and ${MQ.motion}`, () => {
      gsap.set(cursor.current, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
      follow.current = {
        // short: at 0.6s the preview trailed the pointer by far enough to read as latency
        x: gsap.quickTo(cursor.current, "x", { duration: 0.22, ease: "pilot" }),
        y: gsap.quickTo(cursor.current, "y", { duration: 0.22, ease: "pilot" }),
      };
      return () => { follow.current = null; };
    });
    return () => mm.revert();
  }, { scope: root });

  // Plain event handlers: refs are read only when an event fires, never during render.
  function move(e: React.PointerEvent) {
    if (e.pointerType === "touch" || !follow.current || !root.current) return;
    const box = root.current.getBoundingClientRect();
    follow.current.x(e.clientX - box.left);
    follow.current.y(e.clientY - box.top);
  }

  function enter(slug: string) {
    if (!follow.current) return;
    if (previews[slug]) {
      stage.current?.show(slug);
      gsap.to(cursor.current, { scale: 1, autoAlpha: 1, duration: 0.5, ease: "pilot" });
    } else {
      stage.current?.show(null);
      gsap.to(cursor.current, { scale: 0, autoAlpha: 0, duration: 0.3 });
    }
  }

  // Rows scroll under a still cursor and fire pointerenter as they pass, which made previews
  // flash by during a scroll. Only real pointer movement, held briefly on a row, counts.
  const shown = useRef<string | null>(null);
  const intent = useRef<number | undefined>(undefined);
  function intend(slug: string) {
    if (shown.current === slug) return;
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => { shown.current = slug; enter(slug); }, 120);
  }

  function leave() {
    window.clearTimeout(intent.current);
    shown.current = null;
    stage.current?.show(null);
    gsap.to(cursor.current, { scale: 0, autoAlpha: 0, duration: 0.35, ease: "snap" });
  }

  return (
    <div ref={root} className="relative" onPointerMove={move} onPointerLeave={leave}>
      <div className="flex flex-col gap-16">
        {clusters.map((c) => {
          const rows = divisions.filter((d) => d.cluster === c.id);
          return (
            <section key={c.id} aria-labelledby={`cluster-${c.id}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-current/15 pb-3">
                <H id={`cluster-${c.id}`} className="label">{c.name}</H>
                <span className="label opacity-80">{rows.length} {rows.length === 1 ? "division" : "divisions"}</span>
              </div>
              <ul>
                {rows.map((d) => (
                  <li key={d.slug} className="group relative isolate border-b border-current/15 transition-colors duration-300" onPointerMove={(e) => { if (e.pointerType !== "touch") intend(d.slug); }}>
                    {/* hover flood: the row fills with cornflower from the bottom edge */}
                    <span aria-hidden className="absolute -inset-x-3 inset-y-0 -z-10 hidden origin-bottom scale-y-0 rounded-[10px] bg-iris transition-transform duration-500 ease-[var(--ease-pilot)] group-hover:scale-y-100 [@media(hover:hover)]:block md:-inset-x-5" />
                    <Link
                      href={`/capabilities/${d.slug}`}
                      transitionTypes={["nav-forward"]}
                      className="grid grid-cols-[3.2rem_1fr] items-baseline gap-x-4 py-5 pr-28 md:grid-cols-[5rem_1fr_minmax(0,22rem)] md:py-6"
                    >
                      <span className="label text-signal-ink transition-colors duration-300 [@media(hover:hover)]:group-hover:text-ink">[ {pad(d.number)} ]</span>
                      <ViewTransition name={`division-${d.slug}`} share="morph" default="none">
                        <span
                          className="font-display text-title font-medium transition-[transform,color] duration-500 ease-[var(--ease-pilot)] md:text-[clamp(1.6rem,2.6vw,2.6rem)] [@media(hover:hover)]:group-hover:translate-x-3"
                        >
                          {d.shortName}
                        </span>
                      </ViewTransition>
                      <span className="col-start-2 mt-2 line-clamp-2 text-sm opacity-70 md:col-start-3 md:mt-0">{d.whatItIs[0]}</span>
                    </Link>
                    <RouteToggle slug={d.slug} name={d.shortName} className="absolute right-0 top-1/2 -translate-y-1/2" />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* cursor-following preview (fine pointers only) */}
      <div ref={cursor} aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 hidden aspect-[9/16] w-44 overflow-hidden rounded-xl shadow-2xl [@media(hover:hover)]:block" style={{ visibility: "hidden" }}>
        <PreviewStage ref={stage} previews={previews} />
      </div>
    </div>
  );
}
