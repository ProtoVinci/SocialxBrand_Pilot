"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
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
 * like a screen, holding two staggered columns of large landscape tiles that drift at
 * different speeds as the page scrolls. A "See Recent Work" disc follows the pointer across
 * the panel. Vertical reels are never cropped into landscape boxes: each tile stages them
 * upright, the way Hanzo stages phone screens, over a blurred wash of the same footage.
 * Mobile / reduced motion: one column, no drift, the disc sits still under the panel.
 */
export function WorkShowcase({ tiles, credit }: { tiles: ShowcaseTile[]; credit: string }) {
  const root = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLAnchorElement>(null);
  const left = tiles.filter((_, i) => i % 2 === 0);
  const right = tiles.filter((_, i) => i % 2 === 1);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.cinema, () => {
      const p = panel.current!;
      const [colL, colR] = gsap.utils.toArray<HTMLElement>("[data-col]", p);
      // each column travels exactly far enough to show its last tile, at its own speed
      const travel = (c: HTMLElement) => -Math.max(0, c.offsetHeight - p.clientHeight + 80);
      const st = { trigger: p, start: "top 85%", end: "bottom 15%", scrub: 0.6, invalidateOnRefresh: true };
      gsap.fromTo(colL, { y: 40 }, { y: () => travel(colL), ease: "none", scrollTrigger: st });
      gsap.fromTo(colR, { y: () => p.clientHeight * 0.18 }, { y: () => travel(colR) - 40, ease: "none", scrollTrigger: st });
      // the disc rests at the centre of the panel (it follows the pointer only where there is one)
      gsap.set(follower.current, { xPercent: -50, yPercent: -50, x: () => p.clientWidth / 2, y: () => p.clientHeight / 2 });
    });
    mm.add(`${MQ.cinema} and ${MQ.finePointer}`, () => {
      const p = panel.current!, f = follower.current!;
      const home = () => ({ x: p.clientWidth / 2, y: p.clientHeight / 2 });
      const toX = gsap.quickTo(f, "x", { duration: 0.6, ease: "power3" });
      const toY = gsap.quickTo(f, "y", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => { const r = p.getBoundingClientRect(); toX(e.clientX - r.left); toY(e.clientY - r.top); };
      const leave = () => { const h = home(); toX(h.x); toY(h.y); };
      p.addEventListener("pointermove", move);
      p.addEventListener("pointerleave", leave);
      return () => { p.removeEventListener("pointermove", move); p.removeEventListener("pointerleave", leave); };
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
            className="relative overflow-hidden rounded-[36px] bg-[#1d1b1a] p-4 sm:p-6 md:p-[clamp(1.5rem,3.4vw,3.75rem)] cinema:h-[min(150svh,1500px)]"
          >
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 md:gap-[clamp(1.25rem,3.2vw,3.75rem)]">
              {[left, right].map((col, c) => (
                <div key={c} data-col className="flex flex-col gap-4 will-change-transform sm:gap-6 md:gap-[clamp(1.25rem,3.2vw,3.75rem)]">
                  {col.map((t) => <Tile key={t.slug} tile={t} />)}
                </div>
              ))}
            </div>

            {/* the pointer disc (desktop); a still link under the tiles on touch / reduced motion */}
            <Link
              ref={follower}
              href="/work"
              transitionTypes={["nav-forward"]}
              aria-label="See all recent work"
              className="pointer-events-auto relative mx-auto mt-8 grid size-28 place-items-center rounded-full bg-white/85 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md md:size-40 cinema:absolute cinema:left-0 cinema:top-0 cinema:z-20 cinema:mt-0 cinema:[@media(hover:hover)_and_(pointer:fine)]:pointer-events-none"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="size-9 fill-ink md:size-11"><path d="M2.5 6.5a2 2 0 0 1 2-2h4.6l2 2.2h8.4a2 2 0 0 1 2 2v9.8a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2z" /></svg>
              <span className="absolute -right-16 -top-5 -rotate-[14deg] whitespace-nowrap rounded-full bg-ink px-5 py-2.5 text-[0.95rem] font-semibold tracking-tight text-white shadow-[0_10px_24px_-10px_rgb(0_0_0/0.7)] md:-right-24 md:-top-7 md:px-6 md:py-3 md:text-[1.15rem]">
                See Recent Work
              </span>
            </Link>
          </div>
        </div>
        <p className="label mt-5 text-right text-muted">{credit}</p>
      </div>
    </section>
  );
}

function Tile({ tile }: { tile: ShowcaseTile }) {
  const [hot, setHot] = useState(false);
  const cards = tile.cards.slice(0, 3);
  const back = tile.wide ?? cards[0];
  return (
    <Link
      href={`/work/${tile.slug}`}
      transitionTypes={["nav-forward"]}
      aria-label={`${tile.title}: ${tile.format}`}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => setHot(false)}
      onFocus={() => setHot(true)}
      onBlur={() => setHot(false)}
      className="group relative block aspect-[4/3] overflow-hidden rounded-[22px] bg-[#2a2725] outline-offset-4"
    >
      {tile.wide ? (
        <Frame frame={tile.wide} hot={hot} className="absolute inset-0 h-full w-full object-cover" />
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
                  className={`relative aspect-[9/16] overflow-hidden rounded-[12px] shadow-[0_24px_40px_-18px_rgb(0_0_0/0.7)] ring-1 ring-white/15 transition-[translate,rotate] duration-500 ease-[var(--ease-pilot)] ${mid ? "z-10 h-[86%]" : "h-[74%]"} ${k === 0 && cards.length > 1 ? "group-hover:-translate-x-2" : ""} ${k === 2 ? "group-hover:translate-x-2" : ""}`}
                >
                  <Frame frame={f} hot={hot && mid} className="h-full w-full object-cover" />
                </span>
              );
            })}
          </span>
        </>
      )}
      {/* resting dim, lifted on hover, and the title that rises with it */}
      <span aria-hidden className="absolute inset-0 bg-[#1d1b1a]/25 transition-opacity duration-500 group-hover:opacity-0" />
      <span aria-hidden className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium text-ink opacity-0 backdrop-blur transition-[opacity,translate] duration-500 ease-[var(--ease-pilot)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
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
