"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { observeOnce, NEAR_MARGIN, REVEAL_MARGIN } from "@/lib/motion/observe";
import { MQ, dur, stagger as st } from "@/lib/motion/tokens";

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
 * Splitting is aria-safe: on headings SplitText labels the parent and hides the fragments.
 * aria-label is not permitted on generic tags (p, span, div), so there the fragments are left
 * readable instead (aria: "none").
 * Scroll reveals split lazily, when the heading is about a screen away, and play when it
 * crosses the reveal line; both use IntersectionObserver, so headings add no ScrollTriggers.
 */
export function SplitReveal({ as: Tag = "h2", children, className, variant = "rise", trigger = "scroll", delay = 0, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const aria = typeof Tag === "string" && /^h[1-6]$/.test(Tag) ? "auto" : "none";

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.reduce, () => { gsap.set(el, { autoAlpha: 1 }); });
    mm.add(MQ.motion, (context) => {
      const split = () => SplitText.create(el, {
        type: variant === "chars" ? "lines,chars" : "lines,words",
        mask: variant === "blur" ? undefined : "lines",
        linesClass: "split-line",
        aria,
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          const targets = variant === "chars" ? self.chars : variant === "blur" ? self.words : self.lines;
          const from =
            variant === "blur"
              ? { autoAlpha: 0, y: 10, filter: "blur(6px)" }
              : { yPercent: variant === "chars" ? 105 : 110 };
          const tween = gsap.from(targets, {
            ...from,
            duration: variant === "blur" ? dur.base + 0.2 : dur.slow,
            ease: "pilot",
            delay,
            stagger: variant === "chars" ? st.chars : variant === "blur" ? st.words : st.lines,
            paused: trigger === "scroll",
            // GSAP reads the mere presence of clearProps, so only add it when set
            ...(variant === "blur" ? { clearProps: "filter" } : {}),
          });
          if (trigger === "scroll") context.add(() => observeOnce([el], REVEAL_MARGIN, () => tween.play()));
          return tween;
        },
      });
      if (trigger === "mount") { split(); return; }
      // context.add runs the late split inside this matchMedia context, so revert still undoes it
      return observeOnce([el], NEAR_MARGIN, () => context.add(() => { split(); }));
    });
    return () => mm.revert();
  }, { scope: ref, dependencies: [variant, trigger, delay, aria] });

  return (
    <Tag ref={ref} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
