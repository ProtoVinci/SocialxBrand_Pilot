"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { routeStore } from "@/lib/route/store";

/** "Plan a route with this": puts the division on the visitor's route, then opens the builder. */
export function PlanRouteLink({ slug, className = "", children }: { slug: string; className?: string; children: ReactNode }) {
  return (
    <Link href="/route" transitionTypes={["nav-forward"]} onClick={() => routeStore.add(slug)} className={className}>
      {children}
    </Link>
  );
}
