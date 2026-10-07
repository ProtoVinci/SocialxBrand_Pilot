// Self-hosted fonts (from npm), so dev and production builds never depend on reaching Google
// Fonts at build time. Paths are relative to this file.
//
// Type system adopted from prototype 1 (sujal_site): one family, Inter, for display and body.
// Headlines run medium weight with tight negative tracking; labels use the system monospace.
import localFont from "next/font/local";

/** Inter variable: wght 100–900. */
export const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-italic.woff2", weight: "100 900", style: "italic" },
  ],
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});
