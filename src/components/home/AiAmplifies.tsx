"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { aiPhilosophy } from "@/content/site";

/**
 * ACT 8 — AI amplifies. Each "should not replace" line is struck through by the signal
 * line, then its replacement rises beneath it. AI is framed as division 18, not the brand.
 */
export function AiAmplifies() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.utils.toArray<HTMLElement>("[data-pair]").forEach((pair) => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: pair, start: "top 85%", once: true } });
        tl.from(pair.querySelector("[data-not]"), { autoAlpha: 0, y: 20, duration: dur.base })
          .from(pair.querySelector("[data-strike]"), { scaleX: 0, duration: dur.base, ease: "glide" }, "-=0.2")
          .to(pair.querySelector("[data-not]"), { opacity: 0.35, duration: dur.quick }, "<0.2")
          .from(pair.querySelector("[data-should]"), { yPercent: 110, duration: dur.slow }, "<0.1");
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} aria-labelledby="ai-title" className="relative bg-shell py-28 md:py-40">
      <div className="gutter grid gap-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="label text-muted">[ 07 ] Division 18 — AI Marketing &amp; Automation</p>
          <h2 id="ai-title" className="mt-4 font-display text-headline font-semibold [font-stretch:82%]">
            Our <span className="serif-accent font-normal text-violet">AI</span> philosophy.
          </h2>
          <p className="mt-6 max-w-sm text-ink/70">
            AI is treated as a marketing and productivity layer supporting human strategy, creativity and execution.
          </p>
          <Link href="/capabilities/ai-marketing-automation" transitionTypes={["nav-forward"]} className="link-underline mt-8 inline-block text-ink">
            Explore AI Marketing &amp; Automation →
          </Link>
        </div>
        <ul className="flex flex-col gap-14 md:col-span-8">
          {aiPhilosophy.map((p) => (
            <li key={p.should} data-pair>
              <p data-not className="relative inline-block font-display text-title font-semibold text-ink/80 [font-stretch:88%]">
                {p.not}
                <span data-strike aria-hidden className="absolute left-0 right-0 top-[52%] h-[0.07em] origin-left bg-signal" />
              </p>
              <span className="mt-2 block overflow-hidden">
                <span data-should className="block font-display text-headline font-semibold [font-stretch:80%]">
                  {p.should.replace(/\.$/, "")}<span className="text-signal">.</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
