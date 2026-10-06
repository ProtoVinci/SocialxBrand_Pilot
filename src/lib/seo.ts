import { site } from "@/content/site";
import type { Division } from "@/content/divisions";

const abs = (path: string) => new URL(path, site.url).toString();

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": abs("/#organization"),
    name: site.name,
    alternateName: site.shortName,
    description: site.description,
    url: site.url,
    email: site.email,
    telephone: site.phoneE164,
    slogan: "We will show, you will grow.",
    logo: abs("/brand/mark-on-white.png"),
    areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
    knowsAbout: ["Digital marketing", "Social media marketing", "Content creation", "Branding", "Performance marketing", "SEO", "Video production", "AI marketing"],
  };
}

export function serviceLd(d: Division) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: d.name,
    serviceType: d.name,
    description: d.whatItIs[0],
    provider: { "@id": abs("/#organization") },
    areaServed: [{ "@type": "Country", name: "India" }, "Worldwide"],
    url: abs(`/capabilities/${d.slug}`),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}
