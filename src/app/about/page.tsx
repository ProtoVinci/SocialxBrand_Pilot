import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { WhereNext } from "@/components/layout/WhereNext";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd, founderLd, pageMetadata } from "@/lib/seo";
import { founders, foundersTogether, portrait } from "@/content/founders";

export const metadata: Metadata = pageMetadata({
  title: "About Us: The Founders",
  description:
    "The founders of SOCIALxBRAND PILOT: Sanket Shedge, Founder & Director, who leads the agency's direction and client experience, and Sujal Pisal, Co-Founder, who leads its operations.",
  path: "/about",
});

/**
 * Who is behind the agency (owner-supplied, 2026-10-17): the two founders, each with a portrait,
 * role, a short bio and what they lead, then the line they share. Rows alternate the portrait side
 * on desktop and stack portrait-first on phones. Copy lives in content/founders.ts.
 */
export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])} />
      {founders.map((f) => <JsonLd key={f.id} data={founderLd(f)} />)}
      <PageHeader
        index="A"
        label="About"
        crumbs={[{ name: "About" }]}
        title={<>The people behind <span className="serif-accent font-normal text-signal">SxBP.</span></>}
        lede={<p>SOCIALxBRAND PILOT is led by its two founders. Sanket Shedge sets the agency&apos;s direction and the way it works with clients; Sujal Pisal runs the operations behind every project.</p>}
      />

      <section aria-labelledby="founders-title" className="gutter border-t border-ink/10 py-20 md:py-28">
        <h2 id="founders-title" className="label text-blue">Founders</h2>
        <Reveal group as="ul" className="mt-12 grid gap-20 md:mt-16 md:gap-28">
          {founders.map((f, i) => (
            <li key={f.id} id={f.id} className="grid scroll-mt-[calc(var(--nav-h)+2rem)] items-center gap-8 md:grid-cols-12 md:gap-12">
              <picture className={`block w-full max-w-md overflow-hidden rounded-[22px] bg-sand md:col-span-5 md:max-w-none ${i % 2 ? "md:order-2 md:col-start-8" : ""}`}>
                <source type="image/avif" srcSet={`${portrait(f.id, 480, "avif")} 480w, ${portrait(f.id, 800, "avif")} 800w`} sizes="(min-width: 768px) 40vw, 28rem" />
                {/* pre-cropped AVIF/WebP pair (scripts/media/founders.mjs) */}
                <img
                  src={portrait(f.id, 800, "webp")}
                  srcSet={`${portrait(f.id, 480, "webp")} 480w, ${portrait(f.id, 800, "webp")} 800w`}
                  sizes="(min-width: 768px) 40vw, 28rem"
                  alt={f.portraitAlt}
                  width={800}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] h-auto w-full object-cover"
                />
              </picture>
              <div className={`md:col-span-6 ${i % 2 ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
                <h3 className="font-display text-headline font-medium">{f.name}</h3>
                <p className="mt-3 font-semibold text-ink">{f.role}</p>
                {f.alsoRole && <p className="mt-1 text-sm text-ink/65">{f.alsoRole}</p>}
                <p className="mt-6 max-w-xl text-lede text-ink/75">{f.bio}</p>
                <h4 className="label mt-8 text-blue">Leads</h4>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {f.focus.map((x) => (
                    <li key={x} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-ink/80">{x}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </Reveal>
      </section>

      <section aria-labelledby="together-title" className="act-rose py-20 md:py-24">
        <div className="gutter">
          <h2 id="together-title" className="label text-blue">What we&apos;re building</h2>
          <p className="mt-6 max-w-4xl font-display text-title font-medium">{foundersTogether}</p>
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
