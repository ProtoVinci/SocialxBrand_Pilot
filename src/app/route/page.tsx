import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RouteBuilder } from "@/components/route/RouteBuilder";
import { Clock } from "@/components/layout/Clock";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Start your route — contact",
  description: "Tell SOCIALxBRAND PILOT about your business and goal, choose a starting mix of divisions, and send the brief by WhatsApp or email. Or just talk to us directly.",
  alternates: { canonical: "/route" },
};

export default function RoutePage() {
  const wa = `https://wa.me/${site.phoneE164.replace("+", "")}`;
  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Start your route", path: "/route" }])} />
      <PageHeader
        index="R"
        label="The Pilot Route — plan, then talk"
        title={<>Start your <span className="serif-accent font-normal text-signal">route.</span></>}
        lede={<p>A minute of context helps us start in the right place. Choose who you are and what you need, pick a starting mix, and send it however you like.</p>}
      />
      <div className="gutter grid gap-10 pb-32 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <Suspense fallback={<div className="h-[40rem] rounded-[24px] border border-ink/10 bg-petal" />}>
            <RouteBuilder />
          </Suspense>
        </div>
        <aside aria-labelledby="talk-title" className="lg:col-span-4">
          <div className="sticky top-[calc(var(--nav-h)+1.5rem)] rounded-[24px] border border-ink/10 p-6 md:p-8">
            <h2 id="talk-title" className="font-display text-title font-medium">Or just talk to us.</h2>
            <dl className="mt-6 flex flex-col gap-5">
              <div><dt className="label text-blue">Email</dt><dd className="mt-1"><a className="link-underline" href={`mailto:${site.email}`}>{site.email}</a></dd></div>
              <div><dt className="label text-blue">Phone</dt><dd className="mt-1"><a className="link-underline" href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a></dd></div>
              <div><dt className="label text-blue">WhatsApp</dt><dd className="mt-1"><a className="link-underline" href={wa} target="_blank" rel="noopener">Message us ↗</a></dd></div>
              <div><dt className="label text-blue">Web</dt><dd className="mt-1">www.sxbp.com</dd></div>
            </dl>
            <Clock className="mt-8 text-muted" />
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
