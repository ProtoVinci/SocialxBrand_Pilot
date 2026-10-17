import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { NoExitTransition } from "@/components/layout/NoExitTransition";
import { Opening } from "@/components/home/Opening";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ClientFeedback } from "@/components/sections/ClientFeedback";
import { ServiceGroups } from "@/components/sections/ServiceGroups";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { findMedia, type VideoAsset } from "@/content/work";
import { servicesIntro } from "@/content/site";

const pick = (ids: string[]) => ids.map((id) => findMedia(id)).filter((m): m is VideoAsset => m?.kind === "video");

/**
 * The home page as a short front door (client-first refactor, 2026-10-16): what the agency does,
 * real work, the services in four groups, the process in four steps, and one way to get in touch.
 * Hero → selected work → services → how we work → client feedback (once approved) → contact, then
 * the footer.
 */
export default function Home() {
  // hero capsules: real reels only, always playing (no graphics, no figures)
  const pillsTop = pick(["brand-films-01", "theatre-culture-01", "wedding-content-04", "creator-content-01"]);
  const pillsBottom = pick(["restaurant-hospitality-01", "automotive-moments-01", "restaurant-hospitality-02", "portrait-fashion-01"]);

  return (
    <PageShell>
      {/* leaving home skips the page transition (see the component) */}
      <NoExitTransition />
      <Opening pillsTop={pillsTop} pillsBottom={pillsBottom} />

      <SelectedWork index="01" />

      <section aria-labelledby="services-title" className="border-t border-line bg-sand/40 py-20 md:py-28">
        <div className="gutter">
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="label text-blue">[ 02 ] Services</p>
              <h2 id="services-title" className="mt-4 font-display text-headline font-medium">What we can help with</h2>
            </div>
            <p className="max-w-xl text-ink/75 md:col-span-5">
              <strong className="font-semibold text-ink">{servicesIntro.lead}</strong> Eighteen services in four groups: start with the kind of help you need.
            </p>
          </div>
          <div className="mt-10 md:mt-14"><ServiceGroups /></div>
          <Link href="/capabilities" transitionTypes={["nav-forward"]} className="mt-10 inline-flex items-center gap-3 rounded-full border border-line bg-white px-6 py-3 font-medium shadow-sm transition-colors hover:border-line-strong">
            Explore all services <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="process-title" className="gutter py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-blue">[ 03 ] How we work</p>
            <h2 id="process-title" className="mt-4 font-display text-headline font-medium">Four steps, from first conversation to ongoing improvement</h2>
          </div>
          <Link href="/approach" transitionTypes={["nav-forward"]} className="label text-blue underline-offset-4 hover:text-ink hover:underline">
            More on how we work <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="mt-10 md:mt-14"><ProcessSteps /></div>
      </section>

      {/* near the end, before the closing call to action: renders only once approved client
          feedback exists (content/feedback.ts); nothing at all until then */}
      <ClientFeedback />

      <ClosingCta />
    </PageShell>
  );
}
