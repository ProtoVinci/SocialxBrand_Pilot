"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";
import { principles } from "@/content/site";
import { pad } from "@/content/divisions";

/**
 * "What we stand for" as a sticky deck: each principle card sticks a little lower than the
 * last, and is pressed back (scale + dim) as the next one lands on it, so they read as layers
 * of one stance rather than six separate claims.
 */
export function PrincipleStack() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      cards.forEach((card, i) => {
        const nextCard = cards[i + 1];
        if (!nextCard) return;
        gsap.to(card.firstElementChild, {
          scale: 0.94, autoAlpha: 0.45, ease: "none",
          scrollTrigger: { trigger: nextCard, start: "top bottom", end: "top 30%", scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <div ref={root} className="flex flex-col gap-6">
      {principles.map((p, i) => (
        <div key={p.title} data-card className="sticky" style={{ top: `calc(var(--nav-h) + 1.5rem + ${i * 18}px)` }}>
          <article className={`origin-top rounded-[22px] border border-paper/10 p-8 md:p-12 ${i % 2 === 0 ? "bg-ink-2" : "bg-ink-3"}`}>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="label text-signal">{pad(i + 1)} / {pad(principles.length)}</span>
                <h3 className="mt-4 font-display text-headline font-semibold [font-stretch:82%]">{p.title}</h3>
              </div>
              <p className="max-w-sm text-lede text-paper/75 md:text-right">{p.body}</p>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
