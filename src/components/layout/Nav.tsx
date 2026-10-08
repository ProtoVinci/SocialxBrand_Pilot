"use client";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { Mark } from "@/components/brand/Mark";
import { useRoute } from "@/lib/route/store";
import { Reel } from "@/components/media/Reel";
import { useLenis } from "@/components/motion/SmoothScroll";
import type { VideoAsset } from "@/content/work";

const links = [
  { href: "/", label: "Home", hint: "Back to the start" },
  { href: "/work", label: "Work", hint: "Real reels, films, photography and design" },
  { href: "/capabilities", label: "Capabilities", hint: "18 divisions, combined around the business" },
  { href: "/approach", label: "Approach", hint: "Understand → Grow, and what we stand for" },
  { href: "/route", label: "Start your route", hint: "Plan the right mix, then talk to us" },
];

/** How the menu last closed: by the visitor (Close, Escape, same-page link) or by a route change. */
type Exit = "user" | "route";

export function Nav({ previews }: { previews: VideoAsset[] }) {
  const pathname = usePathname();
  const route = useRoute();
  const lenis = useLenis();
  const bar = useRef<HTMLElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuTl = useRef<gsap.core.Animation | null>(null);
  const [open, setOpen] = useState(false);
  const [exit, setExit] = useState<Exit>("user");
  const [solid, setSolid] = useState(false);

  const close = (how: Exit) => { setExit(how); setOpen(false); };

  // scroll states: solid as soon as content passes under it (12px), hide on scroll-down (but back
  // for the last stretch of every page), route-progress hairline.
  // Runs once per page: the bar is shown again on every new page (it may have been hidden by a
  // scroll on the page the visitor left), and the menu's state is read through a ref, so opening
  // it no longer tears down and rebuilds this trigger.
  const openRef = useRef(open);
  useEffect(() => { openRef.current = open; }, [open]);
  useGSAP(() => {
    const setProgress = gsap.quickSetter(progress.current, "scaleX");
    let hidden = false;
    let isSolid = window.scrollY > 12;
    setSolid(isSolid);
    gsap.to(bar.current, { yPercent: 0, duration: dur.quick, ease: "snap", overwrite: true });
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate(self) {
        setProgress(self.progress);
        const y = self.scroll();
        // React state only on a change: this runs on every scroll frame
        if ((y > 12) !== isSolid) { isSolid = y > 12; setSolid(isSolid); }
        if (openRef.current) return;
        // never hidden near the end of a page: a visitor who has finished reading must see the way on
        const hide = self.direction === 1 && y > window.innerHeight * 0.6 && self.progress < 0.92;
        if (hide === hidden) return; // tween only on a change, not on every scroll event
        hidden = hide;
        gsap.to(bar.current, { yPercent: hide ? -110 : 0, duration: dur.quick, ease: "snap", overwrite: true });
      },
    });
    return () => st.kill();
  }, { dependencies: [pathname] });

  // close on navigation (adjusting state during render, per React's "you might not need an effect")
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) close("route");
  }

  // full-screen menu choreography. Every change first kills whatever is still running, so a quick
  // open → close → open never leaves two tweens fighting over the panel's clip-path.
  useGSAP(() => {
    const el = panel.current;
    if (!el) return;
    const reduce = window.matchMedia(MQ.reduce).matches;
    const items = el.querySelectorAll("[data-menu-item]");
    menuTl.current?.kill();
    menuTl.current = null;
    if (open) {
      gsap.set(el, { display: "flex", autoAlpha: 1 });
      if (reduce) { gsap.set(el, { clipPath: "none" }); gsap.set(items, { yPercent: 0 }); }
      else {
        menuTl.current = gsap.timeline()
          .fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: dur.slow, ease: "glide" })
          .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: dur.slow, stagger: 0.06 }, "-=0.45");
      }
      (el.querySelector("a") as HTMLElement | null)?.focus({ preventScroll: true });
    } else if (el.style.display === "flex") {
      const done = () => { gsap.set(el, { display: "none", clipPath: "inset(0 0 100% 0)" }); };
      // Leaving for another page: this runs inside the page's view transition, before the new
      // page is captured, so the panel is removed at once and the transition itself plays its
      // exit (see ::view-transition-old(site-menu) in globals.css). Tweening it here instead left
      // a half-closed menu frozen in the snapshot.
      const handledByTransition = exit === "route" && "startViewTransition" in document;
      if (reduce || handledByTransition) done();
      else menuTl.current = gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: dur.base, ease: "glide", onComplete: done });
    }
  }, { dependencies: [open] });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { close("user"); menuButton.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    // overflow alone does not stop Lenis (it scrolls with window.scrollTo, which ignores it):
    // stop it too, or the page behind the menu keeps moving under the wheel
    const smooth = lenis?.current;
    smooth?.stop();
    document.documentElement.style.overflow = "hidden";
    // a real modal: the page behind is inert, so Tab cycles between the bar and the menu only
    const behind = [document.getElementById("main"), document.querySelector("body > footer, #main ~ footer")].filter(Boolean) as HTMLElement[];
    behind.forEach((el) => el.setAttribute("inert", ""));
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      smooth?.start();
      behind.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open, lenis]);

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        ref={bar}
        style={{ viewTransitionName: "site-header" }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          solid || open ? "border-b border-ink/10 bg-shell/95" : "border-b border-transparent"
        }`}
      >
        <nav aria-label="Primary" className="gutter flex h-[var(--nav-h)] items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-3" aria-label="SOCIALxBRAND PILOT — home" transitionTypes={["nav-back"]}>
            <Mark className="h-8 w-auto text-signal transition-transform duration-500 ease-[var(--ease-pilot)] group-hover:-translate-y-0.5" />
            <span className="hidden whitespace-nowrap font-display text-[0.95rem] font-medium tracking-[-0.01em] sm:block md:max-lg:hidden">
              <span className="text-blue">SOCIAL</span>x<span className="text-signal-ink">BRAND PILOT</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.slice(0, 4).map((l) => (
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
              className="magnetic group relative inline-flex items-center gap-2 rounded-full bg-cta px-4 py-2.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-cta-hover"
            >
              <span className="whitespace-nowrap">
                Start<span className="max-sm:hidden md:max-lg:hidden"> your route</span>
              </span>
              {route.length > 0 && (
                <>
                  <span
                    key={route.length}
                    aria-hidden
                    className="grid h-5 min-w-5 animate-[badge-pop_0.45s_var(--ease-pilot)] place-items-center rounded-full bg-shell px-1 font-mono text-[0.68rem] text-ink"
                  >
                    {route.length}
                  </span>
                  <span className="sr-only">({route.length} {route.length === 1 ? "division" : "divisions"} on your route)</span>
                </>
              )}
            </Link>
            <button
              ref={menuButton}
              type="button"
              onClick={() => { if (open) close("user"); else { setExit("user"); setOpen(true); } }}
              aria-expanded={open}
              aria-controls="site-menu"
              className="label flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-ink shadow-sm transition-colors hover:border-line-strong"
            >
              <span>{open ? "Close" : "Menu"}</span>
              <span className="relative block h-2 w-4" aria-hidden>
                <span className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1 -rotate-45" : "top-2"}`} />
              </span>
            </button>
          </div>
        </nav>
        <span ref={progress} aria-hidden className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-blue to-signal" />
      </header>

      <div
        ref={panel}
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        // scrolls instead of overflowing upward under the bar on short screens; the list sits at the
        // bottom via mt-auto (justify-end would push the top items behind the header)
        className="fixed inset-0 z-40 hidden flex-col overflow-y-auto overscroll-contain bg-shell pb-10 pt-[calc(var(--nav-h)+1rem)]"
        // its own view-transition group: when a menu link changes the page, the open menu is
        // captured with the old page and wipes away on its own (globals.css, "site-menu")
        style={{ visibility: "hidden", viewTransitionName: "site-menu" }}
        data-lenis-prevent
      >
        <ol className="gutter mt-auto flex flex-col">
          {links.map((l, i) => {
            const preview = previews[i];
            return (
              <li key={l.href} className="group border-t border-ink/10 last:border-b">
                <Link
                  href={l.href}
                  transitionTypes={["nav-forward"]}
                  // another page: the route change closes the menu as part of the page transition;
                  // the page already open: nothing navigates, so close it here
                  onClick={() => { if (l.href === pathname) close("user"); }}
                  className="relative flex items-center justify-between gap-6 py-4 md:py-5"
                >
                  <span className="overflow-hidden">
                    <span data-menu-item className="flex items-baseline gap-4 font-display text-[clamp(2rem,min(7vw,9svh),6rem)] font-medium leading-[0.95] tracking-[-0.04em] transition-colors group-hover:text-signal">
                      <span className="label text-blue">0{i + 1}</span>
                      {l.label}
                    </span>
                  </span>
                  <PendingLine />
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

/**
 * Instant feedback on a menu click while the next page loads (the menu stays up until the page
 * transition takes it away): a red line runs along the bottom of the chosen item.
 */
function PendingLine() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 -bottom-px h-[2px] origin-left bg-signal ${pending ? "animate-[link-pending_1.2s_var(--ease-glide)_infinite]" : "scale-x-0"}`}
    />
  );
}
