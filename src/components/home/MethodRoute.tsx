"use client";
import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { method } from "@/content/site";
import { pad } from "@/content/divisions";

// Stations sit on segment ends in a 1000×300 box, so HTML labels can be placed by percent.
const PTS = method.map((_, i) => ({ x: 60 + (i * 880) / (method.length - 1), y: i % 2 === 0 ? 205 : 105 }));
const PATH = PTS.reduce((d, p, i) => {
  if (i === 0) return `M0 230 C 25 225, 40 ${p.y}, ${p.x} ${p.y}`;
  const prev = PTS[i - 1];
  const mid = (prev.x + p.x) / 2;
  return `${d} C ${mid} ${prev.y}, ${mid} ${p.y}, ${p.x} ${p.y}`;
}, "") + ` C 970 ${PTS.at(-1)!.y}, 985 60, 1000 40`;

/**
 * ACT 6 — The Route. The method is not read, it is travelled: the signal line draws
 * through seven stations as you scroll. Each arrival lights the station and the "now" panel
 * explains it. Opens on the agency's first principle: we start by understanding the business.
 * Mobile/reduced: a vertical rail of the same seven steps.
 */
export function MethodRoute() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(MQ.cinema, () => {
      const stations = q("[data-station]");
      const panels = q("[data-now]");
      let current = -1;
      const activate = (i: number) => {
        if (i === current) return;
        stations.forEach((s, k) => s.toggleAttribute("data-on", k <= i));
        panels.forEach((p, k) => {
          // the incoming panel waits for the outgoing one to clear, so two titles never overlap
          if (k === i) gsap.fromTo(p, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: dur.base, delay: dur.quick, ease: "pilot", overwrite: true });
          else gsap.to(p, { autoAlpha: 0, y: k < i ? -20 : 20, duration: dur.quick, ease: "snap", overwrite: true });
        });
        current = i;
      };
      gsap.set(panels, { autoAlpha: 0 });
      activate(0);
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current, start: "top top", end: "+=320%", pin: true, scrub: 0.6,
          onUpdate: (self) => activate(Math.min(method.length - 1, Math.floor(self.progress * method.length * 0.999))),
        },
      }).fromTo(q("[data-route-path]"), { drawSVG: "0%" }, { drawSVG: "100%" });
    });

    mm.add(MQ.pocket, () => {
      gsap.fromTo(q("[data-rail]"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: q("[data-steps]")[0], start: "top 70%", end: "bottom 60%", scrub: 0.5 } });
      ScrollTrigger.batch(q("[data-step]"), { start: "top 85%", once: true, onEnter: (b) => gsap.from(b, { autoAlpha: 0, x: 24, duration: dur.base, stagger: 0.08 }) });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="method-title" className="relative overflow-hidden bg-petal py-24 cinema:flex cinema:h-svh cinema:flex-col cinema:justify-between cinema:py-0 cinema:pb-14 cinema:pt-[calc(var(--nav-h)+2.5rem)]">
      <div className="gutter flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-muted">[ 05 ] How we work — the route</p>
          <h2 id="method-title" className="mt-4 max-w-[16ch] font-display text-headline font-semibold [font-stretch:82%]">
            We start by <span className="serif-accent font-normal text-signal">understanding</span> the business.
          </h2>
        </div>
        <p className="max-w-sm text-ink/70">Seven stations, in order. Strategy comes before execution, and every stage feeds the next.</p>
      </div>

      {/* desktop: the drawn route */}
      <div className="relative mx-[clamp(1rem,4vw,3.5rem)] hidden h-[34svh] cinema:block" aria-hidden>
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <path d={PATH} fill="none" stroke="rgba(29,19,56,0.14)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path data-route-path d={PATH} fill="none" stroke="#ff3131" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        </svg>
        {PTS.map((p, i) => (
          <div
            key={method[i].id}
            data-station
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x / 10}%`, top: `${p.y / 3}%` }}
          >
            <span className="block h-3.5 w-3.5 rounded-full border border-ink/40 bg-petal transition-[background-color,border-color,transform] duration-500 group-data-[on]:scale-125 group-data-[on]:border-signal group-data-[on]:bg-signal" />
            <span className={`label absolute left-1/2 w-max -translate-x-1/2 text-muted transition-colors duration-500 group-data-[on]:text-ink ${i % 2 === 0 ? "top-6" : "bottom-6"}`}>
              {pad(i + 1)} {method[i].name}
            </span>
          </div>
        ))}
      </div>

      {/* desktop: the "now" panel */}
      <div className="gutter relative hidden h-[18svh] cinema:block">
        {method.map((m, i) => (
          <div key={m.id} data-now className="absolute inset-x-[clamp(1rem,4vw,3.5rem)] top-0 grid grid-cols-12 items-start gap-6">
            <span className="lane col-span-3 font-display text-[clamp(4rem,9vw,9rem)] font-bold leading-[0.8] text-ink/70 [font-stretch:75%]">{pad(i + 1)}</span>
            <div className="col-span-6">
              <h3 className="font-display text-headline font-semibold [font-stretch:82%]">{m.name}</h3>
              <p className="mt-3 max-w-xl text-lede text-ink/75">{m.body}</p>
            </div>
            <p className="col-span-3 text-sm text-muted">{m.detail}</p>
          </div>
        ))}
      </div>

      {/* mobile / reduced: the vertical rail */}
      <ol data-steps className="gutter relative mt-14 flex flex-col gap-10 cinema:hidden">
        <span data-rail aria-hidden className="absolute bottom-2 left-[calc(clamp(1rem,4vw,3.5rem)+0.4rem)] top-2 w-px origin-top bg-signal" />
        {method.map((m, i) => (
          <li key={m.id} data-step className="relative pl-10">
            <span aria-hidden className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border border-signal bg-petal" />
            <span className="label text-signal-ink">{pad(i + 1)}</span>
            <h3 className="mt-1 font-display text-title font-semibold [font-stretch:85%]">{m.name}</h3>
            <p className="mt-2 text-ink/75">{m.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
