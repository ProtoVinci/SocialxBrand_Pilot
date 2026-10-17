"use client";
// Caps how many <video> elements decode at once, for every video on the site (Reel, the hero
// capsules, the home work showcase). A video that wants to play requests a slot; when the budget is
// full the lowest-ranked one (priority, then how much of it is visible) waits paused, and it gets
// its slot back as soon as one is released. Desktop 3, small screens 2.
// It is a PLAYBACK (decoder) budget, not a download budget: a video with preload="auto", or one
// whose fetch started before it lost its slot, still downloads. Components keep their own clips on
// preload="none" (or a deliberately bounded preload, like the hero capsules' next clip).
//   - a wanted video keeps its claim while it waits; release() drops it (and pauses the element)
//   - an element that has left the document without a release() is dropped at the next change, so a
//     claim can never stay stuck on an unmounted video
//   - while the tab is hidden nothing plays; the same videos resume when it is shown again
//   - crossing the 768px breakpoint re-ranks at once (3 → 2 slots pauses the lowest-ranked one)
//   - play() rejections (autoplay blocked, a pause() racing a pending play()) are swallowed: the
//     poster underneath stays visible
//   - one cold start at a time: a video with no decoded frame yet (its fetch and decoder start-up
//     still ahead) starts only when no other cold start is in flight; the next one goes when it can
//     play, errors, stalls or is released. Without this, a row of work cards scrolling into view
//     started three downloads and three decoders in the same frame (Pilot6 audit P1.4, 2026-10-17).
//     Videos that already have data (resumed, or the capsules' warmed next clip) start at once.

import { useEffect, type RefObject } from "react";

type Entry = { el: HTMLVideoElement; ratio: number; priority: number };

const wanted = new Map<HTMLVideoElement, Entry>();

// the one cold start in flight, and how to stop listening for its end
let starting: { el: HTMLVideoElement; done: AbortController } | null = null;
const SETTLED = ["canplay", "playing", "error", "stalled", "abort", "emptied"] as const;

function endStart() {
  starting?.done.abort();
  starting = null;
}

function start(el: HTMLVideoElement) {
  if (el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    if (starting) return; // another cold start is under way: wait for it
    const done = new AbortController();
    starting = { el, done };
    const next = () => { if (starting?.el === el) { endStart(); rebalance(); } };
    for (const type of SETTLED) el.addEventListener(type, next, { once: true, signal: done.signal });
  }
  // a rejected play() (autoplay blocked) frees the gate without retrying: the next rebalance moves on
  el.play().catch(() => { if (starting?.el === el) endStart(); });
}

const SMALL = "(max-width: 767.98px)";
const limit = () => (typeof window !== "undefined" && window.matchMedia(SMALL).matches ? 2 : 3);

// registered once, on the first request (module-level, like the budget itself; never removed)
let watching = false;
const watch = () => {
  if (watching || typeof document === "undefined") return;
  watching = true;
  document.addEventListener("visibilitychange", rebalance);
  window.matchMedia(SMALL).addEventListener("change", rebalance);
};

function rebalance() {
  for (const el of wanted.keys()) if (!el.isConnected) wanted.delete(el);
  // a start that no longer wants to play (released, unmounted) holds up nothing
  if (starting && !wanted.has(starting.el)) endStart();
  const hidden = document.visibilityState === "hidden";
  const ranked = [...wanted.values()].sort((a, b) => b.priority - a.priority || b.ratio - a.ratio);
  ranked.forEach((entry, i) => {
    if (!hidden && i < limit()) {
      if (entry.el.paused) start(entry.el);
    } else if (!entry.el.paused) {
      if (starting?.el === entry.el) endStart();
      entry.el.pause();
    }
  });
}

export function requestPlay(el: HTMLVideoElement, ratio: number, priority = 0) {
  watch();
  wanted.set(el, { el, ratio, priority });
  rebalance();
}

export function release(el: HTMLVideoElement) {
  const had = wanted.delete(el);
  el.pause();
  // a slot opened: a video that was waiting for one starts now
  if (had) rebalance();
}

/**
 * Plays `ref`'s video through the budget while `active` is true; pauses and releases it when
 * `active` turns false or the component unmounts. For components that own a raw <video>.
 */
export function useBudgetedVideo(ref: RefObject<HTMLVideoElement | null>, active: boolean, priority = 0, ratio = 1) {
  // a change of rank only re-ranks the claim (no pause in between); turning inactive releases it
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) requestPlay(el, ratio, priority);
    else release(el);
  }, [ref, active, priority, ratio]);
  useEffect(() => {
    const el = ref.current;
    return () => { if (el) release(el); };
  }, [ref]);
}
