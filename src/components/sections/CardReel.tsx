"use client";
import { Reel } from "@/components/media/Reel";
import { useMinWidth } from "@/lib/use-min-width";
import type { VideoAsset } from "@/content/work";

/**
 * A project card's clip: plays muted and looping while the card is on screen (through the shared
 * video budget, so never more than 3 at once on desktop, 2 on a phone), rests on its poster
 * otherwise. Cards are ~170px wide on a phone, so the 360p clip is enough there; from md up the
 * 720p clip. Reduced motion: the poster only (Reel never autoplays then).
 */
export function CardReel({ asset, className = "" }: { asset: VideoAsset; className?: string }) {
  const md = useMinWidth(768);
  return <Reel asset={asset} variant={md ? "full" : "preview"} className={className} />;
}
