import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { MethodBoard } from "@/components/home/MethodBoard";
import { AiAmplifies } from "@/components/home/AiAmplifies";
import { Audiences } from "@/components/home/Audiences";
import { Finale } from "@/components/home/Finale";
import { PrincipleStack } from "@/components/approach/PrincipleStack";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { differentiators, mission, personality, philosophy, pillars, quote, vision, whoWeAre } from "@/content/site";
import { pad } from "@/content/divisions";

export const metadata: Metadata = {
  title: "Approach — how we think and work",
  description:
    "Who SOCIALxBRAND PILOT is, how we work (Understand, Strategize, Create, Execute, Measure, Optimize, Grow), what we stand for, and how we use AI to amplify creativity, not replace it.",
  alternates: { canonical: "/approach" },
};

export default function ApproachPage() {
  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Approach", path: "/approach" }])} />
      <PageHeader
        index="A"
        label="Approach — who we are"
        title={<>Business first. <span className="serif-accent font-normal text-signal">Then everything else.</span></>}
        lede={<p>{whoWeAre[0]}</p>}
      />

      {/* who we are */}
      <section aria-labelledby="who-title" className="gutter grid gap-12 border-t border-ink/10 py-24 md:grid-cols-12">
        <h2 id="who-title" className="label text-muted md:col-span-3">Who we are</h2>
        <div className="md:col-span-9">
          <Reveal as="p" className="max-w-3xl text-lede text-ink/80">{whoWeAre[1]}</Reveal>
          <Reveal as="p" className="mt-6 max-w-3xl text-lede text-ink/80">{whoWeAre[2]}</Reveal>
          <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="What we combine">
            {pillars.map((p, i) => (
              <li key={p} className="flex items-baseline gap-3 border-t border-ink/15 pt-4 font-display text-title font-semibold [font-stretch:85%]">
                <span className="label text-signal-ink">{i === 0 ? "" : "+"}</span>{p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* the quote */}
      <section aria-label="Our stance" className="gutter py-28 md:py-40">
        <SplitReveal as="p" variant="blur" className="max-w-[20ch] font-display text-display font-semibold [font-stretch:80%]">
          {quote.lead} <span className="serif-accent font-normal text-signal">{quote.turn}</span>
        </SplitReveal>
      </section>

      {/* philosophy outcomes */}
      <section aria-labelledby="philosophy-title" className="act-rose py-24">
        <div className="gutter grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="philosophy-title" className="label text-muted">Our marketing philosophy</h2>
            <p className="mt-6 font-display text-title font-semibold [font-stretch:86%]">{philosophy.intro}</p>
          </div>
          <Reveal group as="ul" className="grid gap-6 sm:grid-cols-2 md:col-span-8">
            {philosophy.outcomes.map((o, i) => (
              <li key={o.title} className="border-t border-ink/15 pt-5">
                <span className="label text-signal-ink">{pad(i + 1)}</span>
                <h3 className="mt-3 font-display text-title font-semibold [font-stretch:86%]">{o.title}</h3>
                <p className="mt-2 text-ink/75">{o.body}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* vision + mission */}
      <section aria-label="Vision and mission" className="gutter grid gap-6 py-24 md:grid-cols-2">
        {[{ k: "Our vision", v: vision }, { k: "Our mission", v: mission }].map((x) => (
          <Reveal key={x.k} className="rounded-[22px] border border-ink/10 bg-petal p-8 md:p-12">
            <h2 className="label text-signal-ink">{x.k}</h2>
            <p className="mt-6 font-display text-title font-semibold leading-snug [font-stretch:88%]">“{x.v}”</p>
          </Reveal>
        ))}
      </section>

      <MethodBoard />

      {/* principles */}
      <section aria-labelledby="principles-title" className="gutter py-28">
        <p className="label text-muted">What we stand for</p>
        <h2 id="principles-title" className="mt-4 max-w-[16ch] font-display text-headline font-semibold [font-stretch:82%]">
          Six principles, <span className="serif-accent font-normal text-signal">one stance.</span>
        </h2>
        <div className="mt-14"><PrincipleStack /></div>
      </section>

      {/* personality + differentiators */}
      <section aria-labelledby="different-title" className="gutter border-t border-ink/10 py-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="different-title" className="label text-muted">What makes us different</h2>
            <ul className="mt-8 flex flex-col gap-6">
              {personality.map((p) => (
                <li key={p.title}>
                  <span className="font-display text-title font-semibold uppercase [font-stretch:80%]">{p.title}</span>
                  <p className="mt-1 text-sm text-ink/65">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <Reveal group as="ol" className="grid gap-x-8 sm:grid-cols-2 md:col-span-8">
            {differentiators.map((d, i) => (
              <li key={d.title} className="border-t border-ink/10 py-6">
                <span className="label text-signal-ink">{pad(i + 1)}</span>
                <h3 className="mt-2 font-display text-[1.35rem] font-semibold [font-stretch:86%]">{d.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{d.body}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <Audiences />
      <AiAmplifies />
      <Finale />
    </PageShell>
  );
}
