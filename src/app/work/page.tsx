import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhereNext } from "@/components/layout/WhereNext";
import { WorkIndex, type IndexItem } from "@/components/work/WorkIndex";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { liveScreenings, mediaFor, partnerCredit } from "@/content/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Real work from SOCIALxBRAND PILOT: creator reels, restaurant and hospitality content, brand films, wedding films and photography, menus, posters and logo identities.",
  alternates: { canonical: "/work" },
};

const familyOf = (format: string): IndexItem["family"] =>
  /design/i.test(format) ? "design" : /^photography$/i.test(format) ? "photo" : "motion";

export default function WorkPage() {
  const items: IndexItem[] = liveScreenings().map((s) => {
    const assets = mediaFor(s.slug);
    const cover = assets.find((a) => a.kind === "video" && a.orientation === "portrait") ?? assets[0];
    return { screening: s, cover, family: familyOf(s.format), count: assets.length };
  });

  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])} />
      <PageHeader
        index="W"
        label="Work — screenings"
        crumbs={[{ name: "Work" }]}
        title={<>The work, <span className="serif-accent font-normal text-signal">as it was made.</span></>}
        lede={
          <>
            <p>Reels, films, photography and design, presented in the formats they were made for. We show categories, not invented case studies: what you see is the work.</p>
            <p className="label mt-6 text-blue">{partnerCredit}</p>
          </>
        }
      />
      <div className="pb-32">
        <WorkIndex items={items} />
      </div>
      <WhereNext links={[
        { href: "/route", label: "Plan your route", hint: "Seen something you want for your business? Start here.", primary: true },
        { href: "/capabilities", label: "Capabilities", hint: "The 18 divisions behind this work." },
        { href: "/approach", label: "How we work", hint: "From understanding the business to growing it." },
      ]} />
    </PageShell>
  );
}
