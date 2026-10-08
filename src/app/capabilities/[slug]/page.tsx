import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { Reveal } from "@/components/motion/Reveal";
import { ApproachRoute } from "@/components/capabilities/ApproachRoute";
import { RouteToggle } from "@/components/capabilities/RouteToggle";
import { PlanRouteLink } from "@/components/capabilities/PlanRouteLink";
import { Reel } from "@/components/media/Reel";
import { Photo } from "@/components/media/Photo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, serviceLd } from "@/lib/seo";
import { Crumbs } from "@/components/layout/Crumbs";
import { WhereNext } from "@/components/layout/WhereNext";
import { clusters, divisionBySlug, divisions, pad } from "@/content/divisions";
import { mediaFor, screeningBySlug } from "@/content/work";

export const dynamicParams = false;
export function generateStaticParams() {
  return divisions.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/capabilities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = divisionBySlug(slug);
  if (!d) return {};
  // trim to ~160 chars on a word boundary (search snippets cut there anyway)
  const full = d.whatItIs.join(" ");
  const description = full.length <= 160 ? full : `${full.slice(0, 157).replace(/\s+\S*$/, "")}…`;
  return { title: d.name, description, alternates: { canonical: `/capabilities/${slug}` } };
}

export default async function DivisionPage({ params }: PageProps<"/capabilities/[slug]">) {
  const { slug } = await params;
  const d = divisionBySlug(slug);
  if (!d) notFound();
  const cluster = clusters.find((c) => c.id === d.cluster)!;
  const prev = divisions[(d.number - 2 + divisions.length) % divisions.length];
  const next = divisions[d.number % divisions.length];
  const work = d.relatedWork
    .map((s) => ({ screening: screeningBySlug(s)!, cover: mediaFor(s).find((a) => a.orientation === "portrait") ?? mediaFor(s)[0] }))
    .filter((w) => w.screening && w.cover);
  const related = d.related.map(divisionBySlug).filter(Boolean);
  const [lead, ...restIntro] = d.whatItIs;

  return (
    <PageShell key={slug}>
      <JsonLd data={serviceLd(d)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Capabilities", path: "/capabilities" }, { name: d.name, path: `/capabilities/${slug}` }])} />

      {/* identity */}
      <header className="gutter relative overflow-hidden pb-16 pt-[calc(var(--nav-h)+3rem)] md:pb-24">
        <span aria-hidden className="lane pointer-events-none absolute -right-[2vw] top-[calc(var(--nav-h)+1rem)] select-none font-display text-[clamp(10rem,30vw,28rem)] font-medium leading-[0.8] text-blue/70">
          {pad(d.number)}
        </span>
        <div className="relative">
          <Crumbs trail={[{ name: "Capabilities", href: "/capabilities" }, { name: d.shortName }]} />
          <p className="label mt-8 text-signal-ink">[ {pad(d.number)} / 18 ] {cluster.name}</p>
          <ViewTransition name={`division-${d.slug}`} share="morph" default="none">
            <h1 className="mt-4 max-w-[16ch] font-display text-display font-medium">{d.name}</h1>
          </ViewTransition>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <RouteToggle slug={d.slug} name={d.shortName} className="h-11 px-5 text-ink" />
            <PlanRouteLink slug={d.slug} className="link-underline text-sm text-ink/80">Plan a route with this →</PlanRouteLink>
          </div>
        </div>
      </header>

      {/* what it is */}
      <section aria-labelledby="what-title" className="gutter grid gap-10 border-t border-ink/10 py-20 md:grid-cols-12">
        <h2 id="what-title" className="label text-blue md:col-span-3">What it is</h2>
        <div className="md:col-span-9">
          <SplitReveal as="p" variant="blur" className="max-w-[34ch] font-display text-[clamp(1.6rem,2.9vw,3rem)] font-medium leading-[1.08] tracking-[-0.02em]">{lead}</SplitReveal>
          {restIntro.map((p) => (
            <Reveal key={p} as="p" className="mt-8 max-w-3xl text-lede text-ink/75">{p}</Reveal>
          ))}
        </div>
      </section>

      {/* capability groups */}
      <section aria-labelledby="groups-title" className="gutter border-t border-ink/10 py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <h2 id="groups-title" className="label text-blue md:col-span-3">What it covers</h2>
          <Reveal group className="grid gap-x-10 gap-y-14 md:col-span-9 md:grid-cols-2">
            {d.groups.map((g, gi) => (
              <div key={g.title}>
                <h3 className="flex items-baseline gap-3 font-display text-title font-medium">
                  <span className="label text-signal-ink">{pad(gi + 1)}</span>{g.title}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li key={item} className="rounded-full border border-ink/15 px-3 py-1.5 text-sm text-ink/85">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* deliverables */}
      <section aria-labelledby="deliverables-title" className="act-iris py-20">
        <div className="gutter grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <h2 id="deliverables-title" className="label text-blue">Key deliverables</h2>
            <p className="mt-4 font-display text-[clamp(4rem,8vw,7rem)] font-medium leading-none">{pad(d.deliverables.length)}</p>
          </div>
          <Reveal group as="ol" className="grid sm:grid-cols-2 md:col-span-9 md:grid-cols-3">
            {d.deliverables.map((x, i) => (
              <li key={x} className="flex items-baseline gap-3 border-t border-ink/15 py-4 pr-4">
                <span className="label text-signal-ink">{pad(i + 1)}</span>
                <span className="font-medium">{x}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* approach */}
      <section aria-labelledby="approach-title" className="gutter border-b border-ink/10 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="approach-title" className="font-display text-headline font-medium">Our <span className="serif-accent font-normal ink-cobalt">approach</span></h2>
          <p className="label text-blue">{d.approach.length} stations</p>
        </div>
        <div className="mt-14"><ApproachRoute steps={d.approach} /></div>
      </section>

      {/* real work */}
      {work.length > 0 && (
        <section aria-labelledby="work-title" className="gutter py-24">
          <h2 id="work-title" className="label text-blue">Work that shows it</h2>
          <ul className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            {work.map(({ screening, cover }) => (
              <li key={screening.slug}>
                <Link href={`/work/${screening.slug}`} transitionTypes={["nav-forward"]} className="group block">
                  <div className="aspect-[9/16] overflow-hidden rounded-[14px]">
                    {cover.kind === "video" ? <Reel asset={cover} mode="hover" label={screening.title} className="h-full w-full" /> : <Photo asset={cover} alt={screening.title} sizes="25vw" className="h-full w-full" />}
                  </div>
                  <span className="mt-3 block font-display text-[1.1rem] font-medium group-hover:text-signal">{screening.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* connections */}
      <section aria-labelledby="related-title" className="gutter border-t border-ink/10 py-24">
        <h2 id="related-title" className="label text-blue">Often combined with</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {related.map((r) => (
            <li key={r!.slug} className="relative rounded-[18px] border border-ink/10 p-6 transition-colors hover:border-ink/30">
              <Link href={`/capabilities/${r!.slug}`} transitionTypes={["nav-forward"]} className="block after:absolute after:inset-0">
                <span className="label text-signal-ink">[ {pad(r!.number)} ]</span>
                <span className="mt-3 block font-display text-title font-medium">{r!.shortName}</span>
                <span className="mt-3 line-clamp-3 block text-sm text-ink/65">{r!.whatItIs[0]}</span>
              </Link>
              <RouteToggle slug={r!.slug} name={r!.shortName} className="relative z-10 mt-6" />
            </li>
          ))}
        </ul>
      </section>

      <nav aria-label="Divisions" className="gutter grid grid-cols-2 border-t border-ink/10">
        <Link href={`/capabilities/${prev.slug}`} transitionTypes={["nav-back"]} className="group py-10 pr-6">
          <span className="label text-blue">← {pad(prev.number)}</span>
          <span className="mt-2 block font-display text-title font-medium group-hover:text-signal">{prev.shortName}</span>
        </Link>
        <Link href={`/capabilities/${next.slug}`} transitionTypes={["nav-forward"]} className="group border-l border-ink/10 py-10 pl-6 text-right">
          <span className="label text-blue">{pad(next.number)} →</span>
          <span className="mt-2 block font-display text-title font-medium group-hover:text-signal">{next.shortName}</span>
        </Link>
      </nav>
      <WhereNext links={[
        { href: "/route", label: "Plan your route", hint: "Combine this with what else your business needs.", primary: true },
        { href: "/capabilities", label: "All capabilities", hint: "The full set of 18 divisions." },
        { href: "/work", label: "See the work", hint: "Real reels, films, photography and design." },
      ]} />
    </PageShell>
  );
}
