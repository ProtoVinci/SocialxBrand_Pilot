"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { MQ, dur, revealStart, stagger as st } from "@/lib/motion/tokens";

type Variant = "rise" | "blur" | "chars";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  variant?: Variant;
  /** "scroll" waits for the viewport; "mount" plays immediately (hero). */
  trigger?: "scroll" | "mount";
  delay?: number;
  id?: string;
};

/**
 * The site's typographic entrance. All three variants share the pilot ease:
 *  rise  — masked lines climb from below the baseline (display headings)
 *  blur  — words come into focus (secondary headings, quotes)
 *  chars — masked characters, hero only
 * Splitting is aria-safe: SplitText labels the parent and hides the fragments.
 */
export function SplitReveal({ as: Tag = "h2", children, className, variant = "rise", trigger = "scroll", delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.reduce, () => { gsap.set(el, { autoAlpha: 1 }); });
    mm.add(MQ.motion, () => {
      SplitText.create(el, {
        type: variant === "chars" ? "lines,chars" : "lines,words",
        mask: variant === "blur" ? undefined : "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          const targets = variant === "chars" ? self.chars : variant === "blur" ? self.words : self.lines;
          const from =
            variant === "blur"
              ? { autoAlpha: 0, y: 10, filter: "blur(6px)" }
              : { yPercent: variant === "chars" ? 105 : 110 };
          return gsap.from(targets, {
            ...from,
            duration: variant === "blur" ? dur.base + 0.2 : dur.slow,
            ease: "pilot",
            delay,
            stagger: variant === "chars" ? st.chars : variant === "blur" ? st.words : st.lines,
            // GSAP reads the mere presence of clearProps/scrollTrigger keys, so only add them when set
            ...(variant === "blur" ? { clearProps: "filter" } : {}),
            ...(trigger === "scroll" ? { scrollTrigger: { trigger: el, start: revealStart, once: true } } : {}),
          });
        },
      });
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [variant, trigger, delay] });

  return (
    <Tag ref={ref} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
