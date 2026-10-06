import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/content/site";
import { organizationLd } from "@/lib/seo";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], axes: ["wdth", "opsz"], display: "swap" });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

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

export const viewport: Viewport = { themeColor: "#fff5e8", colorScheme: "light" };

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
      </body>
    </html>
  );
}
