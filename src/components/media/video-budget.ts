"use client";
// Caps how many <video> elements decode at once. Visible videos request a slot; when the
// budget is full the least-visible playing video yields. Desktop 3, small screens 2.

type Entry = { el: HTMLVideoElement; ratio: number; priority: number };

const playing = new Map<HTMLVideoElement, Entry>();

const limit = () => (typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 3);

export function requestPlay(el: HTMLVideoElement, ratio: number, priority = 0) {
  playing.set(el, { el, ratio, priority });
  const ranked = [...playing.values()].sort((a, b) => b.priority - a.priority || b.ratio - a.ratio);
  ranked.forEach((entry, i) => {
    if (i < limit()) {
      if (entry.el.paused) entry.el.play().catch(() => {});
    } else {
      entry.el.pause();
    }
  });
}

export function release(el: HTMLVideoElement) {
  playing.delete(el);
  el.pause();
}
