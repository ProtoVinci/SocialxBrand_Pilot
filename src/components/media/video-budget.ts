"use client";
// Caps how many <video> elements decode at once, for every video on the site (Reel, the hero
// capsules, the home work showcase). A video that wants to play requests a slot; when the budget is
// full the lowest-ranked one (priority, then how much of it is visible) waits paused, and it gets
// its slot back as soon as one is released. Desktop 3, small screens 2.
//   - a wanted video keeps its claim while it waits; release() drops it (and pauses the element)
//   - an element that has left the document without a release() is dropped at the next change, so a
//     claim can never stay stuck on an unmounted video
//   - while the tab is hidden nothing plays; the same videos resume when it is shown again
//   - play() rejections (autoplay blocked, a pause() racing a pending play()) are swallowed: the
//     poster underneath stays visible

import { useEffect, type RefObject } from "react";

type Entry = { el: HTMLVideoElement; ratio: number; priority: number };

const wanted = new Map<HTMLVideoElement, Entry>();

const limit = () => (typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 3);

let watching = false;
const watchVisibility = () => {
  if (watching || typeof document === "undefined") return;
  watching = true;
  document.addEventListener("visibilitychange", rebalance);
};

function rebalance() {
  for (const el of wanted.keys()) if (!el.isConnected) wanted.delete(el);
  const hidden = document.visibilityState === "hidden";
  const ranked = [...wanted.values()].sort((a, b) => b.priority - a.priority || b.ratio - a.ratio);
  ranked.forEach((entry, i) => {
    if (!hidden && i < limit()) {
      if (entry.el.paused) entry.el.play().catch(() => {});
    } else if (!entry.el.paused) {
      entry.el.pause();
    }
  });
}

export function requestPlay(el: HTMLVideoElement, ratio: number, priority = 0) {
  watchVisibility();
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
