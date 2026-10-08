"use client";
import { useEffect, useRef, useState } from "react";
import { MQ } from "@/lib/motion/tokens";
import type { MediaAsset } from "@/content/work";

/**
 * A rounded media capsule set inline in the hero headline (after prototype 1's hanzo hero).
 * It never stops: real reels play continuously and roll over to the next clip on a beat.
 * The incoming clip rises from below with a slight zoom while the outgoing one lifts away,
 * and both keep playing through the handover, so the capsule never shows a still frame.
 * Only the current and the outgoing clip play, which keeps decoding to two videos.
 * Each slide's <video> is created once, half a beat before it is first needed, and is then only
 * played and paused: mounting a fresh element on every beat (as before) meant a fetch and a
 * decoder start-up exactly when the handover animated, a visible hitch every second or so.
 * Slides fill the capsule (cover, anchored high at 50% 28%: the work is portrait and faces sit
 * in its upper third, so a centred crop beheads people); nothing is ever letterboxed.
 * Reduced motion / no JS: the first clip's poster, still. Offscreen: paused.
 */
/** The slide transition below (duration-[700ms]) plus a frame or two of slack. */
const HANDOVER_MS = 750;

export function HeroPill({ slides, interval = 2200, tilt = 0, className = "" }: {
  slides: MediaAsset[]; interval?: number; tilt?: number; className?: string;
}) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  // highest slide index whose video exists: the current one, plus the next once it is warmed
  const [reach, setReach] = useState(0);
  const [still, setStill] = useState(true);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLSpanElement>(null);

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
    if (still || !inView || slides.length < 2) return;
    const t = setInterval(() => {
      setI((n) => { setPrev(n); return (n + 1) % slides.length; });
    }, interval);
    return () => clearInterval(t);
  }, [still, inView, slides.length, interval]);

  // per beat, once the handover has played (one render for both): the outgoing clip, now fully
  // transparent, is parked and stops decoding, and the next clip is warmed, so it is decoded by
  // the time its turn comes but never competes with the page's first paint
  useEffect(() => {
    if (still || !inView || slides.length < 2) return;
    const t = setTimeout(() => {
      setPrev(null);
      setReach((r) => Math.max(r, Math.min(slides.length - 1, i + 1)));
    }, HANDOVER_MS);
    return () => clearTimeout(t);
  }, [i, still, inView, slides.length, interval]);

  return (
    <span
      ref={root}
      aria-hidden
      style={{ rotate: `${tilt}deg` }}
      className={`relative mx-[0.12em] inline-block overflow-hidden rounded-[0.32em] bg-ink align-middle shadow-[0_6px_14px_-6px_rgb(28_25_23/0.4),0_2px_5px_rgb(28_25_23/0.15)] ring-1 ring-ink/15 ${className}`}
    >
      {slides.map((s, k) => {
        const state = k === i ? "on" : k === prev ? "out" : "wait";
        const poster = s.kind === "video" ? s.poster.webp : s.srcset.webp[0]?.url;
        // created once reached and kept (offscreen it only pauses, so scrolling back to the hero
        // never re-creates all of them at once); plays while on screen as the current or outgoing clip
        const mounted = s.kind === "video" && !still && k <= reach;
        const playing = inView && state !== "wait";
        return (
          <span
            key={s.id}
            data-state={state}
            className="absolute inset-0 transition-[translate,scale,opacity,filter] duration-[700ms] ease-[var(--ease-pilot)] data-[state=on]:z-10 data-[state=on]:translate-y-0 data-[state=on]:scale-100 data-[state=on]:opacity-100 data-[state=out]:z-0 data-[state=out]:-translate-y-[55%] data-[state=out]:scale-90 data-[state=out]:opacity-0 data-[state=out]:blur-[2px] data-[state=wait]:translate-y-full data-[state=wait]:scale-[1.18] data-[state=wait]:opacity-0 data-[state=wait]:duration-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny pre-sized posters from the media pipeline */}
            <img src={poster} alt="" loading={k === 0 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover object-[50%_28%]" />
            {mounted && <PillVideo src={s.src.preview} playing={playing} />}
          </span>
        );
      })}
      {/* progress dashes */}
      <span className="absolute bottom-[0.12em] left-1/2 z-20 flex -translate-x-1/2 gap-[3px]">
        {slides.map((s, k) => (
          <span key={s.id} className={`h-[2px] rounded-full transition-[width,background-color] duration-300 ${k === i ? "w-3 bg-white" : "w-1 bg-white/45"}`} />
        ))}
      </span>
    </span>
  );
}

/** A capsule clip that is told whether to play, instead of being mounted and unmounted. */
function PillVideo({ src, playing }: { src: string; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) v.play().catch(() => {});
    else v.pause();
  }, [playing]);
  return (
    <video ref={ref} src={src} muted loop playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover object-[50%_28%]" />
  );
}
