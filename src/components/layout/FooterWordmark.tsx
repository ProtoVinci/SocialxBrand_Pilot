"use client";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGSAPNear } from "@/lib/motion/defer";
import { MQ, scrubSmoothing } from "@/lib/motion/tokens";
import { ridge, lilita } from "@/app/fonts";

/**
 * The giant edge-to-edge sign-off. It rises out of the footer floor as the page ends,
 * landing the last frame of the film. Lettered like the logo: SOCIAL in purple Lilita One, BRAND PILOT in red Ridge 5.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAPNear(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from(ref.current!.querySelector("[data-word]"), {
        yPercent: 55,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: scrubSmoothing(0.6) },
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <div ref={ref} aria-hidden className="relative mt-4 overflow-hidden select-none">
      <div data-word className="gutter whitespace-nowrap text-center font-display font-medium leading-[0.86] tracking-[-0.06em] text-ink [font-size:clamp(2rem,8.6vw,10rem)]">
        <span className={`${lilita.className} font-normal tracking-normal text-[#8C52FF]`}>SOCIAL</span>x<span className={`${ridge.className} font-bold tracking-normal text-signal`}>BRAND PILOT</span>
      </div>
    </div>
  );
}
