import { divisions } from "@/content/divisions";
import { videosFor, type VideoAsset } from "@/content/work";

/** First available reel from each division's related work: used for hover previews. */
export function divisionPreviews(): Record<string, VideoAsset | undefined> {
  return Object.fromEntries(
    divisions.map((d, i) => {
      const pool = d.relatedWork.flatMap((slug) => videosFor(slug));
      return [d.slug, pool[i % Math.max(1, pool.length)]];
    }),
  );
}
