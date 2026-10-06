"use client";
import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, cappedStagger, dur, stagger } from "@/lib/motion/tokens";
import { observeOnce, REVEAL_MARGIN } from "@/lib/motion/observe";

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Animate direct children as a staggered group instead of the block itself. */
  group?: boolean;
  y?: number;
  delay?: number;
};

/** The `lift` preset: blocks rise 40px into place once, as they enter the viewport (IntersectionObserver, no ScrollTrigger). */
export function Reveal({ as: Tag = "div", children, className, group = false, y = 40, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.reduce, () => { gsap.set(el, { autoAlpha: 1 }); });
    mm.add(MQ.motion, () => {
      gsap.set(el, { autoAlpha: 1 });
      const targets = group ? Array.from(el.children) : [el];
      if (group) {
        gsap.set(targets, { autoAlpha: 0, y });
        return observeOnce(targets, REVEAL_MARGIN, (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: dur.base, delay, stagger: cappedStagger(batch.length, stagger.cards) }),
        );
      }
      const tween = gsap.from(el, { autoAlpha: 0, y, duration: dur.base, delay, paused: true });
      return observeOnce([el], REVEAL_MARGIN, () => tween.play());
    });
    return () => mm.revert();
  }, { scope: ref });

  return (
    <Tag ref={ref} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
