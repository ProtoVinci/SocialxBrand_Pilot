"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import type { VideoAsset } from "@/content/work";
import { philosophy } from "@/content/site";

// Each rung gets its own warm daylight colour; the section ends on cream to hand over to Screenings.
const TONES = ["--color-blush", "--color-peach", "--color-sun", "--color-sand", "--color-cream"];

/**
 * ACT 3 — "Marketing is more than being seen." One word changes in place while the colour of
 * the whole act and the framed reel beside it change with it:
 * seen → remembered → trusted → chosen → moving forward.
 * CSS sticky (not a GSAP pin) keeps it cheap; the step is derived from scroll progress.
 * Reduced motion / no JS: the full ladder is shown as a static list.
 */
export function Ladder({ reels }: { reels: VideoAsset[] }) {
  const root = useRef<HTMLElement>(null);
  const steps = philosophy.ladder;

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const words = q("[data-word]");
      const layers = q("[data-layer]");
      const ticks = q("[data-tick]");
      const stage = q("[data-stage]")[0];
      const css = getComputedStyle(document.documentElement);
      const tones = TONES.map((t) => css.getPropertyValue(t).trim());
      let current = -1;
      const show = (i: number) => {
        if (i === current) return;
        const dir = i > current ? 1 : -1;
        // y is pinned to 0 so a stray pixel offset (re-parsed after a revert) can never stack on yPercent
        // ±130% (not 100%) and a fade: italic descenders overhang the line box, so a word parked
        // exactly one line away would peek into the slot.
        words.forEach((w, k) => {
          if (k === i) gsap.fromTo(w, { yPercent: 130 * dir, y: 0, autoAlpha: 0 }, { yPercent: 0, y: 0, autoAlpha: 1, duration: dur.slow, ease: "pilot", overwrite: true });
          else if (k === current) gsap.to(w, { yPercent: -130 * dir, y: 0, autoAlpha: 0, duration: dur.slow, ease: "pilot", overwrite: true });
          else gsap.set(w, { yPercent: 130, y: 0, autoAlpha: 0 });
        });
        layers.forEach((l, k) => gsap.to(l, { autoAlpha: k === i ? 1 : 0, scale: k === i ? 1 : 1.06, duration: dur.cinematic, ease: "glide", overwrite: true }));
        gsap.to(stage, { backgroundColor: tones[i] || tones[0], duration: dur.cinematic, ease: "glide", overwrite: true });
        ticks.forEach((t, k) => t.toggleAttribute("data-on", k <= i));
        current = i;
      };
      gsap.set(words, { yPercent: 130, y: 0, autoAlpha: 0 });
      show(0);
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => show(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="ladder-title" className="relative [html.js-motion_&]:h-[440svh]">
      <div data-stage className="sticky top-0 flex min-h-svh items-center overflow-hidden bg-blush py-24">
        <div className="gutter relative grid w-full items-center gap-12 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div>
            <p className="label text-ink/70">[ 02 ] Our marketing philosophy</p>
            <h2 id="ladder-title" className="mt-6 font-display text-display font-semibold [font-stretch:80%]">
              Marketing is more than being
              {/* animated slot */}
              <span className="relative mt-1 hidden h-[1.12em] overflow-hidden [html.js-motion_&]:block" aria-hidden>
                {steps.map((s) => (
                  <span key={s} data-word className="serif-accent absolute inset-x-0 top-0 font-normal text-signal-ink">{s.toLowerCase()}.</span>
                ))}
              </span>
              <span className="sr-only">{steps.join(", ").toLowerCase()}.</span>
            </h2>
            {/* static fallback: the whole ladder */}
            <ol className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-display text-title [html.js-motion_&]:hidden" aria-hidden>
              {steps.map((s, i) => (<li key={s}>{s}{i < steps.length - 1 && <span className="ml-4 text-signal-ink">→</span>}</li>))}
            </ol>
            <p className="mt-10 max-w-lg text-lede text-ink/80">{philosophy.intro} It is about being seen, remembered, trusted, chosen, and ultimately helping a business move forward.</p>
            <ol aria-hidden className="mt-12 hidden max-w-lg grid-cols-5 gap-2 [html.js-motion_&]:grid">
              {steps.map((s) => (
                <li key={s} data-tick className="group">
                  <span className="block h-[2px] bg-ink/15 transition-colors duration-500 group-data-[on]:bg-ink" />
                  <span className="label mt-2 hidden text-ink/75 transition-colors duration-500 group-data-[on]:text-ink md:block">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* the framed reel: real work at full brightness, changing with the word */}
          <div aria-hidden className="relative mx-auto hidden aspect-[9/16] h-[min(72svh,46rem)] -rotate-2 overflow-hidden rounded-[26px] shadow-[0_40px_80px_-30px_rgba(120,52,20,0.5)] md:block [html:not(.js-motion)_&]:hidden">
            {steps.map((s, i) => {
              const reel = reels[i % Math.max(1, reels.length)];
              return (
                <div key={s} data-layer className="absolute inset-0 opacity-0">
                  {reel && <Reel asset={reel} className="absolute inset-0 h-full w-full" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
