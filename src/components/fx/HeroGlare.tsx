/**
 * Prototype 1's diagonal window light: skewed white beams and soft louver shadows falling
 * from the top-left, masked so the right of the hero stays clean. Static and decorative.
 * Fewer layers than the original and no blur filters, to keep the paint cheap.
 */
const BEAMS = [
  { left: "calc(-2% - 290px)", w: 580, mask: "transparent 11%, #000 26%, rgb(0 0 0/.6) 42%, rgb(0 0 0/.25) 67%, #000 78%, transparent 97%" },
  { left: "calc(34% - 295px)", w: 590, mask: "transparent 0%, #000 20%, transparent 36%, #000 55%, rgb(0 0 0/.25) 67%, #000 78%, transparent 97%" },
  { left: "calc(50% - 340px)", w: 680, mask: "transparent 0%, #000 18%, rgb(0 0 0/.6) 27%, #000 35%, transparent 48%, rgb(0 0 0/.2) 69%, #000 79%, transparent 97%" },
];

export function HeroGlare() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none [mask-image:radial-gradient(125%_105%_at_0%_0%,#000_0%,rgb(0_0_0/.85)_45%,rgb(0_0_0/.3)_75%,transparent_100%)]"
    >
      {/* daylight hotspot */}
      <div className="absolute -left-[12%] -top-[18%] h-[900px] w-[1050px] rounded-full bg-[radial-gradient(circle_at_20%_20%,#fff_0%,rgb(255_255_255/.8)_30%,rgb(255_255_255/.25)_60%,transparent_80%)]" />
      {/* louver shadows */}
      <div className="absolute -left-[150px] -top-[300px] h-[1600px] w-[130%] skew-x-[45deg] opacity-80 mix-blend-multiply [background:repeating-linear-gradient(90deg,transparent_0px,transparent_110px,rgb(32_28_24/.06)_140px,rgb(32_28_24/.09)_180px,transparent_230px,transparent_310px)]" />
      {/* light beams */}
      {BEAMS.map((b) => (
        <div
          key={b.left}
          className="absolute -top-[209px] h-[1350px] skew-x-[45deg] bg-[linear-gradient(180deg,#fff_0%,#fff_84%,transparent_100%)] opacity-90"
          style={{ left: b.left, width: b.w, maskImage: `linear-gradient(90deg, ${b.mask})`, WebkitMaskImage: `linear-gradient(90deg, ${b.mask})` }}
        />
      ))}
    </div>
  );
}
