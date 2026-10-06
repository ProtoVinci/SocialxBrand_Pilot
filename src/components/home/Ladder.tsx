"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import type { VideoAsset } from "@/content/work";
import { philosophy } from "@/content/site";

/**
 * ACT 3 — "Marketing is more than being seen." One word changes in place while the footage
 * behind it changes with it: seen → remembered → trusted → chosen → moving forward.
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
      let current = -1;
      const show = (i: number) => {
        if (i === current) return;
        const dir = i > current ? 1 : -1;
        // y is pinned to 0 so a stray pixel offset (re-parsed after a revert) can never stack on yPercent
        words.forEach((w, k) => {
          if (k === i) gsap.fromTo(w, { yPercent: 100 * dir, y: 0, autoAlpha: 1 }, { yPercent: 0, y: 0, duration: dur.slow, ease: "pilot", overwrite: true });
          else if (k === current) gsap.to(w, { yPercent: -100 * dir, y: 0, duration: dur.slow, ease: "pilot", overwrite: true });
          else gsap.set(w, { yPercent: 100, y: 0 });
        });
        layers.forEach((l, k) => gsap.to(l, { autoAlpha: k === i ? 1 : 0, scale: k === i ? 1 : 1.08, duration: dur.cinematic, ease: "glide", overwrite: true }));
        ticks.forEach((t, k) => t.toggleAttribute("data-on", k <= i));
        current = i;
      };
      gsap.set(words, { yPercent: 100, y: 0 });
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
      <div className="sticky top-0 flex min-h-svh items-center overflow-hidden py-24">
        <div aria-hidden className="absolute inset-0 hidden [html.js-motion_&]:block">
          {steps.map((s, i) => {
            const reel = reels[i % Math.max(1, reels.length)];
            return (
              <div key={s} data-layer className="absolute inset-0 opacity-0">
                {reel && <Reel asset={reel} className="absolute inset-y-0 right-0 w-full opacity-45 md:w-1/2" />}
              </div>
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        </div>

        <div className="gutter relative w-full">
          <p className="label text-fog">[ 02 ] Our marketing philosophy</p>
          <h2 id="ladder-title" className="mt-6 font-display text-display font-semibold [font-stretch:80%]">
            Marketing is more than being
            {/* animated slot */}
            <span className="relative mt-1 hidden h-[1.02em] overflow-hidden [html.js-motion_&]:block" aria-hidden>
              {steps.map((s) => (
                <span key={s} data-word className="serif-accent absolute inset-x-0 top-0 font-normal text-signal">{s.toLowerCase()}.</span>
              ))}
            </span>
            <span className="sr-only">{steps.join(", ").toLowerCase()}.</span>
          </h2>
          {/* static fallback: the whole ladder */}
          <ol className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-display text-title [html.js-motion_&]:hidden" aria-hidden>
            {steps.map((s, i) => (<li key={s}>{s}{i < steps.length - 1 && <span className="ml-4 text-signal">→</span>}</li>))}
          </ol>
          <p className="mt-10 max-w-lg text-lede text-paper/75">{philosophy.intro} It is about being seen, remembered, trusted, chosen, and ultimately helping a business move forward.</p>
          <ol aria-hidden className="mt-12 hidden max-w-lg grid-cols-5 gap-2 [html.js-motion_&]:grid">
            {steps.map((s) => (
              <li key={s} data-tick className="group">
                <span className="block h-px bg-paper/20 transition-colors duration-500 group-data-[on]:bg-signal" />
                <span className="label mt-2 hidden text-fog transition-colors duration-500 group-data-[on]:text-paper md:block">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
