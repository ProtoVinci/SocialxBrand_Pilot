import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { serviceGroups, servicesIn } from "@/content/service-groups";

/**
 * The 18 services as four plain groups: what kind of help each group is, a few of its services,
 * and a way to the rest. `examples`: how many service names each card lists (all on the
 * Services page directory). On the Services page the cards jump to their group in the directory.
 */
export function ServiceGroups({ examples = 4, toDirectory = false }: { examples?: number; toDirectory?: boolean }) {
  return (
    <Reveal group as="ul" className="grid gap-4 md:grid-cols-2">
      {serviceGroups.map((g, i) => {
        const services = servicesIn(g);
        const more = services.length - examples;
        return (
          <li key={g.id} className="brand-card flex flex-col rounded-[22px] p-6 md:p-8">
            <span className="label text-signal-ink">{String(i + 1).padStart(2, "0")} · {services.length} services</span>
            <h3 className="mt-3 font-display text-title font-medium">{g.name}</h3>
            <p className="mt-3 max-w-prose text-ink/75">{g.summary}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {services.slice(0, examples).map((d) => (
                <li key={d.slug}>
                  <Link href={`/capabilities/${d.slug}`} transitionTypes={["nav-forward"]} className="inline-flex min-h-10 items-center rounded-full border border-ink/15 px-3.5 text-sm text-ink/85 transition-colors hover:border-signal hover:text-signal">
                    {d.shortName}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={toDirectory ? `#${g.id}` : `/capabilities#${g.id}`}
              transitionTypes={toDirectory ? undefined : ["nav-forward"]}
              className="label mt-auto inline-flex min-h-11 items-end pt-6 text-blue underline-offset-4 hover:text-ink hover:underline"
            >
              {more > 0 ? `See all ${services.length} in ${g.name}` : `More about ${g.name}`} <span aria-hidden className="ml-1">→</span>
            </Link>
          </li>
        );
      })}
    </Reveal>
  );
}
