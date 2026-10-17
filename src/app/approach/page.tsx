import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhereNext } from "@/components/layout/WhereNext";
import { Reveal } from "@/components/motion/Reveal";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";
import { differentiators, impact, servicesIntro } from "@/content/site";

export const metadata: Metadata = pageMetadata({
  title: "How We Work: Our Four-Step Process",
  description:
    "How SOCIALxBRAND PILOT works with a business, in four steps: understand the business, plan the right approach, create and execute, then review and improve.",
  path: "/approach",
});

/** The three statements that say most plainly how the agency works (from the company profile). */
const STANCE = ["Business-First Marketing", "Tailored Strategy", "Strategy + Creativity + Execution"];

/**
 * How we work, as a practical page (client-first refactor, 2026-10-16): the four steps (with the
 * method stages behind each), what the agency stands for in three lines, real work, and a way to
 * get in touch. The long boards, mission/vision cards, principle stack and repeated home sections
 * left this page.
 */
export default function ApproachPage() {
  const stance = STANCE.map((t) => differentiators.find((d) => d.title === t)!);
  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "How we work", path: "/approach" }])} />
      <PageHeader
        index="H"
        label="How we work"
        crumbs={[{ name: "How we work" }]}
        title={<>How we <span className="serif-accent font-normal ink-cobalt">work.</span></>}
        lede={<p>{servicesIntro.body}</p>}
      />

      <section aria-labelledby="steps-title" className="gutter border-t border-ink/10 py-20 md:py-24">
        <p className="label text-blue">Four steps</p>
        <h2 id="steps-title" className="mt-4 font-display text-headline font-medium">From your goals to what we improve next</h2>
        <div className="mt-12"><ProcessSteps detail /></div>
      </section>

      <section aria-labelledby="stance-title" className="act-rose py-20 md:py-24">
        <div className="gutter grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <h2 id="stance-title" className="label text-blue">What we stand for</h2>
            <p className="mt-6 font-display text-title font-medium">
              {impact.lead} <span className="serif-accent font-normal">{impact.turn}</span>
            </p>
          </div>
          <Reveal group as="ul" className="grid gap-6 md:col-span-8 md:grid-cols-3">
            {stance.map((d) => (
              <li key={d.title} className="border-t border-ink/15 pt-5">
                <h3 className="font-display text-[1.35rem] font-medium">{d.title}</h3>
                <p className="mt-2 text-ink/75">{d.body}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      <SelectedWork title="Work we've made" headingId="approach-work-title" />

      <WhereNext links={[
        { href: "/route", label: "Contact us", hint: "WhatsApp, call or email, or build a project brief.", primary: true },
        { href: "/work", label: "See the work", hint: "Reels, films, photography and design." },
        { href: "/capabilities", label: "Services", hint: "The 18 services, in four groups." },
      ]} />
    </PageShell>
  );
}
