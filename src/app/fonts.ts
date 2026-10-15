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

/** Ridge 5 Bold: the multi-line face of "BRAND PILOT" in the logo. Used only for that lettering. */
export const ridge = localFont({
  display: "swap",
  src: [{ path: "../fonts/Ridge5-Bold.otf", weight: "700", style: "normal" }],
  fallback: ["Impact", "sans-serif"],
});

/** Lilita One: the face of "SOCIAL" in the footer wordmark. Used only for that lettering. */
export const lilita = localFont({
  display: "swap",
  src: [{ path: "../../node_modules/@fontsource/lilita-one/files/lilita-one-latin-400-normal.woff2", weight: "400", style: "normal" }],
  fallback: ["Impact", "sans-serif"],
});
