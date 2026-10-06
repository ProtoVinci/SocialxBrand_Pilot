"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";

/**
 * Pointer gimmicks, fine pointers + motion only (touch and reduced motion get neither):
 *  - a cursor follower: a small blue dot that swells into a labelled bubble over anything
 *    carrying `data-cursor="Play"` (the label is the attribute's value);
 *  - magnetic pull: any `.magnetic` element leans toward the pointer and settles back.
 * Both use event delegation on window, so they keep working across page transitions.
 * The native cursor is never hidden: the follower is an accent, not a replacement.
 */
export function PointerFx() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`${MQ.motion} and ${MQ.finePointer}`, () => {
      const el = dot.current!;
      gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.16, autoAlpha: 0 });
      const toX = gsap.quickTo(el, "x", { duration: dur.base, ease: "pilot" });
      const toY = gsap.quickTo(el, "y", { duration: dur.base, ease: "pilot" });
      let shown = false;
      let current = "";
      let magnet: HTMLElement | null = null;

      const settle = (m: HTMLElement) => gsap.to(m, { x: 0, y: 0, duration: dur.slow, ease: "pilot", overwrite: "auto" });

      const move = (e: PointerEvent) => {
        if (!shown) {
          gsap.set(el, { x: e.clientX, y: e.clientY });
          gsap.to(el, { autoAlpha: 1, duration: dur.quick });
          shown = true;
        }
        toX(e.clientX);
        toY(e.clientY);

        const target = e.target instanceof Element ? e.target : null;
        const text = (target?.closest("[data-cursor]") as HTMLElement | null)?.dataset.cursor ?? "";
        if (text !== current) {
          current = text;
          if (text) label.current!.textContent = text;
          el.toggleAttribute("data-big", Boolean(text));
          gsap.to(el, { scale: text ? 1 : 0.16, duration: dur.quick, ease: "pilot", overwrite: "auto" });
        }

        const m = target?.closest<HTMLElement>(".magnetic") ?? null;
        if (magnet && magnet !== m) settle(magnet);
        magnet = m;
        if (m) {
          const r = m.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          gsap.to(m, { x: dx * 0.28, y: dy * 0.38, duration: dur.base, ease: "pilot", overwrite: "auto" });
        }
      };
      const leave = () => {
        gsap.to(el, { autoAlpha: 0, duration: dur.quick });
        shown = false;
        if (magnet) settle(magnet);
        magnet = null;
      };

      window.addEventListener("pointermove", move, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave);
      return () => {
        window.removeEventListener("pointermove", move);
        document.documentElement.removeEventListener("pointerleave", leave);
      };
    });
    return () => mm.revert();
  });

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[90] grid size-24 place-items-center rounded-full bg-blue text-white invisible [&:not([data-big])>span]:opacity-0"
    >
      <span ref={label} className="label transition-opacity duration-200" />
    </div>
  );
}
