import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Opening } from "@/components/home/Opening";
import { Ladder } from "@/components/home/Ladder";
import { Screenings } from "@/components/home/Screenings";
import { MethodBoard } from "@/components/home/MethodBoard";
import { Audiences } from "@/components/home/Audiences";
import { AiAmplifies } from "@/components/home/AiAmplifies";
import { Finale } from "@/components/home/Finale";
import { Marquee } from "@/components/home/Marquee";
import { DivisionIndex } from "@/components/capabilities/DivisionIndex";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { findMedia, liveScreenings, videosFor, type MediaAsset, type VideoAsset } from "@/content/work";
import { servicesIntro } from "@/content/site";
import { divisionPreviews } from "@/lib/previews";

const any = (ids: string[]) => ids.map((id) => findMedia(id)).filter((m): m is MediaAsset => Boolean(m));
const pick = (ids: string[]) => ids.map((id) => findMedia(id)).filter((m): m is VideoAsset => m?.kind === "video");

export default function Home() {
  // hero capsules: real reels and stills only (no graphics, no figures)
  const pillsTop = any(["brand-films-01", "portrait-fashion-03", "theatre-culture-01", "wedding-photography-05"]);
  const pillsBottom = any(["restaurant-hospitality-01", "logo-identity-05", "automotive-moments-01", "wedding-content-04"]);
  const [takeover] = pick(["wedding-films-05"]);
  // none of these reappear as rail covers (each screening's first portrait reel) two screens later
  const ladder = pick(["wedding-content-03", "restaurant-hospitality-04", "creator-content-02", "brand-films-02", "automotive-moments-04"]);
  const chips = pick(["wedding-content-04", "restaurant-hospitality-01", "creator-content-01", "portrait-fashion-01"]);
  const rail = liveScreenings()
    .map((s) => ({ screening: s, reel: videosFor(s.slug).find((v) => v.orientation === "portrait") }))
    .filter((x): x is { screening: typeof x.screening; reel: VideoAsset } => Boolean(x.reel));

  return (
    <PageShell>
        <Opening takeover={takeover} pillsTop={pillsTop} pillsBottom={pillsBottom} />
        <Ladder reels={ladder} />
        <Screenings items={rail} />
        <Marquee chips={chips} />

        <section aria-labelledby="capabilities-title" className="relative bg-shell py-28 md:py-36">
          <div className="gutter">
            <p className="label text-blue">[ 04 ] Capabilities — 18 divisions</p>
            <SplitReveal as="h2" id="capabilities-title" className="mt-4 max-w-[18ch] font-display text-display font-medium">
              Not every business needs <span className="serif-accent font-normal text-signal">every</span> service.
            </SplitReveal>
            <p className="mt-8 max-w-2xl text-lede text-ink/75">{servicesIntro.body}</p>
          </div>
          {/* no ticker here: the marquee just above already runs two belts, and the index below
              lists the same 18 names (the ticker lives on /capabilities) */}
          <div className="gutter mt-16">
            <DivisionIndex previews={divisionPreviews()} />
            <Link href="/capabilities" transitionTypes={["nav-forward"]} className="link-underline mt-12 inline-block">Explore every capability →</Link>
          </div>
        </section>

        <MethodBoard />
        <Audiences />
        <AiAmplifies />
        <Finale />
      </PageShell>
  );
}
