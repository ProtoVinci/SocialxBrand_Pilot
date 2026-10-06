"use client";
import { useEffect, useState } from "react";
import { site } from "@/content/site";

/** Live India Standard Time: a small signal that this is a real, present team. */
export function Clock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: site.timezone, hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    // a caller's `hidden` must win: Tailwind's order would let a base inline-flex override it
    <span className={`label ${/\bhidden\b/.test(className) ? "" : "inline-flex"} items-center gap-2 whitespace-nowrap ${className}`}>
      <span className="relative inline-flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-signal/70 motion-reduce:hidden" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
      </span>
      {site.locationLabel}
      <time suppressHydrationWarning className="tabular-nums text-ink">{time ?? "--:--"}</time>
    </span>
  );
}
