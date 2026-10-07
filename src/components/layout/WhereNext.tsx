import Link from "next/link";

export type NextLink = { href: string; label: string; hint: string; primary?: boolean };

/**
 * The end of every inner page: no dead ends. Two or three clear next steps (the most useful
 * one in the primary red) plus a constant way back home, so a visitor who has finished reading
 * never has to scroll back to the top to find the navigation.
 */
export function WhereNext({ links, title = "Where to next?" }: { links: NextLink[]; title?: string }) {
  return (
    <section aria-labelledby="where-next-title" className="gutter border-t border-line py-16 md:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="where-next-title" className="font-display text-title font-medium">{title}</h2>
        <Link href="/" transitionTypes={["nav-back"]} className="label text-blue underline-offset-4 hover:text-ink hover:underline">
          <span aria-hidden>← </span>Back to home
        </Link>
      </div>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              transitionTypes={["nav-forward"]}
              className={`group flex h-full flex-col justify-between gap-6 rounded-[22px] border p-6 transition-colors duration-300 ${
                l.primary ? "border-cta bg-cta text-white hover:bg-cta-hover" : "brand-card text-ink"
              }`}
            >
              <span className={`text-sm ${l.primary ? "text-white/85" : "text-muted"}`}>{l.hint}</span>
              <span className="flex items-center justify-between gap-3 font-display text-title font-medium">
                {l.label}
                <span aria-hidden className="transition-transform duration-500 ease-[var(--ease-pilot)] group-hover:translate-x-1.5">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
