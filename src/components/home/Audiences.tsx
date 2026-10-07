"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, useGSAP, Flip } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { audiences, type AudienceId } from "@/content/site";
import { divisionBySlug, pad } from "@/content/divisions";
import { suggestRoute } from "@/lib/route/suggest";

/**
 * ACT 7 — Marketing is for every business. A light act. Choosing an audience re-routes the
 * line: the suggested starting divisions reflow (Flip) and the connecting rule redraws.
 */
export function Audiences({ index = "06" }: { index?: string }) {
  const root = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<AudienceId>("startups");
  const current = audiences.find((a) => a.id === active)!;
  const route = suggestRoute(active).map(divisionBySlug).filter(Boolean);

  const { contextSafe } = useGSAP({ scope: root });

  const choose = contextSafe((id: AudienceId) => {
    if (id === active) return;
    const reduce = window.matchMedia(MQ.reduce).matches;
    const state = reduce ? null : Flip.getState("[data-chip]");
    setActive(id);
    requestAnimationFrame(() => {
      if (!state) return;
      Flip.from(state, { duration: dur.base, ease: "pilot", absolute: true, onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: dur.base, stagger: 0.05 }), onLeave: (els) => gsap.to(els, { autoAlpha: 0, duration: dur.micro }) });
      gsap.fromTo("[data-audience-rule]", { scaleX: 0 }, { scaleX: 1, duration: dur.slow, ease: "glide" });
      gsap.fromTo("[data-audience-need]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: dur.base });
    });
  });

  // WAI-ARIA tabs: arrows move (and select), Home/End jump; only the selected tab is in the Tab order
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const last = audiences.length - 1;
    const to = e.key === "ArrowRight" || e.key === "ArrowDown" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0 : e.key === "End" ? last : -1;
    if (to < 0) return;
    e.preventDefault();
    tabs.current[to]?.focus();
    choose(audiences[to].id);
  };

  return (
    <section ref={root} aria-labelledby="audiences-title" className="act-rose py-28 md:py-36">
      <div className="gutter grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="label text-blue">[ {index} ] Who we work with</p>
          <h2 id="audiences-title" className="mt-4 font-display text-headline font-medium">
            Marketing is for <span className="serif-accent font-normal text-blue">every</span> business.
          </h2>
          <p className="mt-6 max-w-md text-lede text-ink/75">
            We do not define our work by a single industry; we define it by the marketing need.
          </p>
        </div>

        <div className="md:col-span-7">
          <div role="tablist" aria-label="Business stage" className="flex flex-wrap gap-2">
            {audiences.map((a, i) => (
              <button
                key={a.id}
                ref={(el) => { tabs.current[i] = el; }}
                id={`audience-tab-${a.id}`}
                role="tab"
                type="button"
                aria-selected={a.id === active}
                aria-controls="audience-panel"
                tabIndex={a.id === active ? 0 : -1}
                onClick={() => choose(a.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`rounded-full border px-5 py-3 text-sm font-medium transition-colors duration-300 ${a.id === active ? "border-ink bg-shell text-ink" : "border-ink/20 hover:border-ink"}`}
              >
                {a.name}
              </button>
            ))}
          </div>

          <div id="audience-panel" role="tabpanel" aria-labelledby={`audience-tab-${active}`} tabIndex={0} className="mt-10">
            <p data-audience-need className="font-display text-title font-medium">{current.need}</p>
            <span data-audience-rule aria-hidden className="mt-8 block h-px origin-left bg-signal-ink" />
            <p className="label mt-6 text-blue">A route might start with</p>
            {route.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {route.map((d) => (
                  <li key={d!.slug} data-chip data-flip-id={d!.slug}>
                    <Link href={`/capabilities/${d!.slug}`} className="inline-flex items-center gap-2 rounded-full bg-blue px-4 py-2.5 text-sm text-white transition-colors hover:bg-ink">
                      <span className="label opacity-80">{pad(d!.number)}</span>{d!.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 max-w-md text-ink/70">The right mix depends on your goal. Build it in a minute on the route planner.</p>
            )}
            <Link href={`/route?audience=${active}`} transitionTypes={["nav-forward"]} className="mt-8 inline-flex items-center gap-3 font-semibold text-signal-ink">
              Plan a route for {current.name.toLowerCase()} <span aria-hidden>→</span>
            </Link>
            <p className="mt-2 text-xs text-muted">A starting route only. The real plan comes after we understand your business.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
