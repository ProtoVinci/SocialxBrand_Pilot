"use client";
import { useEffect, useRef, useState } from "react";
import { MQ } from "@/lib/motion/tokens";
import type { MediaAsset } from "@/content/work";

/**
 * A rounded media capsule set inline in the hero headline (after prototype 1's hanzo hero).
 * It cycles through real work: stills crossfade, and the active video slide plays its short
 * preview. Hover pauses the cycle. Reduced motion / no JS: the first slide, still.
 * Slides fill the capsule (cover); nothing is ever letterboxed.
 */
export function HeroPill({ slides, interval = 1600, tilt = 0, className = "" }: {
  slides: MediaAsset[]; interval?: number; tilt?: number; className?: string;
}) {
  const [i, setI] = useState(0);
  const [held, setHeld] = useState(false);
  const [still, setStill] = useState(true);
  const root = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MQ.reduce);
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(root.current!);
    return () => { mq.removeEventListener("change", sync); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (still || held || !inView || slides.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [still, held, inView, slides.length, interval]);

  return (
    <span
      ref={root}
      aria-hidden
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      style={{ rotate: `${tilt}deg` }}
      className={`relative mx-[0.12em] inline-block overflow-hidden rounded-[0.32em] align-middle shadow-[0_6px_14px_-6px_rgb(28_25_23/0.4),0_2px_5px_rgb(28_25_23/0.15)] ring-1 ring-ink/15 transition-transform duration-300 ease-[var(--ease-pilot)] hover:scale-[1.04] ${className}`}
    >
      {slides.map((s, k) => {
        const on = k === i;
        const poster = s.kind === "video" ? s.poster.webp : s.srcset.webp[0]?.url;
        return (
          <span key={s.id} className={`absolute inset-0 transition-[opacity,scale] duration-[350ms] ease-out ${on ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized posters from the media pipeline */}
            <img src={poster} alt="" loading={k === 0 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover" />
            {s.kind === "video" && on && !still && inView && (
              <video src={s.src.preview} muted loop playsInline autoPlay preload="none" className="absolute inset-0 h-full w-full object-cover" />
            )}
          </span>
        );
      })}
      {/* progress dashes */}
      <span className="absolute bottom-[0.12em] left-1/2 flex -translate-x-1/2 gap-[3px]">
        {slides.map((s, k) => (
          <span key={s.id} className={`h-[2px] rounded-full transition-all duration-300 ${k === i ? "w-3 bg-white" : "w-1 bg-white/45"}`} />
        ))}
      </span>
    </span>
  );
}
