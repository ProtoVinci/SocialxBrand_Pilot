import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { Opening } from "@/components/home/Opening";
import { Ladder } from "@/components/home/Ladder";
import { WorkShowcase, type ShowcaseFrame, type ShowcaseTile } from "@/components/home/WorkShowcase";
import { MethodBoard } from "@/components/home/MethodBoard";
import { Audiences } from "@/components/home/Audiences";
import { AiAmplifies } from "@/components/home/AiAmplifies";
import { Finale } from "@/components/home/Finale";
import { Marquee } from "@/components/home/Marquee";
import { DivisionIndex } from "@/components/capabilities/DivisionIndex";
import { SplitReveal } from "@/components/motion/SplitReveal";
import { findMedia, liveScreenings, mediaFor, partnerCredit, type MediaAsset, type VideoAsset } from "@/content/work";
import { servicesIntro } from "@/content/site";
import { divisionPreviews } from "@/lib/previews";

const frame = (m: MediaAsset): ShowcaseFrame =>
  m.kind === "video"
    ? { poster: m.poster.webp, video: m.src.preview }
    : { poster: (m.srcset.webp.find((s) => s.w >= 960) ?? m.srcset.webp.at(-1)!).url };
const pick = (ids: string[]) => ids.map((id) => findMedia(id)).filter((m): m is VideoAsset => m?.kind === "video");

export default function Home() {
  // hero capsules: real reels only, always playing (no graphics, no figures)
  const pillsTop = pick(["brand-films-01", "theatre-culture-01", "wedding-content-04", "creator-content-01"]);
  const pillsBottom = pick(["restaurant-hospitality-01", "automotive-moments-01", "restaurant-hospitality-02", "portrait-fashion-01"]);
  const [takeover] = pick(["wedding-films-05"]);
  // none of these reappear as rail covers (each screening's first portrait reel) two screens later
  const ladder = pick(["wedding-content-03", "restaurant-hospitality-04", "creator-content-02", "brand-films-02", "automotive-moments-04"]);
  const chips = pick(["wedding-content-04", "restaurant-hospitality-01", "creator-content-01", "portrait-fashion-01"]);
  // recent work panel: one tile per screening; a landscape original fills its tile, vertical
  // work is staged upright (up to three frames), never cropped to landscape
  const tiles: ShowcaseTile[] = liveScreenings().slice(0, 10).map((s) => {
    const all = mediaFor(s.slug);
    const wide = all.find((m) => m.orientation === "landscape" && m.kind === "video") ?? all.find((m) => m.orientation === "landscape");
    const tall = all.filter((m) => m.orientation === "portrait");
    return { slug: s.slug, title: s.title, kicker: s.kicker, format: s.format, wide: wide && (wide.kind === "video" || tall.length < 2) ? frame(wide) : undefined, cards: tall.slice(0, 3).map(frame) };
  });

  return (
    <PageShell>
        <Opening takeover={takeover} pillsTop={pillsTop} pillsBottom={pillsBottom} />
        <Ladder reels={ladder} />
        <WorkShowcase tiles={tiles} credit={partnerCredit} />
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
