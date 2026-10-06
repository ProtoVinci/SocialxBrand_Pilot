"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import { Mark } from "@/components/brand/Mark";
import { Clock } from "@/components/layout/Clock";
import { SpinBadge } from "@/components/fx/SpinBadge";
import type { VideoAsset } from "@/content/work";
import { impact } from "@/content/site";
import { observeOnce, REVEAL_MARGIN } from "@/lib/motion/observe";

type Props = { fan: VideoAsset[] };

// Fan geometry: cards pivot around a point far below them, like cards in a hand.
const FAN_ANGLES = [-13, -6.5, 0, 6.5, 13];

/**
 * ACT 0–2 — Intro, Hero, Manifesto, as ONE pinned sequence on desktop.
 *   load:   the logomark ribbons slide in, the curtain lifts, the headline rises,
 *           the fan of real reels rotates in (-75° → 0) and the signal line draws.
 *   scroll: headline lines part in counter-motion, side reels fall away, the centre reel
 *           takes over the screen ("digital activity"), a cornflower gradient field rises over it, and the manifesto fills in
 *           character by character until "impact" lands in signal red.
 * Mobile and reduced motion: no pin; hero and manifesto simply stack.
 */
export function Opening({ fan }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    // set by the head script before first paint, so the curtain never flashes on repeat visits
    const firstVisit = document.documentElement.classList.contains("intro");

    mm.add(MQ.reduce, () => { gsap.set(q("[data-reveal]"), { autoAlpha: 1 }); gsap.set(q("[data-curtain]"), { display: "none" }); });

    mm.add({ cinema: MQ.cinema, pocket: MQ.pocket }, (ctx) => {
      const { cinema } = ctx.conditions as { cinema: boolean; pocket: boolean };
      gsap.set(q("[data-reveal]"), { autoAlpha: 1 });

      const title = q("[data-hero-title]")[0];
      const split = SplitText.create(title.querySelectorAll("[data-line]"), { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" }); // line wrappers keep the text readable; aria-label is invalid on these spans
      const cards = q("[data-fan-card]");
      const centre = q("[data-fan-card='2']")[0];
      const fanEl = q("[data-fan]")[0];
      cards.forEach((c, i) => gsap.set(c, { rotate: FAN_ANGLES[i] ?? 0 }));

      // ── load choreography ─────────────────────────────────────────
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
        .from(split.lines, { yPercent: 110, duration: dur.slow, stagger: 0.09 }, firstVisit ? "-=0.35" : 0.05)
        .from(q("[data-fan]"), { rotate: cinema ? -75 : -30, autoAlpha: 0, duration: 1.6, transformOrigin: "50% 260%" }, "<0.05")
        .from(cards, { rotate: 0, duration: 1.4 }, "<")
        .from(q("[data-hero-meta] > *"), { autoAlpha: 0, y: 14, duration: dur.base, stagger: 0.06 }, "<0.3")
        .from(q("[data-hero-cta] > *"), { autoAlpha: 0, y: 24, duration: dur.base, stagger: 0.08 }, "<0.1")
        .from(q("[data-badge]"), { scale: 0, rotate: -90, duration: dur.slow }, "<0.2")
        .from(q("[data-signal]"), { drawSVG: "0%", duration: 1.4, ease: "glide" }, "<")
        // stickers slap onto the fan once it has landed: oversized and twisted, then pressed flat
        .from(q("[data-sticker]"), { scale: 1.8, rotate: (i) => (i ? 24 : -24), autoAlpha: 0, duration: dur.base, stagger: 0.14 }, "-=0.7");

      if (!cinema) {
        // phones: no pin, but the manifesto still lands its argument once it is in view:
        // "activity" is struck through, then "impact" turns white
        return observeOnce(q("[data-manifesto] p"), REVEAL_MARGIN, () => {
          gsap.timeline({ defaults: { ease: "glide" } })
            .to(q("[data-strike]"), { scaleX: 1, duration: dur.base })
            .to(q("[data-activity]"), { opacity: 0.55, duration: dur.quick }, "<0.2")
            .to(q("[data-impact]"), { color: "#ffffff", duration: dur.base }, "+=0.15");
        });
      }

      // ── scroll choreography (desktop only) ────────────────────────
      // Geometry comes from layout boxes (offset*), which ignore transforms, so a refresh
      // mid-scroll can never measure an already-moved card. The fan is centred on its left
      // edge by a -50% x translate, so its visual centre-x is simply offsetLeft.
      const coverScale = () => Math.max(window.innerWidth / fanEl.offsetWidth, window.innerHeight / fanEl.offsetHeight) * 1.02;
      const toCentre = () => ({
        x: root.current!.clientWidth / 2 - fanEl.offsetLeft,
        y: root.current!.clientHeight / 2 - (fanEl.offsetTop + fanEl.offsetHeight / 2),
      });

      // aria "none": the visible lines are aria-hidden and an sr-only sentence carries the text
      const chars = SplitText.create(q("[data-manifesto-line]"), { type: "words,chars", aria: "none" }).chars;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=230%", pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      // the headline clears out (0–0.16) before the centre reel grows past it (from 0.1),
      // so the two never sit half-transparent on top of each other
      tl.to(split.lines[0], { xPercent: -16, autoAlpha: 0, duration: 0.16 }, 0)
        .to(split.lines[1], { xPercent: 12, autoAlpha: 0, duration: 0.16 }, 0)
        .to(split.lines.slice(2), { xPercent: -6, autoAlpha: 0, duration: 0.16 }, 0.02)
        .to(q("[data-hero-cta], [data-hero-meta], [data-signal-wrap], [data-badge]"), { autoAlpha: 0, y: -30, duration: 0.18 }, 0)
        .to(q("[data-sticker]"), { autoAlpha: 0, scale: 0.6, y: -40, duration: 0.16 }, 0)
        .to(q("[data-fan-card]:not([data-fan-card='2'])"), { yPercent: 40, autoAlpha: 0, rotate: (i) => (i < 2 ? -24 : 24), duration: 0.3 }, 0.02)
        .to(q("[data-fan]"), { rotate: 0, duration: 0.25 }, 0.04)
        .set(centre, { transformOrigin: "50% 50%" }, 0.05)
        .to(centre, { rotate: 0, x: () => toCentre().x, y: () => toCentre().y, scale: coverScale, borderRadius: 0, duration: 0.3 }, 0.1)
        .to(q("[data-dim]"), { autoAlpha: 0.86, duration: 0.14 }, 0.34)
        .set(q("[data-manifesto]"), { autoAlpha: 1 }, 0.4)
        .from(chars, { color: "rgba(18,18,26,0.16)", stagger: { amount: 0.36 }, duration: 0.05 }, 0.42)
        .to(q("[data-strike]"), { scaleX: 1, duration: 0.08 }, 0.6)
        .to(q("[data-activity]"), { opacity: 0.42, duration: 0.08 }, 0.6)
        .to(q("[data-impact], [data-impact] *"), { color: "#ffffff", duration: 0.06 }, 0.82)
        .to(q("[data-dim]"), { autoAlpha: 0.96, duration: 0.12 }, 0.84)
        .to({}, { duration: 0.08 });
    });

    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-shell cinema:h-svh">
      {/* Act 0: intro curtain (first visit only; removed under reduced motion) */}
      <div data-curtain aria-hidden className="curtain pointer-events-none fixed inset-0 z-[60] hidden place-items-center bg-shell [html.js-motion.intro_&]:grid">
        <div data-curtain-mark className="w-16 text-signal">
          <Mark className="w-full" />
        </div>
      </div>

      {/* soft light behind the hero, after the Codex gradient fields: cornflower top-left, matched red low right */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-svh overflow-hidden">
        <div className="grid-paper absolute inset-0" />
        {/* radial gradients, not blur filters: same softness, a fraction of the paint cost */}
        <div className="absolute inset-0 bg-[radial-gradient(45%_60%_at_8%_0%,color-mix(in_oklab,var(--color-iris)_58%,transparent)_0%,transparent_70%),radial-gradient(38%_50%_at_96%_72%,color-mix(in_oklab,var(--color-rouge)_45%,transparent)_0%,transparent_70%)]" />
      </div>

      {/* Stage: the reel fan, which becomes the full-screen takeover */}
      {/* one screen tall: on mobile the section also holds the stacked manifesto below */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-svh cinema:inset-0 cinema:z-0 cinema:h-auto" aria-hidden>
        <div
          data-fan
          className="absolute left-1/2 top-[20%] h-[45svh] w-[25.3svh] -translate-x-1/2 max-lg:top-auto max-lg:bottom-[6%] max-lg:h-[34svh] max-lg:w-[19.1svh] lg:left-[83%] xl:left-[78%]"
        >
          {/* stickers: true statements only (all work is the client's own, shot vertical) */}
          <span data-sticker className="absolute -left-[22%] top-[6%] z-10 -rotate-[9deg] rounded-full bg-signal px-4 py-2 font-display text-[clamp(0.8rem,1.1vw,1.05rem)] font-semibold uppercase tracking-wide text-white shadow-[0_12px_30px_-12px_rgba(80,40,150,0.6)] [font-stretch:86%] max-lg:-left-[30%] max-lg:px-3 max-lg:py-1.5">
            Real work · no stock
          </span>
          <span data-sticker className="absolute -right-[18%] bottom-[12%] z-10 rotate-[7deg] rounded-[14px] bg-periwinkle px-4 py-2 font-display text-[clamp(0.8rem,1.1vw,1.05rem)] font-semibold uppercase tracking-wide text-ink shadow-[0_12px_30px_-12px_rgba(80,40,150,0.6)] [font-stretch:86%] max-lg:-right-[26%] max-lg:px-3 max-lg:py-1.5">
            Made in 9:16 ✦
          </span>
          {fan.slice(0, 5).map((asset, i) => (
            <div
              key={asset.id}
              data-fan-card={i}
              className="absolute inset-0 overflow-hidden rounded-[22px] shadow-[0_30px_70px_-24px_rgba(80,40,150,0.32)] will-change-transform"
              style={{ transformOrigin: "50% 260%", zIndex: i === 2 ? 3 : 2 - Math.abs(i - 2) }}
            >
              <Reel asset={asset} eager={i === 2} priority={i === 2 ? 5 : 1} className="h-full w-full" />
            </div>
          ))}
        </div>
        <div data-dim className="act-iris absolute inset-0 opacity-0" />
      </div>

      {/* Act 1: hero */}
      <div className="gutter relative z-10 flex min-h-svh flex-col justify-between pb-10 pt-[calc(var(--nav-h)+1.5rem)] max-lg:pb-[42svh]">
        <div data-hero-meta data-reveal className="flex items-start justify-between gap-6 text-ink/80">
          <span className="label">[ 00 ] Digital Marketing Agency · India &amp; Global</span>
          <Clock className="hidden md:inline-flex" />
        </div>

        <div className="relative">
          <h1 id="hero-title" data-hero-title data-reveal className="font-display text-mega font-bold uppercase [font-stretch:76%]">
            <span data-line className="block">Every business</span>
            <span data-line className="block text-blue">has something</span>
            <span data-line className="block normal-case">
              <span className="serif-accent font-normal tracking-[-0.03em]">worth </span>
              <span className="serif-accent font-normal tracking-[-0.03em] text-signal">showing.</span>
            </span>
          </h1>
          {/* the signal line: leaves the headline and runs into the fan of work */}
          <div data-signal-wrap aria-hidden className="pointer-events-none absolute -bottom-7 left-0 h-20 w-[min(62vw,60rem)] max-lg:hidden">
            <svg viewBox="0 0 1000 80" preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <path data-signal d="M0 40 C 160 40, 260 66, 470 58 S 820 14, 1000 6" fill="none" stroke="#ff3131" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div data-hero-cta data-reveal className="flex flex-col items-start gap-6 lg:max-w-[58%] xl:flex-row xl:items-end xl:gap-10">
          <p className="max-w-sm text-lede text-ink/80">
            We build the strategy, creative and growth systems that help the right people see it.
          </p>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/route" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full bg-blue px-6 py-4 font-semibold text-white transition-colors duration-300 hover:bg-blue-ink">
              Start your Pilot Route <span aria-hidden>→</span>
            </Link>
            <Link href="/work" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full border border-ink/25 px-6 py-4 font-medium transition-colors hover:border-ink">
              See the work
            </Link>
          </div>
        </div>
      </div>

      {/* outside the CTA row on purpose (that row is transformed, which would re-anchor an absolute child);
          cinema only, since the section grows to hold the stacked manifesto otherwise */}
      <div data-badge className="absolute bottom-[9%] right-[clamp(1rem,4vw,3.5rem)] z-10 hidden lg:cinema:block">
        <SpinBadge />
      </div>

      {/* Act 2: manifesto (overlaid + scrubbed in cinema; stacked below the hero otherwise) */}
      <div
        data-manifesto
        className="act-iris gutter relative z-20 grid py-28 cinema:pointer-events-none cinema:!bg-transparent cinema:absolute cinema:inset-0 cinema:place-items-center cinema:py-0 cinema:opacity-0"
      >
        <p className="max-w-[18ch] font-display text-display font-semibold [font-stretch:82%] md:max-w-[16ch]">
          <span className="sr-only">We don&apos;t simply aim to create digital activity. {impact.turn}</span>
          <span data-manifesto-line aria-hidden className="block">
            We don&apos;t simply aim to create digital{" "}
            <span data-activity className="relative inline-block">
              activity.
              <span data-strike aria-hidden className="absolute left-0 right-0 top-[55%] h-[0.08em] origin-left scale-x-0 bg-signal [html:not(.js-motion)_&]:scale-x-100" />
            </span>
          </span>
          <span data-manifesto-line aria-hidden className="mt-[0.35em] block">
            {impact.turn.replace("impact.", "")}
            <span data-impact className="serif-accent font-normal text-ink [html:not(.js-motion)_&]:text-white">impact.</span>
          </span>
        </p>
      </div>
    </section>
  );
}
