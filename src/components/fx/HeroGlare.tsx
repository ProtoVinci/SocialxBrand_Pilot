/**
 * Prototype 1's diagonal window light: five skewed white beams, soft louver shadows between
 * them and a daylight hotspot, all falling from the top-left and masked off toward the right.
 * On an off-white canvas the beams only read because of the shadow bands around them, so the
 * shadows run somewhat stronger than prototype 1's. Static and decorative; the blur filters
 * are paid once, since nothing here animates.
 */
const BEAMS = [
  { left: "calc(-1.5% - 291px)", w: 582, mask: "transparent 11.4%, #000 25.56%, rgb(0 0 0/.6) 41.7%, rgb(0 0 0/.25) 67.12%, #000 78.23%, transparent 97.3%" },
  { left: "calc(33.6% - 295px)", w: 591, mask: "transparent 0%, #000 20.04%, transparent 36.18%, #000 55.41%, rgb(0 0 0/.25) 67.12%, #000 78.23%, transparent 97.3%" },
  { left: "calc(33.7% - 220px)", w: 441, mask: "transparent 9.81%, #000 20.04%, rgb(0 0 0/.65) 28.59%, rgb(0 0 0/.45) 40.09%, #000 48.65%, rgb(0 0 0/.3) 54.5%, rgb(0 0 0/.2) 78.58%, #000 88.55%, transparent 97.3%" },
  { left: "calc(50.1% - 342px)", w: 684, mask: "transparent 0%, #000 17.66%, rgb(0 0 0/.6) 26.64%, #000 35.23%, transparent 47.7%, rgb(0 0 0/.2) 69.18%, #000 79.15%, transparent 97.3%" },
  { left: "calc(49.1% - 213px)", w: 426, mask: "transparent 0%, #000 20.04%, rgb(0 0 0/.6) 27.58%, #000 42.34%, transparent 48.6%, rgb(0 0 0/.2) 67.12%, #000 74.95%, #000 82.43%, rgb(0 0 0/.5) 88.67%, transparent 97.3%" },
];

export function HeroGlare() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden select-none [mask-image:radial-gradient(130%_110%_at_0%_0%,#000_0%,rgb(0_0_0/.9)_45%,rgb(0_0_0/.35)_78%,transparent_100%)]"
    >
      {/* daylight hotspot */}
      <div className="absolute -left-[12%] -top-[18%] h-[900px] w-[1050px] rounded-full bg-[radial-gradient(circle_at_20%_20%,#fff_0%,rgb(255_255_255/.8)_30%,rgb(255_255_255/.25)_60%,transparent_80%)] blur-[80px]" />
      {/* louver shadow slats: these are what make the light visible */}
      <div className="absolute -left-[150px] -top-[300px] h-[1600px] w-[130%] skew-x-[45deg] mix-blend-multiply blur-[26px] [background:repeating-linear-gradient(90deg,transparent_0px,transparent_110px,rgb(32_28_24/.12)_110px,rgb(32_28_24/.18)_180px,transparent_230px,transparent_310px)]" />
      {/* deeper shadow along the left edge */}
      <div className="absolute -left-[100px] -top-[250px] h-[1500px] w-[700px] skew-x-[45deg] opacity-80 mix-blend-multiply blur-[36px] [background:linear-gradient(90deg,rgb(32_28_24/.12)_0%,transparent_25%,rgb(32_28_24/.13)_45%,transparent_70%,rgb(32_28_24/.1)_85%,transparent_100%)]" />
      {/* light beams */}
      {BEAMS.map((b) => (
        <div
          key={b.left}
          className="absolute -top-[209px] h-[1350px] skew-x-[45deg] bg-[linear-gradient(180deg,#fff_0%,#fff_84%,transparent_100%)] blur-[8px]"
          style={{ left: b.left, width: b.w, maskImage: `linear-gradient(90deg, ${b.mask})`, WebkitMaskImage: `linear-gradient(90deg, ${b.mask})` }}
        />
      ))}
      {/* sheen bridging the beams */}
      <div className="absolute -left-[100px] -top-[200px] h-[1400px] w-[900px] skew-x-[45deg] opacity-50 mix-blend-overlay blur-[32px] [background:linear-gradient(90deg,rgb(255_255_255/.9)_0%,transparent_20%,rgb(255_255_255/.7)_35%,transparent_60%,rgb(255_255_255/.8)_80%,transparent_100%)]" />
    </div>
  );
}
