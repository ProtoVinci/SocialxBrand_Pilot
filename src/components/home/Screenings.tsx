"use client";
import Link from "next/link";
import { useEffect, useRef, ViewTransition } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import { SplitReveal } from "@/components/motion/SplitReveal";
import type { Screening, VideoAsset } from "@/content/work";
import { liveScreenings, partnerCredit } from "@/content/work";
import { pad } from "@/content/divisions";

type Item = { screening: Screening; reel: VideoAsset };

/**
 * ACT 4 — Screenings. The real work, framed the way it was made: vertical.
 * Desktop: the section pins and the track runs horizontally (containerAnimation); each
 * frame grows toward the centre as it passes, so there is always one "now playing".
 * Mobile/reduced: a native swipe rail with scroll-snap. No pin, no hijack.
 */
export function Screenings({ items }: { items: Item[] }) {
  const total = liveScreenings().length; // the rail shows reel screenings; /work has them all
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLOListElement>(null);

  // The rail slides cards in sideways faster than native lazy-loading reacts, so the first four
  // posters load eagerly and the rest are fetched once the section is a screen away.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      el.querySelectorAll<HTMLImageElement>("img[loading=lazy]").forEach((img) => { img.loading = "eager"; });
      io.disconnect();
    }, { rootMargin: "100% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.cinema, () => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth;
      // Each card grows from 0.86 / 55% as it travels from 85% of the viewport to centre-ish.
      // Computed per frame from cached layout boxes in ONE place, instead of 11 inner
      // ScrollTriggers: every refresh used to re-measure all of them (~half the refresh cost).
      const frames = gsap.utils.toArray<HTMLElement>("[data-frame]", t).map((el) => ({
        el, left: 0, width: 0,
        sx: gsap.quickSetter(el, "scaleX"), sy: gsap.quickSetter(el, "scaleY"), alpha: gsap.quickSetter(el, "opacity"),
      }));
      const measure = () => frames.forEach((f) => { f.left = f.el.offsetLeft; f.width = f.el.offsetWidth; });
      const paint = () => {
        const x = gsap.getProperty(t, "x") as number;
        const vw = window.innerWidth;
        for (const f of frames) {
          const left = f.left + x;
          const from = 0.85 * vw;
          const to = 0.55 * vw - f.width / 2;
          const p = gsap.utils.clamp(0, 1, (from - left) / (from - to));
          f.sx(0.86 + 0.14 * p); // quickSetter has no "scale" shorthand
          f.sy(0.86 + 0.14 * p);
          f.alpha(0.55 + 0.45 * p);
        }
      };
      measure();
      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        onUpdate: paint,
        scrollTrigger: {
          trigger: root.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true,
          onRefresh: () => { measure(); paint(); },
        },
      });
      paint();
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="screenings-title" className="relative overflow-hidden bg-shell py-24 cinema:flex cinema:h-svh cinema:flex-col cinema:justify-center cinema:py-0">
      <div className="gutter flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-blue">[ 03 ] Screenings — real work</p>
          <SplitReveal as="h2" id="screenings-title" className="mt-4 font-display text-headline font-semibold [font-stretch:82%]">
            Made to be <span className="serif-accent font-normal text-blue">watched</span>, not just posted.
          </SplitReveal>
        </div>
        <p className="label max-w-xs text-blue">{partnerCredit}</p>
      </div>

      <ol
        ref={track}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[clamp(1rem,4vw,3.5rem)] pb-4 [scrollbar-width:none] cinema:mt-12 cinema:w-max cinema:snap-none cinema:overflow-visible cinema:pr-[10vw]"
      >
        {items.map(({ screening, reel }, i) => (
          <li key={screening.slug} data-frame className="w-[62vw] shrink-0 snap-center sm:w-[42vw] md:w-[min(22vw,40svh)]">
            <Link href={`/work/${screening.slug}`} transitionTypes={["nav-forward"]} data-cursor="Watch" className="group block">
              {/* hover: the card lifts and tips like a sticker being picked up (alternating sides) */}
              {/* same shared name as the /work tile and the screening cover: the reel morphs into the page */}
              <ViewTransition name={`screening-${screening.slug}`} share="morph" default="none">
                <Reel asset={reel} eager={i < 4} label={`${screening.title} — ${screening.format}`} className={`aspect-[9/16] w-full rounded-[18px] shadow-[0_24px_50px_-28px_rgba(80,40,150,0.55)] transition-[rotate,scale,border-radius] duration-500 ease-[var(--ease-pilot)] group-hover:scale-[1.03] group-hover:rounded-[10px] ${i % 2 ? "group-hover:-rotate-2" : "group-hover:rotate-2"}`} />
              </ViewTransition>
              <span className="mt-4 flex items-baseline gap-3">
                <span className="label shrink-0 whitespace-nowrap text-signal-ink">[ {pad(i + 1)} ]</span>
                <span className="font-display text-title font-semibold [font-stretch:85%] group-hover:text-signal">{screening.title}</span>
              </span>
              <span className="label mt-1 block text-blue">{screening.kicker} · {screening.format}</span>
            </Link>
          </li>
        ))}
        <li className="flex w-[62vw] shrink-0 snap-center items-center sm:w-[42vw] md:w-[min(26vw,46svh)]">
          <Link href="/work" transitionTypes={["nav-forward"]} className="group block">
            <span className="font-display text-display font-semibold leading-none [font-stretch:78%] group-hover:text-signal">
              Enter the work <span className="inline-block transition-transform duration-500 group-hover:translate-x-3">→</span>
            </span>
            <span className="mt-4 block max-w-xs text-sm text-muted">{total} screenings, from creator reels to wedding films, logos and menus.</span>
          </Link>
        </li>
      </ol>
    </section>
  );
}
