"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur, cappedStagger, stagger, scrubSmoothing } from "@/lib/motion/tokens";
import { observeOnce, REVEAL_MARGIN } from "@/lib/motion/observe";

/**
 * A division's own approach chain, as a deck of boarding passes: one perforated ticket per
 * station, headers alternating the logo's blue and red. On desktop the deck starts stacked
 * on the first ticket and deals out into a row as the section scrolls past (after Whenevr's
 * rotate-in fan); on mobile the tickets rise in. Reduced motion / no JS: the row, dealt.
 */
export function ApproachRoute({ steps }: { steps: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.cinema, () => {
      const tickets = q("[data-ticket]") as HTMLElement[];
      // Layout boxes (offsetLeft/Top), never transformed rects, so a refresh mid-deal stays exact.
      // Both axes: with two rows, second-row tickets must climb back up into the deck too.
      const dx = (i: number) => tickets[0].offsetLeft - tickets[i].offsetLeft + i * 6;
      const dy = (i: number) => tickets[0].offsetTop - tickets[i].offsetTop - i * 3;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 30%", scrub: scrubSmoothing(0.6), invalidateOnRefresh: true },
      });
      // One from() per ticket rather than a staggered from(): a stagger is built as a sub-timeline
      // and immediateRender then only paints the first target, so the rest sat dealt out until
      // the trigger began and jumped back into the deck. Each tween here paints its deck state now.
      tickets.forEach((t, i) => {
        tl.from(t, { x: () => dx(i), y: () => dy(i), rotate: (i % 2 ? 5 : -5) + i * 0.6, immediateRender: true }, i * 0.04);
      });
    });
    mm.add(MQ.pocket, () => {
      const tickets = q("[data-ticket]");
      gsap.set(tickets, { autoAlpha: 0, y: 28 });
      return observeOnce([root.current!], REVEAL_MARGIN, () => {
        gsap.to(tickets, { autoAlpha: 1, y: 0, duration: dur.base, ease: "pilot", stagger: cappedStagger(steps.length, stagger.cards) });
      });
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [steps.length] });

  return (
    <div ref={root}>
      {/* balanced rows: up to 8 stations sit on one line (lg+); longer routes split evenly
          (10 → 5 + 5), and tablets always split so no ticket is narrower than a header */}
      <ol
        className="grid gap-3 sm:grid-cols-2 md:[grid-template-columns:repeat(var(--cols-md),minmax(0,1fr))] lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{
          "--cols": steps.length <= 8 ? steps.length : Math.ceil(steps.length / 2),
          "--cols-md": steps.length <= 5 ? steps.length : Math.ceil(steps.length / 2),
        } as React.CSSProperties}
      >
        {steps.map((s, i) => (
          <li
            key={s}
            data-ticket
            style={{ zIndex: steps.length - i }}
            className="relative flex min-h-[9rem] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_14px_30px_-18px_rgba(28,25,23,0.35)] ring-1 ring-ink/10"
          >
            <div className={`flex items-center justify-between px-3.5 py-2.5 ${i % 2 ? "bg-rouge text-ink" : "bg-iris text-ink"}`}>
              <span className="label">Stn {String(i + 1).padStart(2, "0")}</span>
              <span aria-hidden className="label">{i === steps.length - 1 ? "Arr" : "→"}</span>
            </div>
            {/* perforation: a dashed tear line with notches cut from both edges */}
            <div aria-hidden className="relative mx-3.5 border-t border-dashed border-ink/20">
              <span className="absolute -left-[1.35rem] -top-2 size-4 rounded-full bg-shell ring-1 ring-ink/10" />
              <span className="absolute -right-[1.35rem] -top-2 size-4 rounded-full bg-shell ring-1 ring-ink/10" />
            </div>
            {/* boarding-pass data: where this leg comes from */}
            <span className="label mt-3 px-3.5 text-ink/55">
              {i === 0 ? "Departs" : <>From <span className="text-ink/80">{steps[i - 1]}</span></>}
            </span>
            <span className="mt-auto px-3.5 pb-4 pt-3 font-display text-[1.1rem] font-medium leading-tight md:text-[clamp(1.05rem,1.35vw,1.4rem)]">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
