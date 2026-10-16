"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Mark } from "@/components/brand/Mark";
import { HeroGlare } from "@/components/fx/HeroGlare";
import { HeroPill } from "@/components/home/HeroPill";
import type { MediaAsset } from "@/content/work";
import { heroLede } from "@/content/site";

type Props = { pillsTop: MediaAsset[]; pillsBottom: MediaAsset[] };

/**
 * The home hero: what the agency is, in one screen, and the two ways on (work, services).
 * Prototype 1's layout: a centred headline with media capsules set inline in the words, cycling
 * real work, under diagonal window light.
 *   load: the logomark ribbons slide in (first visit), the curtain lifts, the headline lines rise
 *         and the capsules pop into their slots.
 * No scroll scene: the selected work follows straight after (the client-first refactor removed the
 * pinned takeover and manifesto, and the decorative tools orbit, 2026-10-16). The headline reads
 * the same with the clips paused, loading, or under reduced motion (their posters stay).
 */
export function Opening({ pillsTop, pillsBottom }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    // set by the head script before first paint, so the curtain never flashes on repeat visits
    const firstVisit = document.documentElement.classList.contains("intro");

    mm.add(MQ.reduce, () => { gsap.set(q("[data-reveal]"), { autoAlpha: 1 }); gsap.set(q("[data-curtain]"), { display: "none" }); });

    mm.add(MQ.motion, () => {
      gsap.set(q("[data-reveal]"), { autoAlpha: 1 });
      // NOT SplitText here: it rebuilds the lines from copies, and the media capsules inside them are
      // React components, so React kept cycling and mounting videos in detached originals while the
      // screen showed a frozen copy. Each line already has its own clipping mask in the markup.
      const lines = q("[data-line]");
      const intro = gsap.timeline({ defaults: { ease: "pilot" }, onComplete: () => document.documentElement.classList.remove("intro") });
      if (firstVisit) {
        intro
          .from(q("[data-curtain-mark] [data-part]"), { xPercent: 60, autoAlpha: 0, duration: 0.45, stagger: 0.07 })
          .to(q("[data-curtain]"), { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "glide" }, "+=0.08")
          .set(q("[data-curtain]"), { display: "none" });
      } else {
        gsap.set(q("[data-curtain]"), { display: "none" });
      }
      intro
        .from(lines, { yPercent: 110, duration: dur.slow, stagger: 0.09 }, firstVisit ? "-=0.3" : 0.1)
        // the capsule itself, not its [data-pill] slot: the slot sits between words, and when GSAP reads
        // a transform of an element that is not rendered (a revert while the page is hidden) it
        // re-appends it before its next ELEMENT sibling, which skips the following word, so the
        // capsule landed after "business". The capsule is its slot's only child, so nothing can move.
        .from(q("[data-pill] > span"), { scale: 0.4, autoAlpha: 0, duration: dur.slow, stagger: 0.12 }, "<0.35")
        .from(q("[data-hero-lede], [data-hero-cta] > *"), { autoAlpha: 0, y: 24, duration: dur.base, stagger: 0.08 }, "<0.1");
    });

    return () => mm.revert();
  }, { scope: root });

  // Once the hero has scrolled away, the glare's slow drift pauses (data-still, globals.css): it
  // kept the compositor redrawing the blurred, blended light layers for a hero nobody sees.
  // The capsules pause themselves (their own observer).
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-still", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-shell">
      {/* intro curtain (first visit only; removed under reduced motion) */}
      <div data-curtain aria-hidden className="curtain pointer-events-none fixed inset-0 z-[60] hidden place-items-center bg-shell [html.js-motion.intro_&]:grid">
        <div data-curtain-mark className="w-16 text-signal">
          <Mark className="w-full" />
        </div>
      </div>

      {/* prototype 1's canvas: the warm mesh, a faint red/purple ambient glow, then the window light */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-svh overflow-hidden">
        <div className="grid-paper absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(244_52_54/0.05),rgb(110_60_241/0.035)_55%,transparent)]" />
        <HeroGlare />
      </div>

      <div className="gutter relative z-10 flex min-h-svh flex-col items-center justify-center gap-8 pb-16 pt-[calc(var(--nav-h)+2.5rem)] text-center sm:gap-10">
        {/* the capsules sit between the words, so the heading carries its sentence as a label */}
        <h1 id="hero-title" aria-label="Every business has something worth showing." data-hero-title data-reveal className="font-display text-[clamp(2.4rem,14vw,3.3rem)] font-medium leading-[1.08] tracking-[-0.05em] sm:text-[clamp(2.4rem,8.4vw,8.6rem)]">
          <span className="block overflow-y-clip pb-[0.06em]">
          <span data-line className="block whitespace-normal sm:whitespace-nowrap">
            Every
            <span data-pill="top" className="inline-block"><HeroPill slides={pillsTop} interval={1400} tilt={-2} className="h-[0.9em] w-[1.3em] max-sm:h-[1em] max-sm:w-[1.38em]" /></span>
            business
          </span>
          </span>
          <span className="block overflow-y-clip pb-[0.06em]">
          <span data-line className="block whitespace-normal sm:whitespace-nowrap">
            <span className="ink-cobalt">has</span>
            <span data-pill className="inline-block"><HeroPill slides={pillsBottom} interval={1700} tilt={2} className="h-[0.9em] w-[1.2em] max-sm:h-[1em] max-sm:w-[1.28em]" /></span>
            <span className="ink-cobalt">something</span>
          </span>
          </span>
          <span className="block overflow-y-clip pb-[0.06em]">
          <span data-line className="block whitespace-normal sm:whitespace-nowrap">
            <span className="serif-accent">worth </span><span className="serif-accent text-signal">showing.</span>
          </span>
          </span>
        </h1>

        <p data-hero-lede data-reveal className="mx-auto max-w-2xl text-lede text-ink/70">
          {heroLede}
        </p>

        {/* the two ways on; Contact us stays in the navigation bar */}
        <div data-hero-cta data-reveal className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/work" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full bg-cta px-7 py-3.5 font-medium text-white shadow-sm transition-colors duration-300 hover:bg-cta-hover">
            See our work <span aria-hidden>→</span>
          </Link>
          <Link href="/capabilities" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full border border-line bg-white px-7 py-3.5 font-medium shadow-sm transition-colors hover:border-line-strong hover:bg-sand">
            Explore services <span aria-hidden className="text-muted">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
