"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";

type Magnet = { x: (v: number) => void; y: (v: number) => void; cx: number; cy: number };

/**
 * Pointer gimmicks, fine pointers + motion only (touch and reduced motion get neither):
 *  - a cursor follower: a small blue dot that swells into a labelled bubble over anything
 *    carrying `data-cursor="Play"` (the label is the attribute's value);
 *  - magnetic pull: any `.magnetic` element leans toward the pointer and settles back.
 * Both use event delegation on window, so they keep working across page transitions.
 * The native cursor is never hidden: the follower is an accent, not a replacement.
 *
 * Pointer events can fire several times per frame, so the handler only records the latest
 * position and target and schedules one requestAnimationFrame; everything else (the closest()
 * lookups, the label, the magnet) runs at most once per frame, and only when the target changed.
 * A magnet's centre is measured once per entry (minus its own current pull), not on every event,
 * and re-measured (next frame) after a scroll or resize; its x/y setters are quickTo() instances
 * made once per element. Touch pointers are ignored: a touch drag is a scroll, not a cursor.
 */
export function PointerFx() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(`${MQ.motion} and ${MQ.finePointer}`, () => {
      const el = dot.current!;
      gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.16, autoAlpha: 0 });
      // short on purpose: a long smoothing time reads as the dot lagging behind the hand
      const toX = gsap.quickTo(el, "x", { duration: 0.22, ease: "pilot" });
      const toY = gsap.quickTo(el, "y", { duration: 0.22, ease: "pilot" });
      const magnets = new WeakMap<HTMLElement, Magnet>();

      let px = 0, py = 0;
      let target: Element | null = null;
      let lastTarget: Element | null = null;
      let frame = 0;
      let shown = false;
      let current = "";
      let magnet: HTMLElement | null = null;
      let magnetOn: Magnet | null = null;
      let stale = false; // the page moved under the pointer: the magnet's centre needs measuring again

      const magnetFor = (m: HTMLElement): Magnet => {
        let mg = magnets.get(m);
        if (!mg) {
          mg = {
            x: gsap.quickTo(m, "x", { duration: dur.base, ease: "pilot" }),
            y: gsap.quickTo(m, "y", { duration: dur.base, ease: "pilot" }),
            cx: 0, cy: 0,
          };
          magnets.set(m, mg);
        }
        return mg;
      };
      // the element's resting centre: its box minus the pull it currently carries
      const measure = (m: HTMLElement, mg: Magnet) => {
        const r = m.getBoundingClientRect();
        mg.cx = r.left + r.width / 2 - (gsap.getProperty(m, "x") as number);
        mg.cy = r.top + r.height / 2 - (gsap.getProperty(m, "y") as number);
      };
      const release = (m: HTMLElement) => { const mg = magnetFor(m); mg.x(0); mg.y(0); };

      const flush = () => {
        frame = 0;
        if (!shown) {
          gsap.set(el, { x: px, y: py });
          gsap.to(el, { autoAlpha: 1, duration: dur.quick });
          shown = true;
        }
        toX(px);
        toY(py);

        // target-dependent work, only when the pointer moved onto something different
        if (target !== lastTarget) {
          lastTarget = target;
          const t = target instanceof Element ? target : null;
          const text = (t?.closest("[data-cursor]") as HTMLElement | null)?.dataset.cursor ?? "";
          if (text !== current) {
            current = text;
            if (text) label.current!.textContent = text;
            el.toggleAttribute("data-big", Boolean(text));
            gsap.to(el, { scale: text ? 1 : 0.16, duration: dur.quick, ease: "pilot", overwrite: "auto" });
          }
          const m = t?.closest<HTMLElement>(".magnetic") ?? null;
          if (magnet && magnet !== m) release(magnet);
          magnet = m;
          magnetOn = m ? magnetFor(m) : null;
          if (m && magnetOn) measure(m, magnetOn);
        }

        if (magnet && magnetOn) {
          if (stale) { stale = false; measure(magnet, magnetOn); }
          magnetOn.x((px - magnetOn.cx) * 0.28);
          magnetOn.y((py - magnetOn.cy) * 0.38);
        }
      };

      const move = (e: PointerEvent) => {
        // touch drags are scrolls, not a pointer to follow
        if (e.pointerType === "touch") return;
        px = e.clientX;
        py = e.clientY;
        target = e.target instanceof Element ? e.target : null;
        if (!frame) frame = requestAnimationFrame(flush);
      };
      const leave = () => {
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        gsap.to(el, { autoAlpha: 0, duration: dur.quick });
        shown = false;
        if (magnet) release(magnet);
        magnet = null;
        magnetOn = null;
        target = lastTarget = null;
      };
      // scrolling and resizing move the magnet under a still cursor: measure it again next frame
      const invalidate = () => { if (magnetOn) { stale = true; if (!frame) frame = requestAnimationFrame(flush); } };

      const ac = new AbortController();
      const { signal } = ac;
      window.addEventListener("pointermove", move, { passive: true, signal });
      window.addEventListener("scroll", invalidate, { passive: true, signal });
      window.addEventListener("resize", invalidate, { signal });
      document.documentElement.addEventListener("pointerleave", leave, { signal });
      return () => {
        ac.abort();
        if (frame) cancelAnimationFrame(frame);
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
