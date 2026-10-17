import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/motion/Reveal";
import { PlanRouteLink } from "@/components/capabilities/PlanRouteLink";
import { AiAmplifies } from "@/components/home/AiAmplifies";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Reel } from "@/components/media/Reel";
import { Photo } from "@/components/media/Photo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, serviceLd } from "@/lib/seo";
import { Crumbs } from "@/components/layout/Crumbs";
import { WhereNext } from "@/components/layout/WhereNext";
import { divisionBySlug, divisions, pad } from "@/content/divisions";
import { groupOf, lookalikeOf } from "@/content/service-groups";
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

/** How many deliverables show before "See the full scope". */
const INCLUDED = 6;

/**
 * One service, in the same order on all 18 pages (client-first refactor, 2026-10-16): what it is →
 * what it helps with → typical deliverables (the full scope one click away; "typical", not
 * "included", until the owner confirms fixed scopes, 2026-10-17) → relevant work → how we
 * work (the shared four steps) → related services → contact. All copy is the service's own (PDF).
 */
export default async function DivisionPage({ params }: PageProps<"/capabilities/[slug]">) {
  const { slug } = await params;
  const d = divisionBySlug(slug);
  if (!d) notFound();
  const group = groupOf(d.slug);
  const lookalike = lookalikeOf(d.slug);
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
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/capabilities" }, { name: d.name, path: `/capabilities/${slug}` }])} />

      {/* what it is */}
      <header className="gutter relative overflow-hidden pb-16 pt-[calc(var(--nav-h)+3rem)] md:pb-20">
        {/* the service number, as faint decoration only: the name leads */}
        <span aria-hidden className="pointer-events-none absolute -right-[2vw] top-[calc(var(--nav-h)+1rem)] select-none font-display text-[clamp(10rem,30vw,28rem)] font-medium leading-[0.8] text-blue/[0.06]">
          {pad(d.number)}
        </span>
        <div className="relative">
          <Crumbs trail={[{ name: "Services", href: "/capabilities" }, { name: d.shortName }]} />
          <p className="label mt-8 text-signal-ink">Service{group ? ` · ${group.name}` : ""}</p>
          <ViewTransition name={`division-${d.slug}`} share="morph" default="none">
            <h1 className="mt-4 max-w-[18ch] font-display text-display font-medium">{d.name}</h1>
          </ViewTransition>
          <p className="mt-8 max-w-3xl text-lede text-ink/80">{lead}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <PlanRouteLink slug={d.slug} className="inline-flex items-center gap-3 rounded-full bg-cta px-6 py-3.5 font-medium text-white transition-colors hover:bg-cta-hover">
              Discuss this service <span aria-hidden>→</span>
            </PlanRouteLink>
            {work.length > 0 && <a href="#work" className="link-underline text-sm text-ink/80">See relevant work</a>}
          </div>
        </div>
      </header>

      {/* what it helps with */}
      <section aria-labelledby="helps-title" className="gutter grid gap-10 border-t border-ink/10 py-16 md:grid-cols-12 md:py-20">
        <h2 id="helps-title" className="label text-blue md:col-span-3">What this service helps with</h2>
        <div className="md:col-span-9">
          {restIntro.map((p) => (
            <Reveal key={p} as="p" className="mb-6 max-w-3xl text-lede text-ink/80">{p}</Reveal>
          ))}
          <ul className="grid max-w-3xl gap-x-8 sm:grid-cols-2">
            {d.groups.map((g) => (
              <li key={g.title} className="flex items-baseline gap-3 border-t border-ink/10 py-3.5">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 translate-y-[-0.15em] rounded-full bg-signal" />
                {g.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* typical deliverables */}
      <section aria-labelledby="included-title" className="act-iris py-16 md:py-20">
        <div className="gutter grid gap-10 md:grid-cols-12">
          <div className="md:col-span-3">
            <h2 id="included-title" className="label text-blue">Typical deliverables</h2>
            <p className="mt-3 text-sm text-ink/75">Examples of what this service can produce. The exact deliverables depend on the brief we agree with you.</p>
          </div>
          <div className="md:col-span-9">
            <ul className="grid sm:grid-cols-2 md:grid-cols-3">
              {d.deliverables.slice(0, INCLUDED).map((x) => (
                <li key={x} className="border-t border-ink/15 py-4 pr-4 font-medium">{x}</li>
              ))}
            </ul>
            {/* everything the service document lists, for whoever wants the detail */}
            <details className="group mt-6 rounded-[18px] border border-ink/15 bg-white/40">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-medium">
                See the full scope
                <span aria-hidden className="text-blue transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="flex flex-col gap-8 px-5 pb-6 pt-2">
                {d.groups.map((g) => (
                  <div key={g.title}>
                    <h3 className="font-medium">{g.title}</h3>
                    <p className="mt-1 text-sm text-ink/75">{g.items.join(" · ")}</p>
                  </div>
                ))}
                <div>
                  <h3 className="font-medium">All deliverables</h3>
                  <p className="mt-1 text-sm text-ink/75">{d.deliverables.join(" · ")}</p>
                </div>
                <div>
                  <h3 className="font-medium">How this service usually runs</h3>
                  <p className="mt-1 text-sm text-ink/75">{d.approach.join(" → ")}</p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      {d.slug === "ai-marketing-automation" && <AiAmplifies />}

      {/* relevant work */}
      {work.length > 0 && (
        <section aria-labelledby="work-title" className="gutter scroll-mt-[calc(var(--nav-h)+1rem)] py-20" id="work">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="work-title" className="font-display text-title font-medium">Relevant work</h2>
            <Link href="/work" transitionTypes={["nav-forward"]} className="label text-blue underline-offset-4 hover:text-ink hover:underline">All work →</Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
            {work.map(({ screening, cover }) => (
              <li key={screening.slug}>
                <Link href={`/work/${screening.slug}`} transitionTypes={["nav-forward"]} className="group block">
                  <div className="aspect-[9/16] overflow-hidden rounded-[14px]">
                    {cover.kind === "video" ? <Reel asset={cover} mode="hover" label={screening.title} className="h-full w-full" /> : <Photo asset={cover} alt={screening.title} sizes="25vw" className="h-full w-full" />}
                  </div>
                  <span className="mt-3 block font-display text-[1.1rem] font-medium group-hover:text-signal">{screening.title}</span>
                  <span className="block text-sm text-ink/65">{screening.format}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* how we work */}
      <section aria-labelledby="process-title" className="gutter border-t border-ink/10 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="process-title" className="font-display text-title font-medium">How we work</h2>
          <Link href="/approach" transitionTypes={["nav-forward"]} className="label text-blue underline-offset-4 hover:text-ink hover:underline">More on how we work →</Link>
        </div>
        <div className="mt-10"><ProcessSteps /></div>
      </section>

      {/* services that sound alike, told apart in their own words */}
      {lookalike && (
        <section aria-labelledby="lookalike-title" className="gutter pb-6">
          <div className="rounded-[20px] border border-ink/10 bg-sand/50 p-6 md:p-8">
            <h2 id="lookalike-title" className="label text-blue">Not the same as {lookalike.shortName}</h2>
            <p className="mt-3 max-w-3xl text-ink/80">{lookalike.whatItIs[0]}</p>
            <Link href={`/capabilities/${lookalike.slug}`} transitionTypes={["nav-forward"]} className="link-underline mt-4 inline-block text-sm">About {lookalike.shortName} →</Link>
          </div>
        </section>
      )}

      {/* related services */}
      <section aria-labelledby="related-title" className="gutter py-20">
        <h2 id="related-title" className="font-display text-title font-medium">Related services</h2>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {related.map((r) => (
            <li key={r!.slug}>
              <Link href={`/capabilities/${r!.slug}`} transitionTypes={["nav-forward"]} className="brand-card block h-full rounded-[18px] p-6 transition-colors hover:border-ink/30">
                <span className="block font-display text-title font-medium">{r!.shortName}</span>
                <span className="mt-3 line-clamp-3 block text-sm text-ink/65">{r!.whatItIs[0]}</span>
              </Link>
            </li>
          ))}
        </ul>
        {/* browsing the catalogue stays possible, quietly */}
        <nav aria-label="Other services" className="mt-12 flex flex-wrap justify-between gap-4 border-t border-ink/10 pt-6 text-sm">
          <Link href={`/capabilities/${prev.slug}`} transitionTypes={["nav-back"]} className="text-ink/65 hover:text-ink">← {prev.shortName}</Link>
          <Link href={`/capabilities/${next.slug}`} transitionTypes={["nav-forward"]} className="text-ink/65 hover:text-ink">{next.shortName} →</Link>
        </nav>
      </section>

      <WhereNext links={[
        { href: "/route", label: "Discuss this service", hint: "WhatsApp, call or email, or build a project brief.", primary: true },
        { href: "/capabilities", label: "All services", hint: "All 18, in four groups." },
        { href: "/work", label: "See the work", hint: "Reels, films, photography and design." },
      ]} />
    </PageShell>
  );
}
