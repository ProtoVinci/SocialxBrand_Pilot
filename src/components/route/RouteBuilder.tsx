"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ, dur } from "@/lib/motion/tokens";
import { audiences, type AudienceId } from "@/content/site";
import { clusters, divisions, divisionBySlug, pad } from "@/content/divisions";
import { goals, suggestRoute, type GoalId } from "@/lib/route/suggest";
import { routeStore, useRoute } from "@/lib/route/store";
import { adapters, briefText, validate, type Brief, type BriefErrors } from "@/lib/route/enquiry";

const STEPS = ["Business", "Goal", "Route", "Details", "Send"] as const;

/**
 * The Pilot Route: a five-station brief builder. The progress line at the top is the same
 * signal line as everywhere else; it advances station by station, and the final step draws
 * the visitor's chosen divisions as their own route before handing the brief to an adapter.
 */
export function RouteBuilder() {
  const params = useSearchParams();
  const root = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const route = useRoute();
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<AudienceId | undefined>(() => (audiences.some((a) => a.id === params.get("audience")) ? (params.get("audience") as AudienceId) : undefined));
  const [goal, setGoal] = useState<GoalId | undefined>();
  const [details, setDetails] = useState({ name: "", business: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<BriefErrors>({});
  const [status, setStatus] = useState<string | null>(null);

  const brief: Brief = { audience, goal, divisions: route, ...details };
  const suggested = audience ? suggestRoute(audience, goal) : [];

  // progress line + step entrance
  useGSAP(() => {
    const reduce = window.matchMedia(MQ.reduce).matches;
    gsap.to("[data-progress]", { scaleX: step / (STEPS.length - 1), duration: reduce ? 0 : dur.slow, ease: "glide" });
    if (!reduce) gsap.fromTo(stepRef.current, { autoAlpha: 0, x: 36 }, { autoAlpha: 1, x: 0, duration: dur.base, ease: "pilot" });
    if (step === STEPS.length - 1 && !reduce) {
      gsap.fromTo("[data-summary-line]", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.2, ease: "glide", delay: 0.2 });
      gsap.from("[data-summary-stop]", { scale: 0, duration: dur.base, stagger: 0.12, delay: 0.3, ease: "back.out(1.6)" });
    }
  }, { scope: root, dependencies: [step] });

  useEffect(() => { if (step > 0) headingRef.current?.focus(); }, [step]);

  const go = (n: number) => {
    if (n === 2 && route.length === 0 && suggested.length) routeStore.set(suggested);
    if (n === 4) {
      const e = validate(brief);
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    setStatus(null);
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
  };

  const canContinue = [true, true, route.length > 0, true, true][step];

  return (
    <div ref={root} className="rounded-[24px] border border-paper/10 bg-ink-2 p-6 md:p-10">
      {/* the route so far */}
      <ol className="relative mb-10 grid grid-cols-5" aria-label="Progress">
        <span aria-hidden className="absolute left-[10%] right-[10%] top-[7px] h-px bg-paper/15" />
        <span aria-hidden data-progress className="absolute left-[10%] right-[10%] top-[7px] h-px origin-left scale-x-0 bg-signal" />
        {STEPS.map((s, i) => (
          <li key={s} className="relative flex flex-col items-center gap-2" aria-current={i === step ? "step" : undefined}>
            <span className={`h-3.5 w-3.5 rounded-full border transition-colors duration-500 ${i <= step ? "border-signal bg-signal" : "border-paper/30 bg-ink-2"}`} />
            <span className={`label ${i === step ? "text-paper" : "text-fog"}`}>{s}</span>
          </li>
        ))}
      </ol>

      <div ref={stepRef}>
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-headline font-semibold outline-none [font-stretch:84%]">
          {[
            "Who is the route for?",
            "What should marketing do for you right now?",
            "Choose the divisions on your route.",
            "Where should we reply?",
            "Your route is ready.",
          ][step]}
        </h2>

        {step === 0 && (
          <fieldset className="mt-8">
            <legend className="sr-only">Business stage</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {audiences.map((a) => (
                <label key={a.id} className={`cursor-pointer rounded-[16px] border p-5 transition-colors ${audience === a.id ? "border-signal bg-signal/10" : "border-paper/15 hover:border-paper/40"}`}>
                  <input type="radio" name="audience" value={a.id} checked={audience === a.id} onChange={() => setAudience(a.id)} className="sr-only" />
                  <span className="font-display text-title font-semibold [font-stretch:86%]">{a.name}</span>
                  <span className="mt-1 block text-sm text-paper/65">{a.need}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="mt-8">
            <legend className="sr-only">Goal</legend>
            <div className="grid gap-3">
              {goals.map((g) => (
                <label key={g.id} className={`flex cursor-pointer items-baseline justify-between gap-6 rounded-[16px] border p-5 transition-colors ${goal === g.id ? "border-signal bg-signal/10" : "border-paper/15 hover:border-paper/40"}`}>
                  <input type="radio" name="goal" value={g.id} checked={goal === g.id} onChange={() => setGoal(g.id)} className="sr-only" />
                  <span className="font-display text-title font-semibold [font-stretch:86%]">{g.label}</span>
                  <span className="text-right text-sm text-paper/65">{g.prompt}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <div className="mt-8">
            {suggested.length > 0 && (
              <p className="text-sm text-paper/70">
                We&apos;ve started you with a suggested route. Add or remove anything; it&apos;s a starting point, and the real plan comes after we understand your business.
              </p>
            )}
            <div className="mt-6 flex flex-col gap-8">
              {clusters.map((c) => (
                <fieldset key={c.id}>
                  <legend className="label text-fog">{c.name}</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {divisions.filter((d) => d.cluster === c.id).map((d) => {
                      const on = route.includes(d.slug);
                      return (
                        <button
                          key={d.slug}
                          type="button"
                          aria-pressed={on}
                          onClick={() => routeStore.toggle(d.slug)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-colors duration-300 ${on ? "border-violet bg-violet text-ink" : "border-paper/15 hover:border-paper/50"}`}
                        >
                          <span className="label opacity-70">{pad(d.number)}</span>
                          {d.shortName}
                          {suggested.includes(d.slug) && !on && <span className="label text-signal">suggested</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <p className="label mt-8 text-fog" aria-live="polite">{route.length} on your route</p>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {([
              ["name", "Your name", "text", "name"],
              ["business", "Business name", "text", "organization"],
              ["email", "Email", "email", "email"],
              ["phone", "Phone / WhatsApp", "tel", "tel"],
            ] as const).map(([key, label, type, auto]) => (
              <label key={key} className="flex flex-col gap-2">
                <span className="label text-fog">{label}{key === "name" ? " *" : ""}</span>
                <input
                  type={type}
                  autoComplete={auto}
                  value={details[key]}
                  onChange={(e) => setDetails({ ...details, [key]: e.target.value })}
                  aria-invalid={Boolean((key === "name" && errors.name) || (key === "email" && errors.email))}
                  aria-describedby={key === "email" || key === "phone" ? "contact-error" : key === "name" ? "name-error" : undefined}
                  className="rounded-[12px] border border-paper/15 bg-ink px-4 py-3.5 text-paper outline-none transition-colors placeholder:text-paper/30 focus:border-signal"
                />
              </label>
            ))}
            <label className="flex flex-col gap-2 md:col-span-2">
              <span className="label text-fog">Anything we should know? (optional)</span>
              <textarea rows={4} value={details.message} onChange={(e) => setDetails({ ...details, message: e.target.value })} className="rounded-[12px] border border-paper/15 bg-ink px-4 py-3.5 text-paper outline-none transition-colors focus:border-signal" />
            </label>
            <div className="md:col-span-2" aria-live="assertive">
              {errors.name && <p id="name-error" className="text-sm text-signal">{errors.name}</p>}
              {(errors.contact || errors.email) && <p id="contact-error" className="text-sm text-signal">{errors.contact ?? errors.email}</p>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="mt-8">
            <RouteSummary slugs={route} />
            <details className="mt-8 rounded-[14px] border border-paper/10 p-5">
              <summary className="label cursor-pointer text-fog">Read the brief</summary>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm text-paper/80">{briefText(brief)}</pre>
            </details>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {adapters.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={async () => {
                    const r = await a.deliver(brief);
                    if (!r.ok) return setStatus(r.error);
                    if (r.href) window.open(r.href, a.id === "whatsapp" ? "_blank" : "_self", "noopener");
                    setStatus(a.id === "copy" ? "Brief copied." : `${a.label.replace("Send ", "Opening ")}…`);
                  }}
                  className={`rounded-[16px] p-5 text-left transition-transform duration-300 hover:-translate-y-0.5 ${a.id === "whatsapp" ? "bg-signal text-ink" : "border border-paper/15"}`}
                >
                  <span className="block font-semibold">{a.label}</span>
                  <span className={`mt-1 block text-sm ${a.id === "whatsapp" ? "text-ink/75" : "text-paper/60"}`}>{a.hint}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-fog" role="status">{status}</p>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-paper/10 pt-6">
        <button type="button" onClick={() => go(step - 1)} disabled={step === 0} className="label text-fog transition-colors hover:text-paper disabled:opacity-0">← Back</button>
        {step < STEPS.length - 1 && (
          <button
            type="button"
            onClick={() => go(step + 1)}
            disabled={!canContinue}
            className="inline-flex items-center gap-3 rounded-full bg-paper px-6 py-3.5 font-semibold text-ink transition-opacity disabled:opacity-40"
          >
            {step === 3 ? "Review route" : "Continue"} <span aria-hidden>→</span>
          </button>
        )}
      </div>
    </div>
  );
}

/** The visitor's own route, drawn: stations are their chosen divisions, in order. */
function RouteSummary({ slugs }: { slugs: string[] }) {
  const items = slugs.map(divisionBySlug).filter(Boolean);
  if (!items.length) return null;
  const pts = items.map((_, i) => ({ x: items.length === 1 ? 50 : 4 + (i * 92) / (items.length - 1), y: i % 2 === 0 ? 70 : 30 }));
  const d = pts.reduce((acc, p, i) => (i === 0 ? `M0 70 L${p.x} ${p.y}` : `${acc} C ${(pts[i - 1].x + p.x) / 2} ${pts[i - 1].y}, ${(pts[i - 1].x + p.x) / 2} ${p.y}, ${p.x} ${p.y}`), "") + " L100 50";
  return (
    <div className="relative h-44 md:h-40">
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        <path data-summary-line d={d} fill="none" stroke="#ff3131" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <ol className="absolute inset-0">
        {items.map((it, i) => (
          <li key={it!.slug} data-summary-stop className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2" style={{ left: `${pts[i].x}%`, top: `${pts[i].y}%` }}>
            <span className="h-3 w-3 rounded-full bg-signal" />
            <span className={`label max-w-28 text-center text-paper ${pts[i].y < 50 ? "order-first" : ""}`}>{it!.shortName}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
