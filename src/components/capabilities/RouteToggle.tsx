"use client";
import { routeStore, useRoute } from "@/lib/route/store";

/** Adds/removes a division from the visitor's route. The chip IS the state: + becomes ✓. */
export function RouteToggle({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const route = useRoute();
  const on = route.includes(slug);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); routeStore.toggle(slug); }}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your route` : `Add ${name} to your route`}
      className={`label group/toggle inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 transition-colors duration-300 ${
        on ? "border-violet bg-violet text-shell" : "border-current/25 hover:border-current"
      } ${className}`}
    >
      <span aria-hidden className={`grid h-4 w-4 place-items-center transition-transform duration-500 ease-[var(--ease-pilot)] ${on ? "rotate-[360deg]" : ""}`}>
        {on ? "✓" : "+"}
      </span>
      <span>{on ? "On route" : "Route"}</span>
    </button>
  );
}
