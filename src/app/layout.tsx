import type { Metadata, Viewport } from "next";
import "./globals.css";
import { inter } from "./fonts";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { PointerFx } from "@/components/fx/PointerFx";
import { NavProgress } from "@/components/layout/NavProgress";
import { DevWarmup } from "@/components/layout/DevWarmup";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { organizationLd } from "@/lib/seo";
import { allVideos } from "@/content/work";

// The menu's hover previews, picked here on the server: importing the media list into the
// (client) Nav shipped the whole ~100KB media manifest to every page.
const videos = allVideos();
const menuPreviews = [0, 1, 2, 3, 4].map((i) => videos[(i * 7) % Math.max(1, videos.length)]).filter(Boolean);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Digital Marketing Agency · India & Global`,
    template: `%s · ${site.name}`,
  },
  description:
    "SOCIALxBRAND PILOT is an Indian digital marketing agency. Strategy, creativity, technology and execution across 18 marketing divisions — built around what your business actually needs. We will show, you will grow.",
  applicationName: site.name,
  alternates: { canonical: "/" },
  // no og:url here: child routes inherit it, and "/" would mislabel every inner page
  openGraph: { type: "website", siteName: site.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#faf8f5", colorScheme: "light" };

// Marks the document for JS-driven reveals before first paint (skipped for reduced motion),
// so headings never flash in their final state and then jump.
// "intro" marks the first visit of a session, so the logomark curtain plays once.
const motionFlag = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion');if(location.pathname==='/'&&!sessionStorage.getItem('sxbp.intro')){d.classList.add('intro');sessionStorage.setItem('sxbp.intro','1')}}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        {/* suppressHydrationWarning: extensions (popup blockers, password managers) inject their
            own <script> into <head> before React hydrates, which React then reports as a mismatch
            against this one; the error is theirs, not ours, and the flag has already run */}
        <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd data={organizationLd()} />
        <SmoothScroll>
          <Nav previews={menuPreviews} />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
        <PointerFx />
        <NavProgress />
        <DevWarmup />
      </body>
    </html>
  );
}
