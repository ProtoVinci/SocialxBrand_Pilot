"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";
import { site } from "@/content/site";
import { SpinBadge } from "@/components/fx/SpinBadge";

/**
 * ACT 9 — the promise. "WE WILL SHOW." begins as outlined lanes (the BRAND PILOT stencil)
 * and fills as you arrive; "YOU WILL GROW." grows into place while the route underlines it.
 * The act is a red gradient field (the complement of the Codex cornflower), just before the footer.
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
    <section ref={root} aria-labelledby="finale-title" className="act-rouge relative overflow-hidden py-28 md:py-40">
      <div className="absolute right-[clamp(1rem,6vw,6rem)] top-[18%] hidden scale-125 lg:block">
        <SpinBadge />
      </div>
      <div className="gutter">
        <h2 id="finale-title" className="font-display text-mega font-medium uppercase">
          <span className="relative block w-max max-w-full">
            <span className="lane block text-ink/45" aria-hidden>We will show.</span>
            <span data-fill className="absolute inset-0 block text-ink">We will show.</span>
          </span>
          <span data-grow className="relative block w-max max-w-full text-white">
            You will grow.
            {/* sits fully below the glyph box (white on white would vanish) and stays in its lower half */}
            <svg aria-hidden viewBox="0 0 1000 40" preserveAspectRatio="none" className="absolute -bottom-8 left-0 h-6 w-full overflow-visible">
              <path data-underline d="M0 26 C 200 20, 400 32, 620 25 S 900 20, 1000 23" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
        </h2>
        <div className="mt-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-md text-lede text-ink">
            We don&apos;t simply aim to create digital activity. We aim to create digital impact.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/route" transitionTypes={["nav-forward"]} className="magnetic inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 font-semibold text-shell transition-colors duration-300 hover:bg-ink/85">
              Start your Pilot Route <span aria-hidden>→</span>
            </Link>
            <a href={`mailto:${site.email}`} className="inline-flex items-center gap-3 rounded-full border border-ink/40 px-6 py-4 font-medium transition-colors hover:border-ink">
              Email us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
