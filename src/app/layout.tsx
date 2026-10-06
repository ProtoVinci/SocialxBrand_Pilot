import type { Metadata, Viewport } from "next";
import "./globals.css";
import { bricolage, instrument, geist, geistMono } from "./fonts";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { PointerFx } from "@/components/fx/PointerFx";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { organizationLd } from "@/lib/seo";

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
  openGraph: { type: "website", siteName: site.name, locale: "en_IN", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#fdf9f7", colorScheme: "light" };

// Marks the document for JS-driven reveals before first paint (skipped for reduced motion),
// so headings never flash in their final state and then jump.
// "intro" marks the first visit of a session, so the logomark curtain plays once.
const motionFlag = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion');if(location.pathname==='/'&&!sessionStorage.getItem('sxbp.intro')){d.classList.add('intro');sessionStorage.setItem('sxbp.intro','1')}}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${bricolage.variable} ${instrument.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <JsonLd data={organizationLd()} />
        <SmoothScroll>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
        <PointerFx />
      </body>
    </html>
  );
}
