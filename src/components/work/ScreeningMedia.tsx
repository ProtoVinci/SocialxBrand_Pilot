"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MQ } from "@/lib/motion/tokens";
import { Reel } from "@/components/media/Reel";
import { Photo } from "@/components/media/Photo";
import type { PhotoAsset, VideoAsset } from "@/content/work";

/**
 * Media behaviour per asset type (variation creates rhythm):
 *  reels  — staggered vertical-cinema grid; each plays while in view (VideoBudget caps decode)
 *  films  — landscape pieces get a full-width frame of their own
 *  photos — editorial columns; each image drifts inside its frame as you scroll (scrubbed parallax)
 */
export function ScreeningMedia({ title, videos, photos }: { title: string; videos: VideoAsset[]; photos: PhotoAsset[] }) {
  const root = useRef<HTMLDivElement>(null);
  const portrait = videos.filter((v) => v.orientation === "portrait");
  const landscape = videos.filter((v) => v.orientation === "landscape");

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((frame) => {
        const img = frame.querySelector("img");
        if (!img) return;
        gsap.fromTo(img, { yPercent: -6, scale: 1.14 }, { yPercent: 6, scale: 1.14, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } });
      });
      gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((el, i) => {
        gsap.from(el, { autoAlpha: 0, y: 60, duration: 0.9, delay: (i % 3) * 0.08, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <div ref={root} className="gutter flex flex-col gap-24 pb-24">
      {landscape.map((v) => (
        <div key={v.id} data-rise className="overflow-hidden rounded-[18px]">
          <Reel asset={v} label={`${title} — film`} className="aspect-video w-full" />
        </div>
      ))}

      {portrait.length > 0 && (
        <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {portrait.map((v, i) => (
            <li key={v.id} data-rise className={i % 2 === 1 ? "md:translate-y-16" : ""}>
              <Reel asset={v} label={`${title} — reel ${i + 1}`} className="aspect-[9/16] w-full rounded-[16px]" />
            </li>
          ))}
        </ul>
      )}

      {photos.length > 0 && (
        <ul className="columns-2 gap-5 md:columns-3 [&>li]:mb-5">
          {photos.map((p, i) => (
            <li key={p.id} data-rise className="break-inside-avoid">
              <div data-drift className="overflow-hidden rounded-[14px]">
                <Photo asset={p} alt={`${title} — image ${i + 1} of ${photos.length}`} sizes="(min-width: 768px) 33vw, 50vw" className="w-full" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
