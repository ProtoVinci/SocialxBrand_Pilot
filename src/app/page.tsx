import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Opening } from "@/components/home/Opening";
import { Ladder } from "@/components/home/Ladder";
import { Screenings } from "@/components/home/Screenings";
import { MethodRoute } from "@/components/home/MethodRoute";
import { Audiences } from "@/components/home/Audiences";
import { AiAmplifies } from "@/components/home/AiAmplifies";
import { Finale } from "@/components/home/Finale";
import { Marquee } from "@/components/home/Marquee";
import { DivisionIndex } from "@/components/capabilities/DivisionIndex";
import { DivisionTicker } from "@/components/capabilities/DivisionTicker";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { findMedia, liveScreenings, videosFor, type VideoAsset } from "@/content/work";
import { servicesIntro } from "@/content/site";
import { divisionPreviews } from "@/lib/previews";

const pick = (ids: string[]) => ids.map((id) => findMedia(id)).filter((m): m is VideoAsset => m?.kind === "video");

export default function Home() {
  const fan = pick(["creator-content-01", "automotive-moments-01", "wedding-films-05", "restaurant-hospitality-02", "theatre-culture-02"]);
  const ladder = pick(["portrait-fashion-01", "wedding-films-02", "restaurant-hospitality-01", "brand-films-01", "wedding-content-04"]);
  const chips = pick(["wedding-content-04", "restaurant-hospitality-01", "creator-content-01", "portrait-fashion-01"]);
  const rail = liveScreenings()
    .map((s) => ({ screening: s, reel: videosFor(s.slug).find((v) => v.orientation === "portrait") }))
    .filter((x): x is { screening: typeof x.screening; reel: VideoAsset } => Boolean(x.reel));

  return (
    <PageShell>
        <Opening fan={fan} />
        <Ladder reels={ladder} />
        <Screenings items={rail} />
        <Marquee chips={chips} />

        <section aria-labelledby="capabilities-title" className="relative bg-shell py-28 md:py-36">
          <div className="gutter">
            <p className="label text-muted">[ 04 ] Capabilities — 18 divisions</p>
            <SplitReveal as="h2" id="capabilities-title" className="mt-4 max-w-[18ch] font-display text-display font-semibold [font-stretch:80%]">
              Not every business needs <span className="serif-accent font-normal text-signal">every</span> service.
            </SplitReveal>
            <p className="mt-8 max-w-2xl text-lede text-ink/75">{servicesIntro.body}</p>
          </div>
          <div className="mt-14"><DivisionTicker /></div>
          <div className="gutter mt-20">
            <DivisionIndex previews={divisionPreviews()} />
            <Link href="/capabilities" transitionTypes={["nav-forward"]} className="link-underline mt-12 inline-block">Explore every capability →</Link>
          </div>
        </section>

        <MethodRoute />
        <Audiences />
        <AiAmplifies />
        <Finale />
      </PageShell>
  );
}
