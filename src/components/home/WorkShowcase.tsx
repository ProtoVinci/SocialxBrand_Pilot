"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";

export type ShowcaseFrame = { poster: string; video?: string };
export type ShowcaseTile = {
  slug: string; title: string; kicker: string; format: string;
  /** a landscape original fills the tile edge to edge */
  wide?: ShowcaseFrame;
  /** otherwise: vertical work stands upright in the tile, uncropped, over its own blurred light */
  cards: ShowcaseFrame[];
};

/**
 * ACT 4 — Recent work, after the Hanzo "#work" panel: a dark rounded panel set into the page
 * like a screen, holding two columns of large landscape tiles that never stop moving: the
 * left column drifts up and the right drifts down, endlessly (each track holds its tiles
 * twice and loops at -50%), and scrolling the page briefly speeds them up. The "See Recent
 * Work" disc sits fixed at the centre of the panel.
 * Vertical reels are never cropped into landscape boxes: each tile stages them upright, the
 * way Hanzo stages phone screens, over a blurred wash of the same footage.
 * Mobile / reduced motion: one still column, the disc sits under it.
 */
export function WorkShowcase({ tiles, credit }: { tiles: ShowcaseTile[]; credit: string }) {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const left = tiles.filter((_, i) => i % 2 === 0);
  const right = tiles.filter((_, i) => i % 2 === 1);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.cinema, () => {
      const [trackL, trackR] = gsap.utils.toArray<HTMLElement>("[data-track]", panel.current);
      // one loop each, in opposite directions; ~9s per tile keeps it calm
      const loops = [
        gsap.fromTo(trackL, { yPercent: 0 }, { yPercent: -50, duration: left.length * 9, ease: "none", repeat: -1 }),
        gsap.fromTo(trackR, { yPercent: -50 }, { yPercent: 0, duration: right.length * 9, ease: "none", repeat: -1 }),
      ];
      const boost = { v: 1 };
      const apply = () => loops.forEach((l) => l.timeScale(boost.v));
      const st = ScrollTrigger.create({
        trigger: panel.current,
        start: "top bottom",
        end: "bottom top",
        // offscreen: paused, so two loops never run behind the rest of the page
        onToggle: (self) => loops.forEach((l) => (self.isActive ? l.resume() : l.pause())),
        // scrolling flicks the loops faster, then they ease back to their resting pace
        onUpdate: (self) => {
          boost.v = 1 + Math.min(5, Math.abs(self.getVelocity()) / 350);
          apply();
          gsap.to(boost, { v: 1, duration: 1.2, ease: "power2.out", overwrite: true, onUpdate: apply });
        },
      });
      if (!st.isActive) loops.forEach((l) => l.pause());
      return () => st.kill();
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} id="work" aria-labelledby="showcase-title" className="relative bg-shell py-16 md:py-24">
      <h2 id="showcase-title" className="sr-only">Recent work</h2>
      <div className="gutter">
        {/* the bezel: a pale frame around a dark screen */}
        <div className="rounded-[44px] bg-white/70 p-2.5 shadow-[0_30px_80px_-40px_rgb(28_25_23/0.35)] ring-1 ring-line md:p-3">
          <div
            ref={panel}
            className="relative overflow-clip rounded-[36px] bg-[#1d1b1a] p-4 sm:p-6 md:px-[clamp(1.5rem,3.4vw,3.75rem)] md:py-0 cinema:h-[min(118svh,1180px)]"
          >
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-[clamp(1.25rem,3.2vw,3.75rem)]">
              {[left, right].map((col, c) => (
                // two identical blocks, each carrying its own bottom gap, so -50% lands exactly on the seam
                <div key={c} data-track className="will-change-transform">
                  <div className={block}>
                    {col.map((t) => <Tile key={t.slug} tile={t} />)}
                  </div>
                  {/* the loop's second copy: desktop motion only, hidden from assistive tech and focus */}
                  <div aria-hidden inert className={`${block} hidden cinema:flex`}>
                    {col.map((t) => <Tile key={t.slug} tile={t} />)}
                  </div>
                </div>
              ))}
            </div>

            {/* the disc: fixed at the centre of the panel, over the moving tiles (desktop);
                a plain button under the tiles on phones */}
            <div className="mt-8 flex justify-center md:pointer-events-none md:absolute md:inset-0 md:z-20 md:mt-0 md:items-center">
              <Link
                href="/work"
                transitionTypes={["nav-forward"]}
                aria-label="See all recent work"
                className="pointer-events-auto relative grid size-28 place-items-center rounded-full bg-white/85 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md transition-transform duration-500 ease-[var(--ease-pilot)] hover:scale-105 md:size-40"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-9 fill-ink md:size-11"><path d="M2.5 6.5a2 2 0 0 1 2-2h4.6l2 2.2h8.4a2 2 0 0 1 2 2v9.8a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z" /></svg>
                <span className="absolute -right-16 -top-5 -rotate-[14deg] whitespace-nowrap rounded-full bg-ink px-5 py-2.5 text-[0.95rem] font-semibold tracking-tight text-white shadow-[0_10px_24px_-10px_rgb(0_0_0/0.7)] md:-right-24 md:-top-7 md:px-6 md:py-3 md:text-[1.15rem]">
                  See Recent Work
                </span>
              </Link>
            </div>
          </div>
        </div>
        <p className="label mt-5 text-right text-muted">{credit}</p>
      </div>
    </section>
  );
}

const block = "flex flex-col gap-4 pb-4 sm:gap-6 sm:pb-6 md:gap-[clamp(1.25rem,3.2vw,3.75rem)] md:pb-[clamp(1.25rem,3.2vw,3.75rem)]";

function Tile({ tile }: { tile: ShowcaseTile }) {
  const [hot, setHot] = useState(false);
  // playing on a touch screen: only the video wakes, never the hover look (title chip, lifted dim)
  const [onScreen, setOnScreen] = useState(false);
  const link = useRef<HTMLAnchorElement>(null);
  // Touch screens have no hover, so nothing ever woke the videos there: a tile plays while it is
  // mostly on screen instead (about three at a time in the one-column layout) and rests when it
  // scrolls away. Reduced motion keeps posters.
  useEffect(() => {
    const el = link.current;
    if (!el || !window.matchMedia("(hover: none)").matches || window.matchMedia(MQ.reduce).matches) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.7 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cards = tile.cards.slice(0, 3);
  const back = tile.wide ?? cards[0];
  return (
    <Link
      ref={link}
      href={`/work/${tile.slug}`}
      transitionTypes={["nav-forward"]}
      aria-label={`${tile.title}: ${tile.format}`}
      // pointermove, not pointerenter: the tracks never stop moving, so tiles keep sliding under a
      // resting cursor (and under one that is scrolling the page). Waking a tile then mounted its
      // video and re-ran its hover transitions inside the moving track, which repainted the whole
      // track on every pass. Only a real pointer movement over a tile wakes it now, and the hover
      // look keys off the same state (data-hot) instead of :hover, which also fires on a slide-by.
      onPointerMove={() => { if (!hot) setHot(true); }}
      onPointerLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      data-hot={hot ? "" : undefined}
      className="group relative block aspect-[4/3] shrink-0 overflow-hidden rounded-[22px] bg-[#2a2725] outline-offset-4"
    >
      {tile.wide ? (
        <Frame frame={tile.wide} hot={hot || onScreen} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          {/* the footage's own light, blurred into a backdrop */}
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized poster */}
          <img src={back.poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl saturate-150" />
          <span aria-hidden className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_45%,transparent,rgb(20_18_17/0.55))]" />
          {/* the vertical work, standing upright and whole */}
          <span className="absolute inset-0 flex items-center justify-center gap-[3%] px-[6%]">
            {cards.map((f, k) => {
              const mid = cards.length === 1 || k === 1;
              const tilt = cards.length === 1 ? 0 : k === 0 ? -5 : k === 2 ? 5 : 0;
              return (
                <span
                  key={f.poster}
                  style={{ rotate: `${tilt}deg` }}
                  className={`relative aspect-[9/16] overflow-hidden rounded-[12px] shadow-[0_24px_40px_-18px_rgb(0_0_0/0.7)] ring-1 ring-white/15 transition-[translate,rotate] duration-500 ease-[var(--ease-pilot)] ${mid ? "z-10 h-[86%]" : "h-[74%]"} ${k === 0 && cards.length > 1 ? "group-data-[hot]:-translate-x-2" : ""} ${k === 2 ? "group-data-[hot]:translate-x-2" : ""}`}
                >
                  <Frame frame={f} hot={(hot || onScreen) && mid} className="h-full w-full object-cover" />
                </span>
              );
            })}
          </span>
        </>
      )}
      {/* resting dim, lifted on hover, and the title that rises with it */}
      <span aria-hidden className="absolute inset-0 bg-[#1d1b1a]/25 transition-opacity duration-500 group-data-[hot]:opacity-0" />
      <span aria-hidden className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium text-ink opacity-0 backdrop-blur transition-[opacity,translate] duration-500 ease-[var(--ease-pilot)] group-data-[hot]:translate-y-0 group-data-[hot]:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
        {tile.title} <span className="text-muted">· {tile.kicker}</span>
      </span>
    </Link>
  );
}

/** A poster that turns into its playing reel while the tile is hovered. */
function Frame({ frame, hot, className }: { frame: ShowcaseFrame; hot: boolean; className: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized poster */}
      <img src={frame.poster} alt="" loading="lazy" decoding="async" className={className} />
      {hot && frame.video && (
        <video src={frame.video} muted loop playsInline autoPlay className={`absolute inset-0 ${className} motion-reduce:hidden`} />
      )}
    </>
  );
}
