import { MARK_VIEWBOX, RIBBON, RIBBON_OFFSET, TRIANGLE } from "./mark-paths";

type Props = { className?: string; title?: string };

/** The SOCIALxBRAND PILOT logomark as inline SVG (fills inherit currentColor). */
export function Mark({ className = "", title }: Props) {
  return (
    <svg viewBox={MARK_VIEWBOX} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={RIBBON} fill="currentColor" data-part="ribbon-a" />
      <path d={RIBBON} fill="currentColor" transform={`translate(0 ${RIBBON_OFFSET})`} data-part="ribbon-b" />
      <path d={TRIANGLE} fill="currentColor" data-part="triangle" />
    </svg>
  );
}
