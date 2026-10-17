"use client";
import { useEffect, useRef, useState } from "react";
import { MQ } from "@/lib/motion/tokens";
import { useBudgetedVideo } from "@/components/media/video-budget";
import type { MediaAsset } from "@/content/work";

/**
 * A rounded media capsule set inline in the hero headline (after prototype 1's hanzo hero).
 * It never stops: real reels play continuously and roll over to the next clip on a beat.
 * The incoming clip rises from below with a slight zoom while the outgoing one lifts away,
 * and both keep playing through the handover, so the capsule never shows a still frame.
 * Only the current and the outgoing clip play, and they play through the shared video budget
 * (current clip first, the outgoing one only if a slot is free), so the capsules never add decoders
 * on top of the rest of the page.
 * Media window: each capsule holds at most three <video> elements, the current clip, the outgoing
 * one while the handover plays, and the next one, created about half a beat before its turn
 * (preload="auto") so its turn starts on a decoded frame, never with a fetch and a decoder start-up
 * in the middle of the handover. A clip is unmounted once its handover has played, so the window
 * slides with the carousel instead of growing until every clip is buffered (a clip that comes round
 * again is re-created from the HTTP cache: processed media is served immutable). The poster sits
 * under every clip, so a clip that is not ready yet shows its still, never an empty frame.
 * Slides fill the capsule (cover, anchored high at 50% 28%: the work is portrait and faces sit
 * in its upper third, so a centred crop beheads people); nothing is ever letterboxed.
 * Reduced motion / no JS: the first clip's poster, still. Offscreen, hidden tab, or `hold` (the
 * desktop scroll scene has taken over the hero): no cycling, nothing playing.
 */
/** The slide transition below (duration-[700ms]) plus a frame or two of slack. */
const HANDOVER_MS = 750;

export function HeroPill({ slides, interval = 2200, tilt = 0, hold = false, className = "" }: {
  slides: MediaAsset[]; interval?: number; tilt?: number; hold?: boolean; className?: string;
}) {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  // the next clip is warmed only after the first handover delay, so it never competes with the
  // page's first paint
  const [warm, setWarm] = useState(false);
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

  const cycling = !still && inView && !hold && slides.length > 1;
  useEffect(() => {
    if (!cycling) return;
    const t = setInterval(() => {
      // a hidden tab still fires (throttled) intervals: no re-render for a capsule nobody sees
      if (document.hidden) return;
      setI((n) => { setPrev(n); return (n + 1) % slides.length; });
    }, interval);
    return () => clearInterval(t);
  }, [cycling, slides.length, interval]);

  // per beat, once the handover has played (one render for both): the outgoing clip, now fully
  // transparent, leaves the window (unmounted, so it stops decoding and its buffer is freed) and
  // the next clip enters it, so it is decoded by the time its turn comes
  useEffect(() => {
    if (!cycling) return;
    const t = setTimeout(() => {
      setPrev(null);
      setWarm(true);
    }, HANDOVER_MS);
    return () => clearTimeout(t);
  }, [i, cycling]);
  const next = (i + 1) % slides.length;

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
        // Posters follow the same window (on screen, outgoing, next): a slide waiting further ahead
        // is an empty frame, so each capsule fetches two posters at load instead of all of them
        // (eight, ~466KB, measured 2026-10-17). The next slide's poster is there a full beat ahead.
        const framed = k === i || k === prev || (!still && k === next);
        // the media window: current, outgoing (during the handover) and, once warm, the next clip.
        // Offscreen or on hold the window only pauses (nothing is re-created on the way back).
        const mounted = s.kind === "video" && !still && (k === i || k === prev || (warm && k === next));
        const playing = inView && !hold && state !== "wait";
        return (
          <span
            key={s.id}
            data-state={state}
            className="absolute inset-0 transition-[translate,scale,opacity,filter] duration-[700ms] ease-[var(--ease-pilot)] data-[state=on]:z-10 data-[state=on]:translate-y-0 data-[state=on]:scale-100 data-[state=on]:opacity-100 data-[state=out]:z-0 data-[state=out]:-translate-y-[55%] data-[state=out]:scale-90 data-[state=out]:opacity-0 data-[state=out]:blur-[2px] data-[state=wait]:translate-y-full data-[state=wait]:scale-[1.18] data-[state=wait]:opacity-0 data-[state=wait]:duration-0"
          >
            {framed && (
              <picture>
                {s.kind === "video" && <source srcSet={s.poster.avif} type="image/avif" />}
                <img src={poster} alt="" loading={k === 0 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-cover object-[50%_28%]" />
              </picture>
            )}
            {mounted && <PillVideo src={s.src.preview} playing={playing} current={state === "on"} />}
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
function PillVideo({ src, playing, current }: { src: string; playing: boolean; current: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  // the current clip outranks the outgoing one when the budget is short of slots
  useBudgetedVideo(ref, playing, 0, current ? 1 : 0.5);
  return (
    <video ref={ref} src={src} muted loop playsInline preload="auto" className="absolute inset-0 h-full w-full object-cover object-[50%_28%]" />
  );
}
