"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";

/**
 * The giant edge-to-edge sign-off. It rises out of the footer floor as the page ends,
 * landing the last frame of the film. Coloured like the logo: SOCIAL purple, BRAND PILOT red (sized for Inter's wider set).
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
      <div data-word className="gutter whitespace-nowrap text-center font-display font-medium leading-[0.86] tracking-[-0.06em] text-ink [font-size:clamp(2rem,8.6vw,10rem)]">
        <span className="text-blue">SOCIAL</span>x<span className="text-signal">BRAND PILOT</span>
      </div>
    </div>
  );
}
