"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";
import { divisions, pad } from "@/content/divisions";

/**
 * Two rows of all 18 division names drifting in opposite directions. Every pill is a real
 * link, and hovering a row slows it to a crawl so it can be clicked. Paused under reduced
 * motion and off-screen; the rows become plain wrapped lists without JS.
 */
export function DivisionTicker() {
  const root = useRef<HTMLDivElement>(null);
  const rows = [divisions.slice(0, 9), divisions.slice(9)];

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const tweens = gsap.utils.toArray<HTMLElement>("[data-ticker-track]").map((track, i) => {
        const dir = i % 2 === 0 ? -1 : 1;
        gsap.set(track, { xPercent: dir === -1 ? 0 : -50 });
        return gsap.to(track, { xPercent: dir === -1 ? -50 : 0, duration: i % 2 === 0 ? 46 : 58, ease: "none", repeat: -1 });
      });
      const slow = (t: gsap.core.Tween, v: number) => gsap.to(t, { timeScale: v, duration: 0.6, overwrite: true });
      root.current!.querySelectorAll("[data-ticker-row]").forEach((row, i) => {
        row.addEventListener("pointerenter", () => slow(tweens[i], 0.12));
        row.addEventListener("pointerleave", () => slow(tweens[i], 1));
      });
      const io = new IntersectionObserver(([e]) => tweens.forEach((t) => (e.isIntersecting ? t.play() : t.pause())));
      io.observe(root.current!);
      return () => io.disconnect();
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <div ref={root} className="flex flex-col gap-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} data-ticker-row className="overflow-hidden">
          <ul data-ticker-track className="flex w-max gap-3 [html:not(.js-motion)_&]:w-auto [html:not(.js-motion)_&]:flex-wrap">
            {[...row, ...row].map((d, i) => (
              <li key={`${d.slug}-${i}`} aria-hidden={i >= row.length ? true : undefined}>
                <Link
                  href={`/capabilities/${d.slug}`}
                  tabIndex={i >= row.length ? -1 : undefined}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-full border px-5 py-3 text-sm transition-colors duration-300 hover:border-signal hover:bg-signal hover:text-ink ${
                    r === 0 ? "border-paper/15" : "border-violet/40 text-paper/90"
                  }`}
                >
                  <span className="label opacity-60">{pad(d.number)}</span>
                  {d.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
