import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhereNext } from "@/components/layout/WhereNext";
import { RouteBuilder } from "@/components/route/RouteBuilder";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us: WhatsApp, Call or Email",
  description: "Contact SOCIALxBRAND PILOT by WhatsApp, phone or email, or build a short project brief and send it by WhatsApp or email.",
  path: "/route",
});

/**
 * Contact, client-first: the direct ways in come first, for everyone; the project brief is an
 * optional extra below them, and says plainly that the site itself sends nothing (the visitor sends
 * the brief from their own WhatsApp or email, or copies it). The URL stays /route.
 */
export default function RoutePage() {
  const wa = `https://wa.me/${site.phoneE164.replace("+", "")}`;
  const ways = [
    { label: "WhatsApp", value: "Message us", href: wa, external: true },
    { label: "Call", value: site.phoneDisplay, href: `tel:${site.phoneE164}` },
    { label: "Email", value: site.email, href: `mailto:${site.email}` },
  ];
  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact us", path: "/route" }])} />
      <PageHeader
        index="C"
        label="Contact us"
        crumbs={[{ name: "Contact us" }]}
        title={<>Contact <span className="serif-accent font-normal text-signal">us.</span></>}
        lede={<p>Message us on WhatsApp, call or email: whichever suits you. If you like, build a short project brief first.</p>}
      />

      <section aria-labelledby="direct-title" className="gutter pb-16">
        <h2 id="direct-title" className="sr-only">Talk to us directly</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {ways.map((w) => (
            <li key={w.label}>
              <a
                href={w.href}
                {...(w.external ? { target: "_blank", rel: "noopener" } : {})}
                className="brand-card group flex min-h-28 flex-col justify-between gap-4 rounded-[22px] p-6 hover:border-ink/30"
              >
                <span className="label text-blue">{w.label}</span>
                <span className="flex items-center justify-between gap-3 font-display text-title font-medium [overflow-wrap:anywhere]">
                  {w.value}
                  <span aria-hidden className="shrink-0 transition-transform duration-500 ease-[var(--ease-pilot)] group-hover:translate-x-1">{w.external ? "↗" : "→"}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section id="brief" aria-labelledby="brief-title" className="gutter scroll-mt-[calc(var(--nav-h)+1rem)] border-t border-ink/10 pb-32 pt-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label text-blue">Optional</p>
            <h2 id="brief-title" className="mt-4 font-display text-headline font-medium">Build a project brief</h2>
            <p className="mt-4 text-ink/75">Five short steps: who you are, what you want marketing to do, any services you&apos;re interested in (or none yet), and how to reply.</p>
            <p className="mt-4 text-ink/75">At the end, choose WhatsApp or email to send the brief, or copy it. The website does not submit the message automatically.</p>
          </div>
          <div className="lg:col-span-8">
            <Suspense fallback={<div className="h-[40rem] rounded-[24px] border border-ink/10 bg-petal" />}>
              <RouteBuilder />
            </Suspense>
          </div>
        </div>
      </section>

      <WhereNext title="Not ready yet?" links={[
        { href: "/work", label: "See the work", hint: "Reels, films, photography and design." },
        { href: "/capabilities", label: "Services", hint: "The 18 services, and what each one does." },
        { href: "/approach", label: "How we work", hint: "Four steps, from your goals to what we improve next." },
      ]} />
    </PageShell>
  );
}
