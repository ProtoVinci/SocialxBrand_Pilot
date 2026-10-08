import Link from "next/link";
import { site, closing } from "@/content/site";
import { Mark } from "@/components/brand/Mark";
import { FooterWordmark } from "./FooterWordmark";

const whatsapp = `https://wa.me/${site.phoneE164.replace("+", "")}`;

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-ink/10 bg-shell pt-20" aria-labelledby="footer-title">
      <div aria-hidden className="grid-paper pointer-events-none absolute inset-0 -z-10" />
      <div className="gutter grid gap-14 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="label text-blue">Let&apos;s grow together</p>
          <h2 id="footer-title" className="mt-5 max-w-xl font-display text-headline font-medium">
            {closing.lead} <span className="serif-accent ink-cobalt">{closing.turn}</span>
          </h2>
        </div>
        <dl className="grid gap-8 text-sm sm:grid-cols-3 md:col-span-6">
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
          <div>
            <dt className="label text-blue">Visit</dt>
            <dd className="mt-3 text-base">www.sxbp.com</dd>
          </div>
        </dl>
      </div>

      <div className="gutter mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-ink/10 py-6">
        {/* every page ends here, so this row is the way out: home first, generous tap targets */}
        <nav aria-label="Footer" className="-mx-2 flex flex-wrap gap-x-2 text-sm text-muted">
          {[["/", "Home"], ["/work", "Work"], ["/capabilities", "Capabilities"], ["/approach", "Approach"], ["/route", "Start your route"]].map(([href, label]) => (
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
        <span>{site.market}</span>
      </div>
    </footer>
  );
}
