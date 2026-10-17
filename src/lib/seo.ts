import type { Metadata } from "next";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import type { Division } from "@/content/divisions";
import { founders, portrait, type Founder } from "@/content/founders";

const abs = (path: string) => new URL(path, siteUrl).toString();

const ORG_ID = abs("/#organization");
const AREA_SERVED = [{ "@type": "Country", name: "India" }, "Worldwide"];

/** The home page's description, also the default for any page without its own. */
export const homeDescription =
  "SOCIALxBRAND PILOT is an Indian digital marketing agency. Strategy, creativity, technology and execution across 18 marketing services — built around what your business actually needs. We will show, you will grow.";

/**
 * The share-card fields every page repeats: a page's `openGraph` replaces the layout's whole
 * object, and with it the image app/opengraph-image.jpg adds, so the image is named here too
 * (served by that same file; on the home page the file's own tags take precedence).
 */
export const openGraphBase = {
  type: "website",
  siteName: site.name,
  locale: "en_IN",
  images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "SOCIALxBRAND PILOT — Digital Marketing Agency. We will show, you will grow." }],
} satisfies Metadata["openGraph"];

/**
 * One page's metadata: its title (the layout template adds the agency name), description,
 * self-referencing canonical and a matching og:url. og/twitter title and description follow
 * the title and description; the share image is the root opengraph-image.
 */
export function pageMetadata({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: { ...openGraphBase, url: path },
  };
}

/**
 * The agency and its website, as one graph on every page. `Organization`, not a local-business
 * type: the agency publishes no street address (docs/seo.md). No sameAs until the owner supplies
 * the official profile URLs.
 */
export function siteLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: site.name,
        alternateName: site.shortName,
        description: site.description,
        url: abs("/"),
        email: site.email,
        telephone: site.phoneE164,
        slogan: site.promise,
        logo: { "@type": "ImageObject", url: abs("/brand/mark-on-white.png") },
        areaServed: AREA_SERVED,
        knowsAbout: ["Digital marketing", "Social media marketing", "Content creation", "Branding", "Performance marketing", "SEO", "Video production", "AI marketing"],
        founder: founders.map((f) => ({ "@id": personId(f), name: f.fullName })),
      },
      {
        "@type": "WebSite",
        "@id": abs("/#website"),
        url: abs("/"),
        name: site.name,
        alternateName: site.shortName,
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function serviceLd(d: Division) {
  const url = abs(`/capabilities/${d.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: d.name,
    serviceType: d.name,
    description: d.whatItIs[0],
    provider: { "@id": ORG_ID },
    areaServed: AREA_SERVED,
    url,
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

const personId = (f: Founder) => abs(`/about#${f.id}`);

export function founderLd(f: Founder) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId(f),
    name: f.fullName,
    jobTitle: f.role,
    image: abs(portrait(f.id, 800, "webp")),
    worksFor: { "@id": ORG_ID },
    url: abs(`/about#${f.id}`),
  };
}
