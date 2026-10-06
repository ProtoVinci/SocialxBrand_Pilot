"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";

/**
 * A division's own approach chain, drawn as a route. The signal line scrubs across as the
 * section passes, and each station lights when the line reaches it, so every division shows
 * its own path from objective to outcome.
 */
export function ApproachRoute({ steps }: { steps: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const stops = q("[data-stop]");
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current, start: "top 75%", end: "bottom 45%", scrub: 0.6,
          onUpdate: (self) => stops.forEach((s, i) => s.toggleAttribute("data-on", self.progress >= i / Math.max(1, stops.length - 1) - 0.001)),
        },
      }).fromTo(q("[data-line]"), { scaleX: 0 }, { scaleX: 1 });
    });
    mm.add(MQ.reduce, () => { q("[data-stop]").forEach((s) => s.setAttribute("data-on", "")); });
    return () => mm.revert();
  }, { scope: root });

  return (
    <div ref={root} className="relative">
      <div aria-hidden className="absolute left-0 right-0 top-[7px] hidden h-px bg-current/15 md:block" />
      <div aria-hidden data-line className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-signal md:block" />
      <ol
        className="relative grid gap-6 md:gap-3 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": steps.length } as React.CSSProperties}
      >
        {steps.map((s, i) => (
          <li key={s} data-stop className="group flex flex-col gap-4 max-md:flex-row max-md:items-center max-md:gap-4">
            <span className="block h-3.5 w-3.5 shrink-0 rounded-full border border-current/40 bg-ink transition-[background-color,border-color,transform] duration-500 group-data-[on]:scale-110 group-data-[on]:border-signal group-data-[on]:bg-signal" />
            <span>
              <span className="label block text-fog">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-1 block font-display text-[1.05rem] font-semibold leading-tight [font-stretch:88%] transition-colors duration-500 group-data-[on]:text-paper md:text-[clamp(0.95rem,1.15vw,1.2rem)]">{s}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
