"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";

/**
 * The giant edge-to-edge sign-off. It rises out of the footer floor as the page ends,
 * landing the last frame of the film; the promise sits inside it in serif.
 */
export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from(ref.current!.querySelector("[data-word]"), {
        yPercent: 55,
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom bottom", scrub: 0.6 },
      });
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <div ref={ref} aria-hidden className="relative mt-4 overflow-hidden select-none">
      <div data-word className="gutter whitespace-nowrap text-center font-display font-bold leading-[0.78] tracking-[-0.06em] text-paper [font-size:clamp(3rem,15.2vw,17rem)] [font-stretch:75%]">
        SOCIAL<span className="text-signal">x</span>BRAND PILOT
      </div>
    </div>
  );
}
