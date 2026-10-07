import { siInstagram, siFacebook, siYoutube, siWhatsapp, siGoogle, siGoogleads, siFigma, siDavinciresolve, type SimpleIcon } from "simple-icons";

/**
 * Prototype 1's concentric "apps orbit", in the hero's top-right corner: two rings of app
 * tiles counter-rotating around a hub, each tile counter-spun so its logo stays upright.
 * Only platforms and tools the agency's divisions actually work in, and no partner or
 * certification wording: the hub says what they are, nothing more.
 *   outer: the channels (social, video, WhatsApp, search)  inner: ads, design, editing
 * CSS animation (cheap, compositor-only); hover pauses it; reduced motion stills it via the
 * global reduced-motion rule.
 */
const OUTER: { icon: SimpleIcon; label: string }[] = [
  { icon: siInstagram, label: "Instagram" },
  { icon: siFacebook, label: "Facebook" },
  { icon: siYoutube, label: "YouTube" },
  { icon: siWhatsapp, label: "WhatsApp" },
  { icon: siGoogle, label: "Google Search" },
];
const INNER: { icon: SimpleIcon; label: string }[] = [
  { icon: siGoogleads, label: "Google Ads" },
  { icon: siFigma, label: "Figma" },
  { icon: siDavinciresolve, label: "DaVinci Resolve" },
];

function Ring({ items, size, spin, tile, dashed }: { items: typeof OUTER; size: number; spin: string; tile: number; dashed?: boolean }) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 rounded-full border ${dashed ? "border-dashed" : ""} border-blue/20 transition-colors group-hover:border-blue/40 ${spin}`}
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
    >
      {items.map(({ icon, label }, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={label}
            className="absolute"
            style={{ left: `${50 + 50 * Math.cos(a)}%`, top: `${50 + 50 * Math.sin(a)}%`, width: tile, height: tile, marginLeft: -tile / 2, marginTop: -tile / 2 }}
          >
            <span className={`grid h-full w-full place-items-center rounded-[30%] bg-white shadow-[0_6px_16px_-6px_rgb(28_25_23/0.25)] ring-1 ring-line ${spin}-counter`}>
              <svg viewBox="0 0 24 24" className="h-[52%] w-[52%]" fill={`#${icon.hex}`} aria-hidden>
                <path d={icon.path} />
              </svg>
            </span>
          </span>
        );
      })}
    </div>
  );
}

export function ToolsOrbit({ className = "" }: { className?: string }) {
  const all = [...OUTER, ...INNER].map((x) => x.label).join(", ");
  return (
    <figure className={`group relative size-[210px] select-none ${className}`}>
      <figcaption className="sr-only">Platforms and tools we work in: {all}.</figcaption>
      {/* soft cobalt aura */}
      <div aria-hidden className="absolute inset-4 rounded-full bg-[radial-gradient(closest-side,rgb(42_59_164/0.12),transparent)]" />
      <div aria-hidden>
        <Ring items={OUTER} size={196} spin="orbit-a" tile={38} dashed />
        <Ring items={INNER} size={118} spin="orbit-b" tile={30} />
      </div>
      {/* hub */}
      <div aria-hidden className="absolute left-1/2 top-1/2 grid size-[68px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-center shadow-[0_8px_22px_-8px_rgb(28_25_23/0.3)] ring-1 ring-line">
        <span className="leading-none">
          <span className="label block text-[0.55rem] text-blue">Tools</span>
          <span className="mt-1 block text-[0.68rem] font-medium tracking-tight text-ink">we work in</span>
        </span>
      </div>
    </figure>
  );
}
