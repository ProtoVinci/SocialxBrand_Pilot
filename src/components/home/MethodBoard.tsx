"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur, scrubSmoothing } from "@/lib/motion/tokens";
import { observeOnce, REVEAL_MARGIN } from "@/lib/motion/observe";
import { method } from "@/content/site";
import { pad } from "@/lib/pad";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const STATUS = { next: "Next", now: "Boarding", done: "Cleared" } as const;

/**
 * ACT 6 — The Pilot Route, as a departures board. The seven method stations are rows on a
 * split-flap board; scrolling through the pinned act boards them in order. The active row
 * floods cobalt; every station name starts scrambled and flaps through the alphabet
 * to land on its word as its row is reached; its detail line
 * opens and its status turns Next → Boarding → Cleared. The red signal line runs down the
 * board as progress. Mobile: no pin, each row flaps once as it enters. Reduced motion /
 * no JS: a still board with every line visible.
 */
export function MethodBoard({ index = "05" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);

  // Not useGSAPNear: scrambling the station names changes what the rows are made of, so it has to be
  // done at load, long before the board is visible. Set up on arrival it shifted the layout (CLS) when
  // the page was jumped to the board.
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    // Split-flap: each tile drops (rotateX) through a few letters, then lands on its own.
    // One yoyo tween per tile (out to edge-on, back, out again...), with the letter swapped at each
    // edge-on turn, and one timeline per row holding them: it used to be a timeline per tile with a
    // pair of tweens and a callback per flip (8-15 objects per tile, a few hundred per board).
    // Letters cycle deterministically (no randomness at scroll time). Every row timeline is tracked
    // here and killed on cleanup, since they are created later, from scroll callbacks.
    const glyph = (seed: number) => GLYPHS[((seed % GLYPHS.length) + GLYPHS.length) % GLYPHS.length];
    const flips = new Set<gsap.core.Timeline>();
    const flap = (row: Element, delay = 0) => {
      const tl = gsap.timeline({ delay, onComplete: () => { flips.delete(tl); } });
      row.querySelectorAll<HTMLElement>("[data-ch]").forEach((tile, i) => {
        const final = tile.dataset.ch ?? "";
        if (final === " ") return;
        const count = 3 + (i % 3);
        let turn = 0;
        tl.to(tile, {
          rotateX: -90, duration: dur.micro / 3, ease: "none", transformPerspective: 400,
          // 2 × count half-flips end flat again; every odd one ends edge-on, where the letter changes
          repeat: count * 2 - 1, yoyo: true,
          onRepeat: () => {
            if (++turn % 2 === 0) return;
            const k = (turn + 1) / 2;
            tile.textContent = k >= count ? final : glyph(final.charCodeAt(0) + i * 5 + k * 7);
          },
          onComplete: () => { tile.textContent = final; },
        }, i * 0.03);
      });
      flips.add(tl);
    };
    // a row that never gets its turn on screen (skipped by a fast scroll, or reached at load) lands
    // on its words directly, without a flap
    const settle = (row: Element) => row.querySelectorAll<HTMLElement>("[data-ch]").forEach((t) => { t.textContent = t.dataset.ch ?? ""; });

    // every station name starts scrambled (JS motion only: SSR / no-JS / reduced motion keep the
    // real words) and resolves the first time its row is reached
    const scramble = (rows: Element[]) => rows.forEach((r) => {
      delete (r as HTMLElement).dataset.revealed;
      r.querySelectorAll<HTMLElement>("[data-ch]").forEach((t, i) => {
        const ch = t.dataset.ch ?? "";
        if (ch !== " ") t.textContent = glyph(ch.charCodeAt(0) + i * 3);
      });
    });
    // Only a tile caught mid-flip needs its transform reset (one at rest is already flat). Resetting
    // every tile (a gsap.set per tile, each reading its computed style right after the previous
    // tile's text changed) forced a style recalculation per tile, a few hundred of them, and made
    // leaving the home page stall.
    const restore = (rows: Element[]) => {
      flips.forEach((tl) => tl.kill());
      flips.clear();
      const tiles = rows.flatMap((r) => [...r.querySelectorAll<HTMLElement>("[data-ch]")]);
      const flipping = tiles.filter((t) => gsap.isTweening(t));
      gsap.killTweensOf(tiles);
      tiles.forEach((t) => { t.textContent = t.dataset.ch ?? ""; });
      if (flipping.length) gsap.set(flipping, { rotateX: 0 });
    };
    const reveal = (r: HTMLElement, animate: boolean, delay = 0) => {
      if (r.dataset.revealed) return;
      r.dataset.revealed = "1";
      if (animate) flap(r, delay);
      else settle(r);
    };

    // `animate`: only the row that becomes the boarding one flaps; rows passed on the way (a fast
    // scroll, a restored scroll position) resolve directly instead of all flapping at once
    const setState = (rows: HTMLElement[], i: number, animate = true) =>
      rows.forEach((r, k) => {
        const state = k < i ? "done" : k === i ? "now" : "next";
        if (r.dataset.state === state) return;
        r.dataset.state = state;
        const status = r.querySelector("[data-status]");
        if (status) status.textContent = STATUS[state];
        if (state !== "next") reveal(r, animate && state === "now");
      });

    mm.add(MQ.cinema, () => {
      const rows = q("[data-row]") as HTMLElement[];
      scramble(rows);
      // the first station is set (and resolved) without a flap: the board is far below the fold at load
      setState(rows, 0, false);
      let current = 0;
      gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          // CSS sticky does the holding (see the markup), not a GSAP pin: a pin only engages on the
          // next scroll tick, so landing mid-board (back button, Back to top, restored scroll)
          // drew the board a screen out of place for a frame. Sticky is applied by the browser.
          trigger: root.current, start: "top top", end: "bottom bottom", scrub: scrubSmoothing(0.6),
          onUpdate: (self) => {
            // the last ~6% of the pin is the arrival: every station cleared before the board leaves
            const i = self.progress > 0.94 ? method.length : Math.min(method.length - 1, Math.floor((self.progress / 0.94) * method.length * 0.999));
            if (i !== current) { setState(rows, i); current = i; }
          },
        },
      }).fromTo(q("[data-progress]"), { scaleY: 0 }, { scaleY: 1 });
      return () => { rows.forEach((r) => { delete r.dataset.state; }); restore(rows); };
    });

    mm.add(MQ.pocket, () => {
      const rows = q("[data-row]");
      scramble(rows);
      // one observer for all rows (no per-row ScrollTriggers: they slow every refresh)
      const stop = observeOnce(rows, REVEAL_MARGIN, (batch) => batch.forEach((row, k) => reveal(row as HTMLElement, true, k * 0.12)));
      return () => { stop?.(); restore(rows); };
    });

    return () => mm.revert();
  }, { scope: root });

  return (
    // the section is 400svh tall in cinema (one screen + 300% of scroll for the stations);
    // the board screen inside it sticks to the top while that distance is scrolled
    <section ref={root} aria-labelledby="method-title" className="relative cinema:h-[400svh]">
    <div className="relative isolate overflow-hidden bg-shell py-24 cinema:sticky cinema:top-0 cinema:flex cinema:h-svh cinema:flex-col cinema:justify-center cinema:py-0 cinema:pt-[var(--nav-h)]">
      <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 -z-10" />
      <div className="gutter flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-blue">[ {index} ] How we work — the Pilot Route</p>
          <h2 id="method-title" className="mt-4 max-w-[24ch] font-display text-headline font-medium">
            We start by <span className="serif-accent font-normal ink-cobalt">understanding</span> the business.
          </h2>
        </div>
        <p className="max-w-sm text-ink/70">Seven stations, in order. Strategy comes before execution, and every stage feeds the next.</p>
      </div>

      <div className="gutter mt-10 md:mt-8">
        <div className="relative overflow-hidden rounded-[22px] border border-ink/10 bg-petal">
          {/* board header */}
          <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-5 py-2.5 md:px-7">
            <span className="label text-ink">Departures<span className="max-sm:hidden"> · The Pilot Route</span></span>
          </div>
          <div aria-hidden className="hidden grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.6fr)_8.5rem] gap-6 border-b border-ink/10 px-7 py-2 md:grid">
            {["Stn", "Station", "What happens", "Status"].map((h) => <span key={h} className="label text-blue">{h}</span>)}
          </div>

          {/* the red signal line: progress down the board */}
          <span data-progress aria-hidden className="absolute bottom-0 left-0 top-0 hidden w-[3px] origin-top bg-signal cinema:block" />

          <ol>
            {method.map((m, i) => (
              <li
                key={m.id}
                data-row
                className="group relative isolate grid grid-cols-[3.6rem_1fr] items-center gap-x-4 gap-y-2 border-b border-ink/10 px-5 py-5 last:border-b-0 md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.6fr)_8.5rem] md:gap-6 md:px-7 cinema:min-h-[clamp(2.9rem,6.6svh,4.6rem)] cinema:py-2"
              >
                {/* the boarding flood */}
                <span aria-hidden className="act-iris absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-700 ease-[var(--ease-pilot)] group-data-[state=now]:scale-x-100" />
                <span className="label whitespace-nowrap text-signal-ink group-data-[state=now]:text-ink">[ {pad(i + 1)} ]</span>
                <h3 className="flex flex-wrap gap-[3px] font-mono text-[clamp(0.8rem,1.55vw,1.45rem)] md:flex-nowrap font-semibold uppercase" aria-label={m.name}>
                  {[...m.name.toUpperCase()].map((ch, k) => (
                    <span
                      key={k}
                      aria-hidden
                      data-ch={ch}
                      className="relative inline-grid h-[1.6em] w-[1.18em] place-items-center rounded-[4px] bg-white shadow-[0_1px_2px_rgba(28,25,23,0.12)] ring-1 ring-ink/10 after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-ink/10"
                    >
                      {ch}
                    </span>
                  ))}
                </h3>
                <div className="col-start-2 text-ink/80 md:col-start-auto">
                  <p className="line-clamp-2">{m.body}</p>
                  {/* the detail opens only on the boarding row; collapsed rows take no space, so
                      every body line stays centred against its flap tiles */}
                  <div className="cinema:grid cinema:grid-rows-[0fr] cinema:transition-[grid-template-rows] cinema:duration-500 cinema:group-data-[state=now]:grid-rows-[1fr]">
                    <p className="mt-1 text-sm text-muted cinema:overflow-hidden">{m.detail}</p>
                  </div>
                </div>
                <span className="col-start-2 hidden md:col-start-auto cinema:block">
                  <span className="label inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-muted transition-colors duration-300 group-data-[state=now]:border-ink group-data-[state=now]:bg-ink group-data-[state=now]:text-shell group-data-[state=done]:text-ink">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current group-data-[state=now]:animate-pulse group-data-[state=now]:bg-signal" />
                    <span data-status>{STATUS.next}</span>
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
    </section>
  );
}
