"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type FeedbackCard = { id: string; quote: string; displayName: string; role?: string; business?: string; logo?: string; about?: string };

const initials = (s: string) => s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");

/**
 * Client quotes as a row of cards that moves on by itself, one card every few seconds, and loops
 * back to the first after the last (the owner asked for a moving loop, 2026-10-17). Arrow buttons,
 * swipe and trackpad move it too, and also loop. It holds still while the visitor is reading or
 * using it (pointer over it, keyboard focus inside it), while it is off screen or the tab is hidden,
 * and after the Pause button (WCAG 2.2.2: anything that moves on its own can be paused). Reduced
 * motion: no automatic movement at all. Three cards across on desktop, two on tablet, one and a peek
 * on phones. Each card: the quote, then the client's logo (or initials where none was supplied),
 * business and name. No star ratings: none were given.
 */
const STEP_MS = 4500;
export function FeedbackCarousel({ items }: { items: FeedbackCard[] }) {
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  // the visitor's own Pause/Play choice; `still` is reduced motion (no autoplay, no button)
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(true);
  // reasons to hold still for a moment, kept outside React state (they change on every hover)
  const hold = useRef({ hover: false, focus: false, offscreen: true });
  // bumped by any manual move, so the next automatic step waits a full beat after it
  const [beat, setBeat] = useState(0);

  const move = useCallback((dir: 1 | -1) => {
    const el = list.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    const smooth = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const atEnd = el.scrollLeft + el.clientWidth > el.scrollWidth - 4;
    const atStart = el.scrollLeft < 4;
    // the loop: past the last card comes the first again, before the first comes the last
    if (dir === 1 && atEnd) return el.scrollTo({ left: 0, behavior: smooth });
    if (dir === -1 && atStart) return el.scrollTo({ left: el.scrollWidth, behavior: smooth });
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: smooth });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    const io = new IntersectionObserver(([e]) => { hold.current.offscreen = !e.isIntersecting; }, { threshold: 0.3 });
    io.observe(list.current!);
    return () => { mq.removeEventListener("change", sync); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (still || paused || items.length < 2) return;
    const t = window.setInterval(() => {
      const h = hold.current;
      if (h.hover || h.focus || h.offscreen || document.hidden) return;
      move(1);
    }, STEP_MS);
    return () => window.clearInterval(t);
  }, [still, paused, items.length, move, beat]);

  const manual = (dir: 1 | -1) => { move(dir); setBeat((b) => b + 1); };

  const arrow = "grid size-11 place-items-center rounded-full border border-line bg-white text-ink shadow-sm transition-colors hover:border-line-strong disabled:cursor-default disabled:opacity-35";

  return (
    <div>
      <div className="flex justify-end gap-2">
        {!still && items.length > 1 && (
          <button type="button" className={arrow} onClick={() => setPaused((p) => !p)} aria-controls={listId} aria-pressed={paused} aria-label={paused ? "Play feedback" : "Pause feedback"}>
            {/* pause: two bars; play: a triangle */}
            <svg aria-hidden viewBox="0 0 16 16" className="size-3.5 fill-current">{paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h3v11H4zm5 0h3v11H9z" />}</svg>
          </button>
        )}
        <button type="button" className={arrow} onClick={() => manual(-1)} aria-controls={listId} aria-label="Previous feedback">
          <span aria-hidden>←</span>
        </button>
        <button type="button" className={arrow} onClick={() => manual(1)} aria-controls={listId} aria-label="Next feedback">
          <span aria-hidden>→</span>
        </button>
      </div>
      <ul
        ref={list}
        id={listId}
        tabIndex={0}
        aria-label="Client feedback (scrolls sideways)"
        data-lenis-prevent-wheel
        onPointerEnter={() => { hold.current.hover = true; }}
        onPointerLeave={() => { hold.current.hover = false; setBeat((b) => b + 1); }}
        onFocus={() => { hold.current.focus = true; }}
        onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hold.current.focus = false; }}
        className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 outline-offset-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((f) => (
          <li key={f.id} className="flex shrink-0 basis-[86%] snap-start sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]">
            <figure className="brand-card flex w-full flex-col justify-between gap-8 rounded-[22px] p-6 md:p-8">
              <div>
                <span aria-hidden className="block font-display text-[3.5rem] leading-[0.6] text-signal">“</span>
                <blockquote className="mt-4 text-[1.05rem] leading-relaxed text-ink/80">
                  <p>{f.quote}</p>
                </blockquote>
              </div>
              <figcaption className="flex items-center gap-4">
                {f.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- 168px pre-sized WebP (scripts/media/feedback-logos.mjs); the name beside it labels it
                  <img src={f.logo} alt="" width={56} height={56} loading="lazy" decoding="async" className="size-14 shrink-0 rounded-full bg-white object-cover ring-1 ring-line" />
                ) : (
                  <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-sand font-display text-lg font-medium text-ink/70 ring-1 ring-line">
                    {initials(f.business ?? f.displayName)}
                  </span>
                )}
                <span className="min-w-0">
                  {f.business && <span className="block font-semibold text-ink">{f.business}</span>}
                  <span className={`block ${f.business ? "text-sm text-ink/65" : "font-semibold text-ink"}`}>
                    {f.displayName}{f.role ? `, ${f.role}` : ""}
                  </span>
                  {f.about && <span className="label mt-1 block text-blue">{f.about}</span>}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
