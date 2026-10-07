import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { ScreeningMedia } from "@/components/work/ScreeningMedia";
import { Reel } from "@/components/media/Reel";
import { Photo } from "@/components/media/Photo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { liveScreenings, mediaFor, partnerCredit, photosFor, screeningBySlug, videosFor } from "@/content/work";
import { divisionBySlug, pad } from "@/content/divisions";

export const dynamicParams = false;
export function generateStaticParams() {
  return liveScreenings().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = screeningBySlug(slug);
  if (!s) return {};
  return { title: `${s.title} — Work`, description: `${s.line} ${s.format} by SOCIALxBRAND PILOT.`, alternates: { canonical: `/work/${slug}` } };
}

export default async function ScreeningPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const s = screeningBySlug(slug);
  if (!s) notFound();
  const all = liveScreenings();
  const idx = all.findIndex((x) => x.slug === slug);
  const next = all[(idx + 1) % all.length];
  const assets = mediaFor(slug);
  const videos = videosFor(slug);
  const photos = photosFor(slug);
  const cover = assets.find((a) => a.kind === "video" && a.orientation === "portrait") ?? assets[0];
  const nextCover = mediaFor(next.slug).find((a) => a.kind === "video" && a.orientation === "portrait") ?? mediaFor(next.slug)[0];
  const rest = { videos: videos.filter((v) => v.id !== cover.id), photos: photos.filter((p) => p.id !== cover.id) };

  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: s.title, path: `/work/${slug}` }])} />
      <header className="gutter grid gap-12 pb-20 pt-[calc(var(--nav-h)+3rem)] md:grid-cols-12 md:items-end">
        <div className="md:col-span-7">
          <Link href="/work" transitionTypes={["nav-back"]} className="label text-blue hover:text-ink">← All work</Link>
          <p className="label mt-8 text-signal-ink">[ {pad(idx + 1)} / {pad(all.length)} ] {s.kicker}</p>
          <SplitReveal as="h1" trigger="mount" className="mt-4 font-display text-display font-medium">{s.title}</SplitReveal>
          <p className="mt-8 max-w-xl text-lede text-ink/80">{s.line}</p>
          <dl className="mt-10 grid max-w-xl grid-cols-2 gap-6 border-t border-ink/10 pt-6 text-sm">
            <div><dt className="label text-blue">Format</dt><dd className="mt-2">{s.format}</dd></div>
            <div><dt className="label text-blue">Pieces shown</dt><dd className="mt-2">{assets.length}</dd></div>
            <div className="col-span-2">
              <dt className="label text-blue">Capabilities shown</dt>
              <dd className="mt-3 flex flex-wrap gap-2">
                {s.divisions.map(divisionBySlug).filter(Boolean).map((d) => (
                  <Link key={d!.slug} href={`/capabilities/${d!.slug}`} transitionTypes={["nav-forward"]} className="rounded-full border border-ink/20 px-3 py-1.5 text-xs transition-colors hover:border-signal hover:text-signal">
                    {d!.shortName}
                  </Link>
                ))}
              </dd>
            </div>
          </dl>
          <p className="label mt-8 text-blue">{partnerCredit}</p>
        </div>
        <div className="md:col-span-5">
          <ViewTransition name={`screening-${slug}`} share="morph" default="none">
            <div className={`mx-auto overflow-hidden rounded-[18px] ${cover.orientation === "portrait" ? "aspect-[9/16] max-h-[78svh]" : "aspect-[4/5]"}`}>
              {cover.kind === "video" ? (
                <Reel asset={cover} eager priority={5} label={`${s.title} — featured`} className="h-full w-full" />
              ) : (
                <Photo asset={cover} eager alt={`${s.title} — featured`} sizes="(min-width: 768px) 40vw, 90vw" className="h-full w-full" />
              )}
            </div>
          </ViewTransition>
        </div>
      </header>

      <ScreeningMedia title={s.title} videos={rest.videos} photos={rest.photos} />

      <Link href={`/work/${next.slug}`} transitionTypes={["nav-forward"]} className="group block border-t border-ink/10">
        <div className="gutter flex items-center justify-between gap-8 py-20">
          <div>
            <p className="label text-blue">Next screening</p>
            <p className="mt-4 font-display text-display font-medium transition-colors group-hover:text-signal">{next.title} <span className="inline-block transition-transform duration-500 group-hover:translate-x-4">→</span></p>
          </div>
          {nextCover && (
            <div className="hidden aspect-[9/16] w-40 shrink-0 overflow-hidden rounded-[14px] md:block">
              {nextCover.kind === "video" ? <Reel asset={nextCover} mode="hover" className="h-full w-full" /> : <Photo asset={nextCover} alt="" sizes="160px" className="h-full w-full" />}
            </div>
          )}
        </div>
      </Link>
    </PageShell>
  );
}
