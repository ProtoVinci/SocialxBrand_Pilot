"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";

/**
 * ACT 9 — the promise. "WE WILL SHOW." begins as outlined lanes (the BRAND PILOT stencil)
 * and fills as you arrive; "YOU WILL GROW." grows into place while the route underlines it.
 * The act is set in full logo red: the brightest, warmest moment of the page, just before the footer.
 */
export function Finale() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root.current, start: "top 75%", end: "center 45%", scrub: 0.6 } });
      tl.fromTo(q("[data-fill]"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5 })
        .fromTo(q("[data-grow]"), { scale: 0.82, autoAlpha: 0.25, transformOrigin: "0% 100%" }, { scale: 1, autoAlpha: 1, duration: 0.5 }, 0.2)
        .fromTo(q("[data-underline]"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.4 }, 0.45);
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="finale-title" className="relative overflow-hidden bg-signal py-28 text-ink md:py-40">
      <div className="gutter">
        <h2 id="finale-title" className="font-display text-mega font-bold uppercase [font-stretch:76%]">
          <span className="relative block w-max max-w-full">
            <span className="lane block text-ink/45" aria-hidden>We will show.</span>
            <span data-fill className="absolute inset-0 block text-ink">We will show.</span>
          </span>
          <span data-grow className="relative block w-max max-w-full text-shell">
            You will grow.
            <svg aria-hidden viewBox="0 0 1000 40" preserveAspectRatio="none" className="absolute -bottom-3 left-0 h-6 w-full overflow-visible">
              <path data-underline d="M0 30 C 200 10, 400 38, 620 22 S 900 6, 1000 16" fill="none" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        </h2>
        <div className="mt-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-md text-lede text-ink">
            We don&apos;t simply aim to create digital activity. We aim to create digital impact.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/route" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 font-semibold text-shell transition-transform duration-300 hover:-translate-y-0.5">
              Start your Pilot Route <span aria-hidden>→</span>
            </Link>
            <a href="mailto:socialxbrandpilot@gmail.com" className="inline-flex items-center gap-3 rounded-full border border-ink/40 px-6 py-4 font-medium transition-colors hover:border-ink">
              Email us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
