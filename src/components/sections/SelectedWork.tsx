import Link from "next/link";
import { CardReel } from "@/components/sections/CardReel";
import { Photo } from "@/components/media/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { featuredWork, mediaFor, partnerCredit, screeningBySlug } from "@/content/work";
import { categoryLine } from "@/lib/category-line";

/**
 * The home page's (and How we work's) proof: a few real projects as plain cards (still poster,
 * title, category, format) and one way into the full work. Which projects lead is the owner's
 * choice (`featuredWork` in content/work.ts), not the site's. Each card's real clip plays, muted
 * and looping, while it is on screen (CardReel: shared video budget, poster until then).
 */
export function SelectedWork({ slugs = featuredWork, index, title = "Selected work", headingId = "selected-work-title" }: { slugs?: string[]; index?: string; title?: string; headingId?: string }) {
  const items = slugs
    .map((slug) => {
      const screening = screeningBySlug(slug);
      const assets = mediaFor(slug);
      const cover = assets.find((a) => a.orientation === "portrait" && a.kind === "video") ?? assets.find((a) => a.orientation === "portrait") ?? assets[0];
      return screening && cover ? { screening, cover } : null;
    })
    .filter((x) => x !== null);

  return (
    <section aria-labelledby={headingId} className="gutter py-20 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label text-blue">{index ? `[ ${index} ] ` : ""}Selected creative work</p>
          <h2 id={headingId} className="mt-4 font-display text-headline font-medium">{title}</h2>
        </div>
        <Link href="/work" transitionTypes={["nav-forward"]} className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-6 py-3 font-medium shadow-sm transition-colors hover:border-line-strong">
          View all work <span aria-hidden>→</span>
        </Link>
      </div>
      <Reveal group as="ul" className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-14 md:grid-cols-4 md:gap-x-6">
        {items.map(({ screening, cover }) => (
          <li key={screening.slug}>
            <Link href={`/work/${screening.slug}`} transitionTypes={["nav-forward"]} className="group block">
              <div className={`overflow-hidden rounded-[16px] ${cover.orientation === "portrait" ? "aspect-[9/16]" : "aspect-[4/5]"}`}>
                {cover.kind === "video" ? (
                  <CardReel asset={cover} className="h-full w-full transition-transform duration-[1.2s] ease-[var(--ease-pilot)] group-hover:scale-[1.03]" />
                ) : (
                  <Photo asset={cover} alt="" sizes="(min-width: 768px) 25vw, 50vw" className="h-full w-full" imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-pilot)] group-hover:scale-[1.03]" />
                )}
              </div>
              <span className="mt-4 block font-display text-[1.25rem] font-medium leading-tight transition-colors group-hover:text-signal md:text-title">{screening.title}</span>
              <span className="mt-1 block text-sm text-ink/65">{categoryLine(screening)}</span>
              <span className="label mt-3 inline-block text-blue">View project <span aria-hidden>→</span></span>
            </Link>
          </li>
        ))}
      </Reveal>
      <p className="label mt-10 text-muted">{partnerCredit}</p>
    </section>
  );
}
