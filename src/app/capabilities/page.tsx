import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhereNext } from "@/components/layout/WhereNext";
import { ServiceGroups } from "@/components/sections/ServiceGroups";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { serviceGroups, servicesIn } from "@/content/service-groups";

export const metadata: Metadata = {
  title: "Services",
  description:
    "The 18 marketing services of SOCIALxBRAND PILOT in four groups: strategy and social media; content and creative production; reach and enquiries; creators, community and digital tools.",
  alternates: { canonical: "/capabilities" },
};

/**
 * Services, client-first: the four groups first (what kind of help each is), then every one of the
 * 18 services in a plain directory (name and what it does, in its own words), then a way to ask.
 * Nothing to add to a brief here: a visitor first finds out what a service is, on its own page.
 */
export default function CapabilitiesPage() {
  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/capabilities" }])} />
      <PageHeader
        index="S"
        label="Services"
        crumbs={[{ name: "Services" }]}
        title={<>Our <span className="serif-accent font-normal ink-cobalt">services.</span></>}
        lede={<p>You do not need every service. Start with the goal you want to work on and explore the services that may fit.</p>}
      />

      <section aria-labelledby="groups-title" className="gutter pb-20 md:pb-28">
        <h2 id="groups-title" className="label text-blue">Four groups</h2>
        <div className="mt-6"><ServiceGroups toDirectory /></div>
      </section>

      <section aria-labelledby="directory-title" className="border-t border-line bg-sand/40 py-20 md:py-28">
        <div className="gutter">
          <p className="label text-blue">All 18 services</p>
          <h2 id="directory-title" className="mt-4 font-display text-headline font-medium">Every service, by group</h2>
          <div className="mt-12 flex flex-col gap-14">
            {serviceGroups.map((g) => (
              <div key={g.id} className="grid gap-6 md:grid-cols-12">
                <h3 id={g.id} className="scroll-mt-[calc(var(--nav-h)+2rem)] font-display text-title font-medium md:col-span-4">{g.name}</h3>
                <ul className="flex flex-col md:col-span-8">
                  {servicesIn(g).map((d) => (
                    <li key={d.slug} className="border-t border-ink/10 last:border-b">
                      <Link href={`/capabilities/${d.slug}`} transitionTypes={["nav-forward"]} className="group flex items-start justify-between gap-6 py-5">
                        <span>
                          <span className="block font-medium text-ink transition-colors group-hover:text-signal">{d.name}</span>
                          <span className="mt-1 line-clamp-2 block text-sm text-ink/70">{d.whatItIs[0]}</span>
                        </span>
                        <span aria-hidden className="mt-0.5 shrink-0 text-blue transition-transform duration-500 ease-[var(--ease-pilot)] group-hover:translate-x-1">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="unsure-title" className="gutter py-20">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="unsure-title" className="font-display text-title font-medium">Not sure what you need?</h2>
            <p className="mt-2 max-w-lg text-ink/75">Tell us about the business and the goal. We&apos;ll suggest where to start.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/route" transitionTypes={["nav-forward"]} className="inline-flex items-center gap-3 rounded-full bg-cta px-6 py-4 font-medium text-white transition-colors hover:bg-cta-hover">
              Contact us <span aria-hidden>→</span>
            </Link>
            <Link href="/route#brief" transitionTypes={["nav-forward"]} className="link-underline text-sm text-ink/80">Or build a project brief</Link>
          </div>
        </div>
      </section>

      <WhereNext links={[
        { href: "/route", label: "Contact us", hint: "WhatsApp, call or email, or build a project brief.", primary: true },
        { href: "/work", label: "See the work", hint: "Reels, films, photography and design." },
        { href: "/approach", label: "How we work", hint: "Four steps, from your goals to what we improve next." },
      ]} />
    </PageShell>
  );
}
