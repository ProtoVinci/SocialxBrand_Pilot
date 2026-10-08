"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { VideoAsset } from "@/content/work";
import { requestPlay, release } from "./video-budget";
import { av1Efficient } from "./codec";
import { MQ } from "@/lib/motion/tokens";

type Props = {
  asset: VideoAsset;
  className?: string;
  /** Visible label for screen readers; reels are muted and decorative otherwise. */
  label?: string;
  /** autoplay while in view (default), or only while hovered (index tiles) */
  mode?: "inview" | "hover" | "manual";
  priority?: number;
  /** eager-load the poster (above the fold) */
  eager?: boolean;
  fit?: "cover" | "contain";
};

export type ReelHandle = { video: HTMLVideoElement | null; play: () => void; pause: () => void };

/**
 * A muted, looping portfolio reel. AV1 WebM first, H.264 MP4 fallback, poster as <picture>.
 * Plays only while visible (via the shared VideoBudget). Under reduced motion it never
 * autoplays; a play/pause button is offered instead.
 */
export const Reel = forwardRef<ReelHandle, Props>(function Reel(
  { asset, className = "", label, mode = "inview", priority = 0, eager = false, fit = "cover" },
  handle,
) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [inLink, setInLink] = useState(false);
  const [userPlaying, setUserPlaying] = useState(false);
  // the MP4 until this device is known to decode AV1 in hardware (see codec.ts)
  const [webm, setWebm] = useState(false);

  useEffect(() => {
    if (!asset.src.webm) return;
    let alive = true;
    av1Efficient().then((ok) => { if (alive && ok) setWebm(true); });
    return () => { alive = false; };
  }, [asset.src.webm]);

  // a <source> added after the element was inserted is ignored until load(): re-run source
  // selection, but only while nothing has been requested yet (preload="none" and never played),
  // so a reel that already started on the MP4 is never interrupted
  useEffect(() => {
    const el = videoRef.current;
    if (webm && el && el.paused && el.readyState === HTMLMediaElement.HAVE_NOTHING) el.load();
  }, [webm]);

  useImperativeHandle(handle, () => ({
    video: videoRef.current,
    play: () => videoRef.current && requestPlay(videoRef.current, 1, priority + 10),
    pause: () => videoRef.current && release(videoRef.current),
  }), [priority]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const isReduced = window.matchMedia(MQ.reduce).matches;
    // a reel inside a link is a navigation tile: a nested Play button would be invalid
    // interactive content and would steal the click, so it only appears on standalone reels
    setReduced(isReduced);
    setInLink(Boolean(el.closest("a")));
    if (isReduced || mode !== "inview") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.35) {
          // no preload here: the budget calls play() only for videos it grants a slot, and play()
          // starts the download, so reels that stay on their poster never fetch a byte
          requestPlay(el, entry.intersectionRatio, priority);
        } else {
          release(el);
        }
      },
      { threshold: [0, 0.35, 0.6, 1] },
    );
    io.observe(el);
    return () => { io.disconnect(); release(el); };
  }, [mode, priority]);

  const hoverHandlers =
    mode === "hover" && !reduced
      ? {
          onPointerEnter: () => { const el = videoRef.current; if (el) requestPlay(el, 1, priority + 5); },
          onPointerLeave: () => { const el = videoRef.current; if (el) { release(el); el.currentTime = 0; } },
        }
      : {};

  const toggle = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) { requestPlay(el, 1, 100); setUserPlaying(true); } else { release(el); setUserPlaying(false); }
  };

  const objectFit = fit === "cover" ? "object-cover" : "object-contain";

  return (
    <div className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden bg-petal ${className}`} {...hoverHandlers} style={{ backgroundImage: `url(${asset.lqip})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <picture>
        <source srcSet={asset.poster.avif} type="image/avif" />
        <img
          src={asset.poster.webp}
          alt=""
          width={asset.width}
          height={asset.height}
          loading={eager ? "eager" : "lazy"}
          // the hero's centre reel (priority 5) is the page's largest first image: fetch it first
          fetchPriority={eager && priority >= 5 ? "high" : undefined}
          decoding="async"
          className={`absolute inset-0 h-full w-full ${objectFit}`}
        />
      </picture>
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full ${objectFit}`}
        muted
        loop
        playsInline
        preload="none"
        aria-label={label}
        aria-hidden={label ? undefined : true}
        tabIndex={-1}
        disablePictureInPicture
      >
        {webm && asset.src.webm && <source src={asset.src.webm} type='video/webm; codecs="av01.0.05M.08"' />}
        <source src={asset.src.mp4} type="video/mp4" />
      </video>
      {reduced && !inLink && mode !== "manual" && (
        <button
          type="button"
          onClick={toggle}
          className="label absolute bottom-3 left-3 z-10 rounded-full bg-shell/85 px-3 py-2 text-ink backdrop-blur"
          aria-label={userPlaying ? "Pause video" : "Play video"}
        >
          {userPlaying ? "Pause" : "Play"}
        </button>
      )}
    </div>
  );
});
