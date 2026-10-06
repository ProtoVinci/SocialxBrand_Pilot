import Link from "next/link";
import { useId } from "react";
import { Mark } from "@/components/brand/Mark";

type Props = { className?: string };

/**
 * A round "Start your Pilot Route" sticker: the brand line runs round the logomark and turns
 * slowly. Pure CSS rotation, so the global reduced-motion rule leaves it still.
 */
export function SpinBadge({ className = "" }: Props) {
  const id = useId().replace(/:/g, "");
  return (
    <Link
      href="/route"
      transitionTypes={["nav-forward"]}
      aria-label="Start your Pilot Route"
      data-cursor="Go"
      className={`magnetic group ${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} grid size-32 shrink-0 place-items-center rounded-full bg-periwinkle text-ink shadow-[0_18px_40px_-18px_rgba(80,40,150,0.55)] ${className}`}
    >
      <svg viewBox="0 0 100 100" aria-hidden className="absolute inset-0 size-full animate-[spin_18s_linear_infinite]">
        <defs>
          <path id={id} d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
        </defs>
        <text className="fill-current font-mono uppercase" fontSize="8.2" letterSpacing="1.6">
          <textPath href={`#${id}`}>Start your Pilot Route ✦ We will show ✦</textPath>
        </text>
      </svg>
      <Mark className="w-9 text-signal transition-transform duration-500 ease-[var(--ease-pilot)] group-hover:scale-110" />
    </Link>
  );
}
