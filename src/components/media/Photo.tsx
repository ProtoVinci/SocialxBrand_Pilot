import type { PhotoAsset } from "@/content/work";

type Props = {
  asset: PhotoAsset;
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
};

/** Pre-processed AVIF/WebP photo with an LQIP backdrop. Server component. */
export function Photo({ asset, alt, sizes = "(min-width: 768px) 33vw, 80vw", className = "", imgClassName = "", eager = false }: Props) {
  const toSrcset = (list: { w: number; url: string }[]) => list.map((s) => `${s.url} ${s.w}w`).join(", ");
  const fallback = asset.srcset.webp.at(-1)!;
  return (
    <div
      className={`${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} overflow-hidden bg-petal ${className}`}
      style={{ backgroundImage: `url(${asset.lqip})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <picture>
        <source type="image/avif" srcSet={toSrcset(asset.srcset.avif)} sizes={sizes} />
        <img
          src={fallback.url}
          srcSet={toSrcset(asset.srcset.webp)}
          sizes={sizes}
          alt={alt}
          width={asset.width}
          height={asset.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={`h-full w-full object-cover ${imgClassName}`}
        />
      </picture>
    </div>
  );
}
