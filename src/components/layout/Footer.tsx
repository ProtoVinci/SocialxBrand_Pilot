import Link from "next/link";
import { site, closing } from "@/content/site";
import { Mark } from "@/components/brand/Mark";
import { Clock } from "./Clock";
import { FooterWordmark } from "./FooterWordmark";

const whatsapp = `https://wa.me/${site.phoneE164.replace("+", "")}`;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-paper/10 bg-ink pt-20" aria-labelledby="footer-title">
      <div className="gutter grid gap-14 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="label text-fog">Let&apos;s grow together</p>
          <h2 id="footer-title" className="mt-5 max-w-xl font-display text-headline font-semibold [font-stretch:85%]">
            {closing.lead} <span className="serif-accent text-signal">{closing.turn}</span>
          </h2>
        </div>
        <dl className="grid gap-8 text-sm sm:grid-cols-3 md:col-span-6">
          <div>
            <dt className="label text-fog">Email us</dt>
            <dd className="mt-3"><a className="link-underline text-base" href={`mailto:${site.email}`}>{site.email}</a></dd>
          </div>
          <div>
            <dt className="label text-fog">Call or WhatsApp</dt>
            <dd className="mt-3 flex flex-col gap-1 text-base">
              <a className="link-underline" href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a>
              <a className="link-underline text-fog" href={whatsapp} target="_blank" rel="noopener">WhatsApp ↗</a>
            </dd>
          </div>
          <div>
            <dt className="label text-fog">Visit</dt>
            <dd className="mt-3 text-base">www.sxbp.com</dd>
          </div>
        </dl>
      </div>

      <div className="gutter mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-paper/10 py-6">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fog">
          <Link href="/work" className="hover:text-paper">Work</Link>
          <Link href="/capabilities" className="hover:text-paper">Capabilities</Link>
          <Link href="/approach" className="hover:text-paper">Approach</Link>
          <Link href="/route" className="hover:text-paper">Start your route</Link>
        </nav>
        <Clock className="text-fog" />
      </div>

      <FooterWordmark />

      <div className="gutter flex flex-wrap items-center justify-between gap-4 pb-6 text-xs text-fog">
        <span className="flex items-center gap-2"><Mark className="h-4 w-auto text-signal" /> © {new Date().getFullYear()} {site.name} · {site.category}</span>
        <span>{site.market}</span>
      </div>
    </footer>
  );
}
