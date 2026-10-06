// Self-hosted fonts (from npm), so dev and production builds never depend on reaching Google
// Fonts at build time. Paths are relative to this file.
import localFont from "next/font/local";

/** Bricolage Grotesque variable: wght 200–800, wdth 75–100 (font-stretch), opsz. */
export const bricolage = localFont({
  variable: "--font-bricolage",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2", weight: "200 800", style: "normal" },
  ],
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
  fallback: ["Arial Narrow", "system-ui", "sans-serif"],
});

/** Instrument Serif: the italic accent word per headline (and roman for completeness). */
export const instrument = localFont({
  variable: "--font-instrument",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
  ],
  fallback: ["Georgia", "serif"],
});

export const geist = localFont({
  variable: "--font-geist",
  display: "swap",
  src: [{ path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2", weight: "100 900", style: "normal" }],
  fallback: ["system-ui", "sans-serif"],
});

export const geistMono = localFont({
  variable: "--font-geist-mono",
  display: "swap",
  src: [{ path: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2", weight: "100 900", style: "normal" }],
  fallback: ["ui-monospace", "monospace"],
});
