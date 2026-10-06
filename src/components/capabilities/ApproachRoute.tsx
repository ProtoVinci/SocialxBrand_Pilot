"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur, revealStart, cappedStagger, stagger } from "@/lib/motion/tokens";

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
      // layout boxes (offsetLeft), never transformed rects, so a refresh mid-deal stays exact
      const first = () => tickets[0].offsetLeft;
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 30%", scrub: 0.6, invalidateOnRefresh: true },
      }).from(tickets, {
        x: (i) => first() - tickets[i].offsetLeft + i * 6,
        y: (i) => i * -3,
        rotate: (i) => (i % 2 ? 5 : -5) + i * 0.6,
        stagger: 0.04,
      });
    });
    mm.add(MQ.pocket, () => {
      gsap.from(q("[data-ticket]"), {
        autoAlpha: 0, y: 28, duration: dur.base, ease: "pilot",
        stagger: cappedStagger(steps.length, stagger.cards),
        scrollTrigger: { trigger: root.current, start: revealStart, once: true },
      });
    });
    return () => mm.revert();
  }, { scope: root, dependencies: [steps.length] });

  return (
    <div ref={root}>
      <ol
        className="grid gap-3 sm:grid-cols-2 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": Math.min(steps.length, 8) } as React.CSSProperties}
      >
        {steps.map((s, i) => (
          <li
            key={s}
            data-ticket
            style={{ zIndex: steps.length - i }}
            className="relative flex min-h-[7.5rem] flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_14px_30px_-18px_rgba(18,18,26,0.35)] ring-1 ring-ink/10"
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
            <span className="mt-auto px-3.5 pb-4 pt-5 font-display text-[1.05rem] font-semibold leading-tight [font-stretch:88%] md:text-[clamp(0.95rem,1.15vw,1.2rem)]">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
