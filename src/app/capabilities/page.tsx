import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { DivisionIndex } from "@/components/capabilities/DivisionIndex";
import { DivisionTicker } from "@/components/capabilities/DivisionTicker";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { divisionPreviews } from "@/lib/previews";
import { servicesIntro } from "@/content/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Capabilities — 18 marketing divisions",
  description:
    "Strategy & consulting, social media, content, design, video, photography, branding, campaigns, performance marketing, SEO, WhatsApp, creators, YouTube, reputation & PR, and AI marketing: 18 divisions, combined around what your business needs.",
  alternates: { canonical: "/capabilities" },
};

export default function CapabilitiesPage() {
  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Capabilities", path: "/capabilities" }])} />
      <PageHeader
        index="C"
        label="Capabilities — 18 core marketing divisions"
        title={<>The right mix, <span className="serif-accent font-normal text-signal">not the full menu.</span></>}
        lede={
          <>
            <p><strong className="font-semibold text-ink">{servicesIntro.lead}</strong> {servicesIntro.body}</p>
            <p className="mt-4 text-ink/60">Add the divisions that sound like your problem to your route, and we&apos;ll start the conversation from there.</p>
          </>
        }
      />
      <DivisionTicker />
      <div className="gutter py-24">
        <DivisionIndex previews={divisionPreviews()} headingLevel="h2" />
        <div className="mt-20 flex flex-col items-start gap-6 border-t border-ink/10 pt-12 md:flex-row md:items-center md:justify-between">
          <p className="max-w-lg text-lede text-ink/75">Not sure where to start? Tell us about the business and the goal; we&apos;ll suggest a starting route.</p>
          <Link href="/route" transitionTypes={["nav-forward"]} className="inline-flex items-center gap-3 rounded-full bg-ink px-6 py-4 font-semibold text-shell">
            Plan your route <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
