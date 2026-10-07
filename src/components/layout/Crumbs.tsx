import Link from "next/link";

export type Crumb = { name: string; href?: string };

/**
 * Visible breadcrumb trail for every inner page, so a visitor always knows where they are and
 * has a one-tap way back up (the JSON-LD breadcrumbs only ever helped search engines).
 * The last crumb is the current page and is not a link.
 */
export function Crumbs({ trail, className = "" }: { trail: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ name: "Home", href: "/" }, ...trail];
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="label flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.name}-${i}`} className="flex items-center gap-2">
              {c.href && !last ? (
                <Link href={c.href} transitionTypes={["nav-back"]} className="text-blue underline-offset-4 hover:text-ink hover:underline">
                  {i === 0 ? <><span aria-hidden>← </span>{c.name}</> : c.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">{c.name}</span>
              )}
              {!last && <span aria-hidden className="text-ink/30">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
