import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhereNext } from "@/components/layout/WhereNext";
import { WorkIndex, type IndexItem } from "@/components/work/WorkIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { featuredWork, liveScreenings, mediaFor, partnerCredit } from "@/content/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected work from SOCIALxBRAND PILOT: video, photography and design for businesses, brands and events, from restaurant and creator content to brand films, menus, posters and logo identities.",
  alternates: { canonical: "/work" },
};


export default function WorkPage() {
  // the owner's lead projects first (the same ones the home page shows), then the rest in order
  const rank = (slug: string) => { const i = featuredWork.indexOf(slug); return i < 0 ? featuredWork.length : i; };
  const items: IndexItem[] = liveScreenings()
    .map((s, order) => ({ s, order }))
    .sort((a, b) => rank(a.s.slug) - rank(b.s.slug) || a.order - b.order)
    .map(({ s }) => {
      const assets = mediaFor(s.slug);
      const cover = assets.find((a) => a.kind === "video" && a.orientation === "portrait") ?? assets[0];
      return { screening: s, cover };
    });

  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <PageHeader
        index="W"
        label="Work"
        crumbs={[{ name: "Work" }]}
        title={<>Selected <span className="serif-accent font-normal text-signal">work.</span></>}
        lede={
          <>
            <p>Explore video, photography and design created for businesses, brands and events.</p>
            <p className="label mt-6 text-blue">{partnerCredit}</p>
          </>
        }
      />
      <div className="pb-32">
        <WorkIndex items={items} />
      </div>
      <WhereNext links={[
        { href: "/route", label: "Contact us", hint: "Seen something you want for your business? Tell us about it.", primary: true },
        { href: "/capabilities", label: "Services", hint: "The 18 services behind this work, in four groups." },
        { href: "/approach", label: "How we work", hint: "Four steps, from your goals to what we improve next." },
      ]} />
    </PageShell>
  );
}
