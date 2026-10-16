"use client";
import Link from "next/link";
import { useRef, useState, ViewTransition } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Flip } from "@/lib/gsap-flip";
import { MQ, dur } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import { Photo } from "@/components/media/Photo";
import type { MediaAsset, Screening } from "@/content/work";
import { categoryLine } from "@/lib/category-line";

export type Family = "all" | "motion" | "photo" | "design";
export type IndexItem = { screening: Screening; cover: MediaAsset; family: Exclude<Family, "all"> };

const FILTERS: { id: Family; label: string }[] = [
  { id: "all", label: "All work" },
  { id: "motion", label: "Reels & films" },
  { id: "photo", label: "Photography" },
  { id: "design", label: "Design & identity" },
];

// Rhythm: widths cycle so the grid never reads as identical rectangles.
const SPANS = ["md:col-span-4", "md:col-span-3", "md:col-span-5", "md:col-span-3", "md:col-span-4", "md:col-span-5"];

/** /work index: filter by format; tiles reflow with Flip (state change explained by motion). */
export function WorkIndex({ items }: { items: IndexItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Family>("all");
  const { contextSafe } = useGSAP({ scope: root });

  const choose = contextSafe((f: Family) => {
    if (f === filter) return;
    const reduce = window.matchMedia(MQ.reduce).matches;
    const state = reduce ? null : Flip.getState("[data-tile]");
    setFilter(f);
    requestAnimationFrame(() => {
      if (!state) return;
      Flip.from(state, {
        duration: dur.slow, ease: "pilot", absolute: true, stagger: 0.03, scale: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: dur.base }),
        onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.92, duration: dur.quick }),
      });
    });
  });

  const visible = items.filter((i) => filter === "all" || i.family === filter);

  return (
    <div ref={root}>
      <div role="group" aria-label="Filter work by format" className="gutter flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => choose(f.id)}
            className={`rounded-full border px-5 py-2.5 text-sm transition-colors duration-300 ${filter === f.id ? "border-blue bg-blue text-white" : "border-ink/20 hover:border-ink"}`}
          >
            {f.label}
            <span className="label ml-2 opacity-85">{f.id === "all" ? items.length : items.filter((i) => i.family === f.id).length}</span>
          </button>
        ))}
      </div>

      <ul className="gutter mt-12 grid grid-cols-2 items-start gap-x-5 gap-y-14 md:grid-cols-12" aria-live="polite">
        {visible.map((item, i) => {
          const { screening, cover } = item;
          const span = SPANS[i % SPANS.length];
          // narrow tiles keep the native 9:16; wide tiles crop to 4:5 so no tile towers over the row
          const tall = cover.orientation === "portrait" && !span.endsWith("5");
          return (
            <li key={screening.slug} data-tile data-flip-id={screening.slug} className={`${span} ${i % 3 === 1 ? "md:mt-24" : ""}`}>
              <Link href={`/work/${screening.slug}`} transitionTypes={["nav-forward"]} data-cursor="View" className="group block">
                <ViewTransition name={`screening-${screening.slug}`} share="morph" default="none">
                  <div className={`overflow-hidden rounded-[16px] ${tall ? "aspect-[9/16]" : "aspect-[4/5]"}`}>
                    {cover.kind === "video" ? (
                      <Reel asset={cover} mode="hover" label={`${screening.title} preview`} className="h-full w-full transition-transform duration-[1.2s] ease-[var(--ease-pilot)] group-hover:scale-[1.04]" />
                    ) : (
                      <Photo asset={cover} alt={`${screening.title} — ${screening.format}`} sizes="(min-width: 768px) 33vw, 50vw" className="h-full w-full" imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-pilot)] group-hover:scale-[1.06]" />
                    )}
                  </div>
                </ViewTransition>
                {/* a plain title, what kind of work it is, and the way in (the piece count was not a
                    reason to open a project, so it no longer leads the card) */}
                <span className="mt-4 block font-display text-title font-medium transition-colors group-hover:text-signal">{screening.title}</span>
                <span className="mt-1 block text-sm text-ink/65">{categoryLine(screening)}</span>
                <span className="label mt-3 inline-block text-blue">View project <span aria-hidden>→</span></span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
