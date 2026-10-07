"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import { Mark } from "@/components/brand/Mark";
import { Clock } from "@/components/layout/Clock";
import { ToolsOrbit } from "@/components/fx/ToolsOrbit";
import { HeroGlare } from "@/components/fx/HeroGlare";
import { HeroPill } from "@/components/home/HeroPill";
import type { MediaAsset, VideoAsset } from "@/content/work";
import { impact } from "@/content/site";
import { observeOnce, REVEAL_MARGIN } from "@/lib/motion/observe";

type Props = { takeover: VideoAsset; pillsTop: MediaAsset[]; pillsBottom: MediaAsset[] };

/**
 * ACT 0–2 — Intro, Hero, Manifesto, as ONE pinned sequence on desktop.
 * The hero layout is prototype 1's (hanzo-style): a centred headline with media capsules set
 * inline in the words, cycling real work, under diagonal window light.
 *   load:   the logomark ribbons slide in, the curtain lifts, the headline lines rise and the
 *           capsules pop into their slots.
 *   scroll: the headline parts and clears, a real reel grows from the centre of the screen
 *           to fill it ("digital activity"), a purple field rises over it, and the manifesto
 *           fills in character by character until "impact" lands.
 * Mobile and reduced motion: no pin; hero and manifesto simply stack.
 */
export function Opening({ takeover, pillsTop, pillsBottom }: Props) {
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
      // aria "none": the line wrappers keep the text readable; aria-label is invalid on spans
      const split = SplitText.create(title.querySelectorAll("[data-line]"), { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" });

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
        .from(q("[data-hero-meta] > *"), { autoAlpha: 0, y: 14, duration: dur.base, stagger: 0.06 }, firstVisit ? "-=0.35" : 0.05)
        .from(split.lines, { yPercent: 110, duration: dur.slow, stagger: 0.09 }, "<0.05")
        .from(q("[data-pill]"), { scale: 0.4, autoAlpha: 0, duration: dur.slow, stagger: 0.12 }, "<0.35")
        .from(q("[data-hero-lede], [data-hero-cta] > *"), { autoAlpha: 0, y: 24, duration: dur.base, stagger: 0.08 }, "<0.1")
        .from(q("[data-badge]"), { scale: 0, rotate: -90, duration: dur.slow }, "<0.2");

      if (!cinema) {
        // phones: no pin, but the manifesto still lands its argument once it is in view:
        // "activity" is struck through, then "impact" turns purple
        return observeOnce(q("[data-manifesto] p"), REVEAL_MARGIN, () => {
          gsap.timeline({ defaults: { ease: "glide" } })
            .to(q("[data-strike]"), { scaleX: 1, duration: dur.base })
            .to(q("[data-activity]"), { opacity: 0.55, duration: dur.quick }, "<0.2")
            .to(q("[data-impact]"), { color: "#1f2c85", duration: dur.base }, "+=0.15");
        });
      }

      // ── scroll choreography (desktop only) ────────────────────────
      // The takeover reel starts as an exact copy of the first headline capsule, then the window
      // itself morphs (position, size, corner radius) until it fills the screen. Geometry comes
      // from layout offsets, which ignore transforms, so a refresh mid-scroll measures the
      // capsule where it sits at rest, not where the scrub has moved it.
      const card = q("[data-takeover]")[0];
      const pill = q("[data-pill=top] > span")[0];
      const box = () => {
        let x = 0, y = 0, el: HTMLElement | null = pill;
        while (el && el !== root.current) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent as HTMLElement | null; }
        return { left: x, top: y, width: pill.offsetWidth, height: pill.offsetHeight, borderRadius: getComputedStyle(pill).borderTopLeftRadius };
      };
      gsap.set(card, { autoAlpha: 0 });

      // aria "none": the visible lines are aria-hidden and an sr-only sentence carries the text
      const chars = SplitText.create(q("[data-manifesto-line]"), { type: "words,chars", aria: "none" }).chars;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=230%", pin: true, scrub: 0.8, invalidateOnRefresh: true },
      });
      // the capsule hands over to the full-size window at once, the words clear (0–0.16),
      // then the window opens out to the full screen (0.12–0.4)
      const at = { left: () => box().left, top: () => box().top, width: () => box().width, height: () => box().height, borderRadius: () => box().borderRadius };
      tl.fromTo(card, { ...at, rotate: -2, autoAlpha: 1 }, { ...at, rotate: -2, autoAlpha: 1, duration: 0.001, immediateRender: false }, 0)
        .to(pill, { autoAlpha: 0, duration: 0.001 }, 0)
        .to(split.lines[0], { xPercent: -14, autoAlpha: 0, duration: 0.16 }, 0)
        .to(split.lines.slice(1), { xPercent: 12, autoAlpha: 0, duration: 0.16 }, 0)
        .to(q("[data-hero-cta], [data-hero-meta], [data-badge], [data-hero-lede]"), { autoAlpha: 0, y: -30, duration: 0.16 }, 0)
        .to(card, { left: 0, top: 0, width: () => root.current!.clientWidth, height: () => root.current!.clientHeight, borderRadius: 0, rotate: 0, duration: 0.28, ease: "power2.inOut" }, 0.12)
        .to(q("[data-dim]"), { autoAlpha: 0.86, duration: 0.14 }, 0.34)
        .set(q("[data-manifesto]"), { autoAlpha: 1 }, 0.4)
        .from(chars, { color: "rgba(28,25,23,0.16)", stagger: { amount: 0.36 }, duration: 0.05 }, 0.42)
        .to(q("[data-strike]"), { scaleX: 1, duration: 0.08 }, 0.6)
        .to(q("[data-activity]"), { opacity: 0.42, duration: 0.08 }, 0.6)
        .to(q("[data-impact], [data-impact] *"), { color: "#1f2c85", duration: 0.06 }, 0.82)
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

      {/* prototype 1's canvas: the warm mesh, a faint red/purple ambient glow, then the window light */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-svh overflow-hidden">
        <div className="grid-paper absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(244_52_54/0.05),rgb(110_60_241/0.035)_55%,transparent)]" />
        <HeroGlare />
      </div>

      {/* Stage (desktop motion only): the reel that takes over the screen, and the field over it */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden cinema:block" aria-hidden>
        <div data-takeover className="invisible absolute left-0 top-0 h-24 w-40 overflow-hidden shadow-[0_30px_70px_-24px_rgb(28_25_23/0.4)]">
          <Reel asset={takeover} priority={5} className="h-full w-full" />
        </div>
        <div data-dim className="act-iris absolute inset-0 opacity-0" />
      </div>

      {/* Act 1: hero (prototype 1 layout) */}
      <div className="gutter relative z-10 flex min-h-svh flex-col items-center justify-center gap-8 pb-16 pt-[calc(var(--nav-h)+2.5rem)] text-center sm:gap-10">
        <div data-hero-meta data-reveal className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-medium text-ink/75 shadow-[0_2px_12px_rgb(28_25_23/0.03)]">
            <span className="h-2 w-2 rounded-full bg-signal" />
            Digital marketing agency · India &amp; Global
          </span>
          <Clock className="rounded-full border border-line bg-white px-4 py-1.5 text-ink/75 shadow-[0_2px_12px_rgb(28_25_23/0.03)]" />
        </div>

        <h1 id="hero-title" data-hero-title data-reveal className="font-display text-[clamp(2.4rem,8.4vw,8.6rem)] font-medium leading-[1.08] tracking-[-0.05em]">
          <span data-line className="block whitespace-nowrap">
            Every
            <span data-pill="top" className="inline-block"><HeroPill slides={pillsTop} interval={1400} tilt={-2} className="h-[0.9em] w-[1.3em]" /></span>
            business
          </span>
          <span data-line className="block whitespace-nowrap">
            <span className="ink-cobalt">has</span>
            <span data-pill className="inline-block"><HeroPill slides={pillsBottom} interval={1700} tilt={2} className="h-[0.9em] w-[1.2em]" /></span>
            <span className="ink-cobalt">something</span>
          </span>
          <span data-line className="block whitespace-nowrap">
            <span className="serif-accent">worth </span><span className="serif-accent text-signal">showing.</span>
          </span>
        </h1>

        <p data-hero-lede data-reveal className="mx-auto max-w-2xl text-lede text-ink/70">
          We build the strategy, creative and growth systems that help the right people see it.
        </p>

        <div data-hero-cta data-reveal className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/route" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full bg-cta px-7 py-3.5 font-medium text-white shadow-sm transition-colors duration-300 hover:bg-cta-hover">
            Start your Pilot Route <span aria-hidden>↗</span>
          </Link>
          <Link href="/work" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full border border-line bg-white px-7 py-3.5 font-medium shadow-sm transition-colors hover:border-line-strong hover:bg-sand">
            See the work <span aria-hidden className="text-muted">↓</span>
          </Link>
        </div>
      </div>

      {/* top right, as in prototype 1: the tools orbit; large screens only (it would crowd the headline below xl) */}
      <div data-badge className="absolute right-[clamp(1rem,3vw,3rem)] top-[calc(var(--nav-h)+1.5rem)] z-10 hidden xl:block">
        <ToolsOrbit />
      </div>

      {/* Act 2: manifesto (overlaid + scrubbed in cinema; stacked below the hero otherwise) */}
      <div
        data-manifesto
        className="act-iris gutter relative z-20 grid py-28 cinema:pointer-events-none cinema:!bg-transparent cinema:absolute cinema:inset-0 cinema:place-items-center cinema:py-0 cinema:opacity-0"
      >
        <p className="max-w-[18ch] font-display text-display font-medium md:max-w-[16ch]">
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
            <span data-impact className="serif-accent font-normal text-ink [html:not(.js-motion)_&]:text-iris-deep">impact.</span>
          </span>
        </p>
      </div>
    </section>
  );
}
