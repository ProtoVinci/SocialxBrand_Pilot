"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Reel, type ReelHandle } from "@/components/media/Reel";
import type { VideoAsset } from "@/content/work";
import { philosophy } from "@/content/site";

/**
 * ACT 3 — "Marketing is more than being seen." One word changes in place while the framed
 * reel beside it scrolls to the next clip like a reel feed, on a single periwinkle act:
 * seen → remembered → trusted → chosen → moving forward.
 * CSS sticky (not a GSAP pin) keeps it cheap; the step is derived from scroll progress.
 * Reduced motion / no JS: the full ladder is shown as a static list.
 */
export function Ladder({ reels }: { reels: VideoAsset[] }) {
  const root = useRef<HTMLElement>(null);
  const players = useRef<(ReelHandle | null)[]>([]);
  const steps = philosophy.ladder;

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const words = q("[data-word]");
      const layers = q("[data-layer]");
      const ticks = q("[data-tick]");
      let current = -1;
      let visible = false;
      // only the rung on screen decodes video: the stacked layers are manual reels, so the shared
      // budget never spends a slot on an invisible layer
      const sync = () => players.current.forEach((p, k) => (visible && k === current ? p?.play() : p?.pause()));
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
        // the frame scrolls like a reel feed: the old clip is pushed up and out while the next rides
        // up from below (reversed when scrolling back), both in motion through the handover
        layers.forEach((l, k) => {
          if (k === i) gsap.fromTo(l, { yPercent: 100 * dir, scale: 1, autoAlpha: 1, zIndex: 2 }, { yPercent: 0, duration: dur.slow, ease: "pilot", overwrite: true });
          else if (k === current) gsap.to(l, { yPercent: -100 * dir, scale: 0.94, zIndex: 1, duration: dur.slow, ease: "pilot", overwrite: true, onComplete: () => { gsap.set(l, { autoAlpha: 0 }); } });
          else gsap.set(l, { autoAlpha: 0, yPercent: 100, zIndex: 0 });
        });
        ticks.forEach((t, k) => t.toggleAttribute("data-on", k <= i));
        current = i;
        sync();
      };
      // first rung set directly (no tweens at load: each tween would read computed styles)
      gsap.set(words, { yPercent: 130, y: 0, autoAlpha: 0 });
      gsap.set(words[0], { yPercent: 0, autoAlpha: 1 });
      gsap.set(layers, { autoAlpha: 0, yPercent: 100 });
      gsap.set(layers[0], { autoAlpha: 1, yPercent: 0 });
      ticks[0]?.toggleAttribute("data-on", true);
      current = 0;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => show(Math.min(steps.length - 1, Math.floor(self.progress * steps.length))),
      });
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.15 });
      io.observe(root.current!.querySelector("[data-frame]")!);
      return () => { st.kill(); io.disconnect(); players.current.forEach((p) => p?.pause()); };
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="ladder-title" className="relative [html.js-motion_&]:h-[340svh]">
      <div className="act-periwinkle sticky top-0 flex min-h-svh items-center overflow-hidden py-20 md:py-24">
        <div className="gutter relative grid w-full items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div>
            <p className="label text-ink/70">[ 02 ] Our marketing philosophy</p>
            <h2 id="ladder-title" className="mt-6 font-display text-display font-medium">
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
            <p className="mt-6 max-w-lg text-ink/80 md:mt-10 md:text-lede">{philosophy.intro} It is about being seen, remembered, trusted, chosen, and ultimately helping a business move forward.</p>
            <ol aria-hidden className="mt-8 hidden max-w-lg md:mt-12 grid-cols-5 gap-2 [html.js-motion_&]:grid">
              {steps.map((s) => (
                <li key={s} data-tick className="group">
                  <span className="block h-[2px] bg-ink/15 transition-colors duration-500 group-data-[on]:bg-signal" />
                  <span className="label mt-2 hidden text-ink/75 transition-colors duration-500 group-data-[on]:text-ink lg:block">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* the framed reel: real work at full brightness, changing with the word */}
          <div data-frame aria-hidden className="relative mx-auto bg-ink aspect-[9/16] h-[34svh] -rotate-2 overflow-hidden rounded-[20px] shadow-[0_40px_80px_-30px_rgba(31,44,133,0.38)] max-md:ml-2 md:h-[min(72svh,46rem)] md:rounded-[26px]">
            {steps.map((s, i) => {
              const reel = reels[i % Math.max(1, reels.length)];
              return (
                // without JS motion the first rung stays visible as a still frame
                <div key={s} data-layer className={`absolute inset-0 opacity-0 ${i === 0 ? "[html:not(.js-motion)_&]:opacity-100" : ""}`}>
                  {reel && <Reel ref={(r) => { players.current[i] = r; }} asset={reel} mode="manual" className="absolute inset-0 h-full w-full" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
