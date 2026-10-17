import Link from "next/link";
import { site } from "@/content/site";
import { Mark } from "@/components/brand/Mark";
import { FooterWordmark } from "./FooterWordmark";

const whatsapp = `https://wa.me/${site.phoneE164.replace("+", "")}`;

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-ink/10 bg-shell pt-20" aria-labelledby="footer-title">
      <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 -z-10" />
      <div className="gutter grid gap-14 md:grid-cols-12">
        {/* a contact strip, not another manifesto: the pages above have already made the case. No "Visit"
            link: it opened this same site in a new tab (Pilot6 audit P2.15); official social profiles go
            here once the owner supplies them */}
        <div className="md:col-span-6">
          <p className="label text-blue">Contact us</p>
          <h2 id="footer-title" className="mt-5 max-w-xl font-display text-headline font-medium">
            Talk to us about <span className="serif-accent ink-cobalt">your business.</span>
          </h2>
        </div>
        <dl className="flex flex-wrap content-start gap-x-10 gap-y-8 text-sm md:col-span-6 [&_dd]:[overflow-wrap:anywhere]">
          <div>
            <dt className="label text-blue">Email us</dt>
            <dd className="mt-3"><a className="link-underline text-base" href={`mailto:${site.email}`}>{site.email}</a></dd>
          </div>
          <div>
            <dt className="label text-blue">Call or WhatsApp</dt>
            <dd className="mt-3 flex flex-col gap-1 text-base">
              <a className="link-underline" href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a>
              <a className="link-underline text-muted" href={whatsapp} target="_blank" rel="noopener">WhatsApp ↗</a>
            </dd>
          </div>
        </dl>
      </div>

      <div className="gutter mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 py-6">
        {/* every page ends here, so this row is the way out: home first, generous tap targets */}
        <nav aria-label="Footer" className="-mx-2 flex flex-wrap gap-x-2 text-sm text-muted">
          {[["/", "Home"], ["/work", "Work"], ["/capabilities", "Services"], ["/approach", "How we work"], ["/about", "About"], ["/route", "Contact us"]].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-full px-2 py-2.5 hover:text-ink">{label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-6">
          <a href="#main" className="label rounded-full border border-line bg-white px-4 py-2.5 text-ink shadow-sm transition-colors hover:border-line-strong">Back to top <span aria-hidden>↑</span></a>
        </div>
      </div>

      <FooterWordmark />

      <div className="gutter flex flex-wrap items-center justify-between gap-4 pb-6 text-xs text-muted">
        <span className="flex items-center gap-2"><Mark className="h-4 w-auto text-signal" /> © {new Date().getFullYear()} {site.name} · {site.category}</span>
        <span>{site.promise} · {site.market}</span>
      </div>
    </footer>
  );
}
