"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import type { Screening, VideoAsset } from "@/content/work";
import { partnerCredit } from "@/content/work";
import { pad } from "@/content/divisions";

type Item = { screening: Screening; reel: VideoAsset };

/**
 * ACT 4 — Screenings. The real work, framed the way it was made: vertical.
 * Desktop: the section pins and the track runs horizontally (containerAnimation); each
 * frame grows toward the centre as it passes, so there is always one "now playing".
 * Mobile/reduced: a native swipe rail with scroll-snap. No pin, no hijack.
 */
export function Screenings({ items }: { items: Item[] }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.cinema, () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth;
      const scroll = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      gsap.utils.toArray<HTMLElement>("[data-frame]", t).forEach((frame) => {
        gsap.fromTo(
          frame,
          { scale: 0.86, autoAlpha: 0.55 },
          {
            scale: 1, autoAlpha: 1, ease: "none",
            scrollTrigger: { trigger: frame, containerAnimation: scroll, start: "left 85%", end: "center 55%", scrub: true },
          },
        );
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="screenings-title" className="relative overflow-hidden bg-shell py-24 cinema:flex cinema:h-svh cinema:flex-col cinema:justify-center cinema:py-0">
      <div className="gutter flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-muted">[ 03 ] Screenings — real work</p>
          <SplitReveal as="h2" id="screenings-title" className="mt-4 font-display text-headline font-semibold [font-stretch:82%]">
            Made to be <span className="serif-accent font-normal">watched</span>, not just posted.
          </SplitReveal>
        </div>
        <p className="label max-w-xs text-muted">{partnerCredit}</p>
      </div>

      <ol
        ref={track}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-4 [scrollbar-width:none] cinema:mt-12 cinema:w-max cinema:snap-none cinema:overflow-visible cinema:pr-[30vw]"
      >
        {items.map(({ screening, reel }, i) => (
          <li key={screening.slug} data-frame className="w-[62vw] shrink-0 snap-center sm:w-[42vw] md:w-[min(22vw,40svh)]">
            <Link href={`/work/${screening.slug}`} transitionTypes={["nav-forward"]} data-cursor="Watch" className="group block">
              {/* hover: the card lifts and tips like a sticker being picked up (alternating sides) */}
              <Reel asset={reel} eager label={`${screening.title} — ${screening.format}`} className={`aspect-[9/16] w-full rounded-[18px] shadow-[0_24px_50px_-28px_rgba(80,40,150,0.55)] transition-[rotate,scale,border-radius] duration-500 ease-[var(--ease-pilot)] group-hover:scale-[1.03] group-hover:rounded-[10px] ${i % 2 ? "group-hover:-rotate-2" : "group-hover:rotate-2"}`} />
              <span className="mt-4 flex items-baseline gap-3">
                <span className="label text-signal-ink">[ {pad(i + 1)} ]</span>
                <span className="font-display text-title font-semibold [font-stretch:85%] group-hover:text-signal">{screening.title}</span>
              </span>
              <span className="label mt-1 block text-muted">{screening.kicker} · {screening.format}</span>
            </Link>
          </li>
        ))}
        <li className="flex w-[62vw] shrink-0 snap-center items-center sm:w-[42vw] md:w-[min(26vw,46svh)]">
          <Link href="/work" transitionTypes={["nav-forward"]} className="group block">
            <span className="font-display text-display font-semibold leading-none [font-stretch:78%] group-hover:text-signal">
              Enter the work <span className="inline-block transition-transform duration-500 group-hover:translate-x-3">→</span>
            </span>
            <span className="mt-4 block max-w-xs text-sm text-muted">{items.length} screenings, from creator reels to wedding films, logos and menus.</span>
          </Link>
        </li>
      </ol>
    </section>
  );
}
