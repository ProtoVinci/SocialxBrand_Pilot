"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Mark } from "@/components/brand/Mark";
import { useRoute } from "@/lib/route/store";
import { Reel } from "@/components/media/Reel";
import { allVideos } from "@/content/work";

const links = [
  { href: "/work", label: "Work", hint: "Real reels, films, photography and design" },
  { href: "/capabilities", label: "Capabilities", hint: "18 divisions, combined around the business" },
  { href: "/approach", label: "Approach", hint: "Understand → Grow, and what we stand for" },
  { href: "/route", label: "Start your route", hint: "Plan the right mix, then talk to us" },
];

export function Nav() {
  const pathname = usePathname();
  const route = useRoute();
  const bar = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const previews = allVideos();

  // scroll states: solid as soon as content passes under it (12px), hide on scroll-down, route-progress hairline
  useGSAP(() => {
    const setProgress = gsap.quickSetter(progress.current, "scaleX");
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        setProgress(self.progress);
        const y = self.scroll();
        setSolid(y > 12);
        if (open) return;
        const hide = self.direction === 1 && y > window.innerHeight * 0.6;
        gsap.to(bar.current, { yPercent: hide ? -110 : 0, duration: dur.quick, ease: "snap", overwrite: true });
      },
    });
    return () => st.kill();
  }, { dependencies: [pathname, open] });

  // close on navigation (adjusting state during render, per React's "you might not need an effect")
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // full-screen menu choreography
  useGSAP(() => {
    const el = panel.current;
    if (!el) return;
    const reduce = window.matchMedia(MQ.reduce).matches;
    const items = el.querySelectorAll("[data-menu-item]");
    if (open) {
      gsap.set(el, { display: "flex" });
      if (reduce) { gsap.set(el, { autoAlpha: 1 }); gsap.set(items, { autoAlpha: 1, yPercent: 0 }); }
      else {
        gsap.timeline()
          .fromTo(el, { clipPath: "inset(0 0 100% 0)", autoAlpha: 1 }, { clipPath: "inset(0 0 0% 0)", duration: dur.slow, ease: "glide" })
          .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: dur.slow, stagger: 0.06 }, "-=0.45");
      }
      (el.querySelector("a") as HTMLElement | null)?.focus();
    } else if (el.style.display === "flex") {
      const done = () => { gsap.set(el, { display: "none" }); };
      if (reduce) done();
      else gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: dur.base, ease: "glide", onComplete: done });
    }
  }, { dependencies: [open] });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); menuButton.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.documentElement.style.overflow = ""; };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        ref={bar}
        style={{ viewTransitionName: "site-header" }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 ${
          solid || open ? "border-b border-ink/10 bg-shell/80 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <nav aria-label="Primary" className="gutter flex h-[var(--nav-h)] items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-3" aria-label="SOCIALxBRAND PILOT — home" transitionTypes={["nav-back"]}>
            <Mark className="h-8 w-auto text-signal transition-transform duration-500 ease-[var(--ease-pilot)] group-hover:-translate-y-0.5" />
            <span className="hidden font-display text-[0.95rem] font-semibold tracking-[-0.01em] sm:block">
              SOCIAL<span className="text-signal">x</span>BRAND PILOT
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.slice(0, 3).map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  transitionTypes={["nav-forward"]}
                  className="roll relative block rounded-full px-4 py-2 text-sm text-ink/80 transition-colors hover:text-ink aria-[current=page]:text-ink"
                >
                  <span className="relative block overflow-hidden">
                    <span className="roll-a block">{l.label}</span>
                    <span className="roll-b absolute inset-x-0 top-full block" aria-hidden>{l.label}</span>
                  </span>
                  {isActive(l.href) && <span className="absolute inset-x-4 bottom-1 h-px bg-signal" />}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/route"
              transitionTypes={["nav-forward"]}
              className="magnetic group relative inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-shell transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="hidden sm:inline">Start your route</span>
              <span className="sm:hidden">Start</span>
              {route.length > 0 && (
                <span
                  key={route.length}
                  className="grid h-5 min-w-5 animate-[badge-pop_0.45s_var(--ease-pilot)] place-items-center rounded-full bg-shell px-1 font-mono text-[0.68rem] text-ink"
                  aria-label={`${route.length} divisions on your route`}
                >
                  {route.length}
                </span>
              )}
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              className="label flex h-10 items-center gap-2 rounded-full border border-ink/20 px-4 text-ink transition-colors hover:border-ink/50"
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span className="relative block h-2 w-4" aria-hidden>
                <span className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1 -rotate-45" : "top-2"}`} />
              </span>
            </button>
          </div>
        </nav>
        <span ref={progress} aria-hidden className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-signal" />
      </header>

      <div
        ref={panel}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className="fixed inset-0 z-40 hidden flex-col justify-end bg-shell pb-10 pt-[calc(var(--nav-h)+2rem)]"
        style={{ visibility: "hidden" }}
      >
        <ol className="gutter flex flex-col">
          {links.map((l, i) => {
            const preview = previews[(i * 7) % Math.max(1, previews.length)];
            return (
              <li key={l.href} className="group border-t border-ink/10 last:border-b">
                <Link
                  href={l.href}
                  transitionTypes={["nav-forward"]}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-6 py-4 md:py-5"
                >
                  <span className="overflow-hidden">
                    <span data-menu-item className="flex items-baseline gap-4 font-display text-[clamp(2.4rem,7vw,6rem)] font-semibold leading-[0.95] tracking-[-0.04em] [font-stretch:80%] transition-colors group-hover:text-signal">
                      <span className="label text-muted">0{i + 1}</span>
                      {l.label}
                    </span>
                  </span>
                  <span className="hidden max-w-60 text-right text-sm text-muted md:block">{l.hint}</span>
                  {preview && (
                    <Reel asset={preview} mode="manual" className="hidden aspect-[9/16] w-16 shrink-0 rounded-md opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block" />
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
