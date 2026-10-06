"use client";
import { Fragment, useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import type { VideoAsset } from "@/content/work";
import { philosophy } from "@/content/site";

/**
 * The promise as a moving band, between the work and the capabilities. Row one is the logo's
 * own line in giant type, with real reel posters set inline like stickers; row two runs the
 * philosophy ladder (seen → moving forward) the other way. Scrolling drives the band: it speeds up with scroll
 * velocity, reverses with scroll direction and leans (skew) into fast scrolls, then settles.
 * Reduced motion: two still rows. Paused off-screen.
 */
export function Marquee({ chips }: { chips: VideoAsset[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const tracks = q("[data-track]");
      const loops = tracks.map((t, i) => {
        const fwd = i % 2 === 0;
        gsap.set(t, { xPercent: fwd ? 0 : -50 });
        return gsap.to(t, { xPercent: fwd ? -50 : 0, duration: fwd ? 34 : 48, ease: "none", repeat: -1 });
      });
      const lean = q("[data-lean]");
      const skewTo = gsap.quickTo(lean, "skewX", { duration: dur.base, ease: "pilot" });
      let dir = 1;
      let settle: gsap.core.Tween | undefined;

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => loops.forEach((l) => (self.isActive ? l.play() : l.pause())),
        onUpdate: (self) => {
          const v = self.getVelocity();
          dir = self.direction;
          const boost = 1 + Math.min(Math.abs(v) / 350, 6);
          loops.forEach((l) => gsap.to(l, { timeScale: dir * boost, duration: dur.quick, overwrite: true }));
          skewTo(gsap.utils.clamp(-10, 10, -v / 220));
          settle?.kill();
          settle = gsap.delayedCall(0.18, () => {
            loops.forEach((l) => gsap.to(l, { timeScale: dir, duration: dur.slow, ease: "pilot", overwrite: true }));
            skewTo(0);
          });
        },
      });
      return () => { st.kill(); settle?.kill(); };
    });
    return () => mm.revert();
  }, { scope: root });

  const promise = (
    <>
      {[0, 1].map((k) => (
        <Fragment key={k}>
          <span>We will show</span>
          <Chip asset={chips[k * 2]} tilt={-7} />
          <span className="serif-accent normal-case text-white">you will grow</span>
          <Chip asset={chips[k * 2 + 1]} tilt={6} />
        </Fragment>
      ))}
    </>
  );

  return (
    <section ref={root} aria-label="We will show, you will grow" className="act-iris relative overflow-hidden py-14 md:py-20">
      <div data-lean className="flex flex-col gap-4 will-change-transform md:gap-6">
        <div className="overflow-hidden" aria-hidden>
          <div data-track className="flex w-max items-center gap-[0.35em] whitespace-nowrap font-display text-[clamp(3.4rem,11vw,10.5rem)] font-bold uppercase leading-none [font-stretch:76%]">
            <div className="flex items-center gap-[0.35em] pr-[0.35em]">{promise}</div>
            <div className="flex items-center gap-[0.35em] pr-[0.35em]">{promise}</div>
          </div>
        </div>
        <div className="overflow-hidden" aria-hidden>
          <div data-track className="flex w-max items-center whitespace-nowrap font-display text-[clamp(1.4rem,3.2vw,2.8rem)] font-semibold [font-stretch:84%]">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center">
                {[0, 1, 2].flatMap((n) =>
                  philosophy.ladder.map((w) => (
                    <span key={`${n}-${w}`} className="flex items-center">
                      <span className="px-5 text-ink/85">{w}</span>
                      <span className="text-white">✦</span>
                    </span>
                  )),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only">We will show, you will grow.</p>
    </section>
  );
}

function Chip({ asset, tilt }: { asset?: VideoAsset; tilt: number }) {
  if (!asset) return <span className="text-white">✦</span>;
  return (
    <span className="inline-block aspect-[9/16] h-[0.82em] shrink-0 overflow-hidden rounded-[0.12em] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)] ring-4 ring-white" style={{ rotate: `${tilt}deg` }}>
      <picture>
        <source srcSet={asset.poster.avif} type="image/avif" />
        <img src={asset.poster.webp} alt="" width={asset.width} height={asset.height} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </picture>
    </span>
  );
}
