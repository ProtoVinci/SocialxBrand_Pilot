import { site } from "@/content/site";

/**
 * The address this deployment is actually served from: every absolute URL (share-image tags,
 * canonical links, sitemap, robots) is built on it. Link previews (WhatsApp, LinkedIn, X) fetch the
 * image from that address, so if it names a domain that is not serving the site the preview has
 * no thumbnail.
 *   1. NEXT_PUBLIC_SITE_URL, if set (explicit override);
 *   2. on Vercel, the project's production domain: the custom domain once one is attached,
 *      otherwise the *.vercel.app address (Vercel sets this at build time);
 *   3. the profile's own domain (local builds).
 */
const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

export const siteUrl = (explicit ? explicit : vercel ? `https://${vercel}` : site.url).replace(/\/+$/, "");
