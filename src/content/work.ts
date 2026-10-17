// Portfolio "screenings": one per curated category from the SxBP x Vishay Creations Drive.
// The source files carry no client names or results, so copy describes ONLY what is visible:
// format, craft and the capabilities the pieces demonstrate. Never add clients, metrics or outcomes.
import generated from "./media.generated.json";

export type VideoAsset = {
  id: string; kind: "video"; screening: string; width: number; height: number;
  orientation: "portrait" | "landscape"; seconds: number;
  src: { webm: string | null; mp4: string; preview: string };
  poster: { avif: string; webp: string }; lqip: string; bytes?: number;
};
export type PhotoAsset = {
  id: string; kind: "photo"; screening: string; width: number; height: number;
  orientation: "portrait" | "landscape";
  srcset: { avif: { w: number; url: string }[]; webp: { w: number; url: string }[] }; lqip: string;
};
export type MediaAsset = VideoAsset | PhotoAsset;

export const media = generated as MediaAsset[];

export type WorkFormat = "video" | "photo" | "design";

export type Screening = {
  slug: string;
  title: string;
  kicker: string;
  line: string;
  format: string;
  /** What the collection holds, for the /work filters: a mixed collection carries more than one. */
  formats: WorkFormat[];
  divisions: string[];
};

export const partner = { role: "Production partner", name: "Vishay Creations" } as const;
export const partnerCredit = `${partner.role}: ${partner.name}`;

/** The projects that lead (home page, top of /work): the owner's choice, 2026-10-16 (business-first). */
export const featuredWork = ["restaurant-hospitality", "brand-films", "creator-content", "graphic-design"];

export const screenings: Screening[] = [
  { slug: "creator-content", title: "Creator Content", kicker: "Commercial", line: "Presenter-led reels written for the feed: a face, a hook and a reason to keep watching.", format: "Vertical reels", formats: ["video"], divisions: ["content-creation", "creator-brand-growth", "video-editing-animation"] },
  { slug: "restaurant-hospitality", title: "Restaurants & Hospitality", kicker: "Hotel & Bar", line: "Kitchens, storefronts, flame and plating, shot so a place can be tasted before it is visited.", format: "Vertical reels", formats: ["video"], divisions: ["content-creation", "video-production", "social-media-management"] },
  { slug: "automotive-moments", title: "Delivery Day", kicker: "Car & Bike", line: "The reveal, the keys, the first drive: new-vehicle moments cut for social.", format: "Vertical reels", formats: ["video"], divisions: ["video-production", "video-editing-animation", "content-creation"] },
  { slug: "brand-films", title: "Brand & Business Films", kicker: "Commercial", line: "Business introductions, expert explainers, product and tech stories.", format: "Vertical films", formats: ["video"], divisions: ["video-production", "content-marketing", "youtube-organic-video"] },
  { slug: "wedding-films", title: "Wedding & Pre-Wedding Films", kicker: "Wedding", line: "Cinematic edits built on light, place and timing.", format: "Cinematic films", formats: ["video"], divisions: ["video-production", "video-editing-animation"] },
  { slug: "wedding-content", title: "Wedding Content", kicker: "Wedding", line: "The social side of a wedding: trends, moments and behind-the-scenes, published as it happens.", format: "Vertical reels", formats: ["video"], divisions: ["content-creation", "social-media-marketing"] },
  { slug: "wedding-photography", title: "Wedding Photography", kicker: "Wedding", line: "Fire, dusk, the sea and sunflowers: portraits that hold a feeling.", format: "Photography", formats: ["photo"], divisions: ["photography"] },
  { slug: "portrait-fashion", title: "Portrait & Fashion", kicker: "Model", line: "Editorial portraits and fashion stories, from heritage drapes to the shoreline.", format: "Photography & film", formats: ["photo", "video"], divisions: ["photography", "video-production"] },
  { slug: "graphic-design", title: "Menus, Posters & Festive Creatives", kicker: "Graphic Design", line: "Bilingual social creatives and menus for food businesses, designed to sell the plate.", format: "Graphic design", formats: ["design"], divisions: ["graphic-design", "creative-advertising-campaigns"] },
  { slug: "logo-identity", title: "Logo & Identity", kicker: "Branding", line: "Marks and wordmarks for gaming, hospitality, agriculture, events and creative businesses.", format: "Identity design", formats: ["design"], divisions: ["branding-identity", "graphic-design"] },
  { slug: "family-celebrations", title: "Celebrations", kicker: "Events", line: "Baby showers, birthdays and housewarmings, kept as photographs and short films.", format: "Photography & film", formats: ["photo", "video"], divisions: ["photography", "video-production"] },
  { slug: "theatre-culture", title: "Theatre & Culture", kicker: "Natak", line: "Stage productions promoted from the green room to the opening night.", format: "Vertical reels", formats: ["video"], divisions: ["content-creation", "youtube-organic-video"] },
  { slug: "stories-campaigns", title: "Stories & Campaigns", kicker: "Storytelling", line: "Narrative pieces for people, places and public moments.", format: "Films", formats: ["video"], divisions: ["content-marketing", "creative-advertising-campaigns", "reputation-pr-community"] },
  { slug: "ai-content", title: "AI-Assisted Content", kicker: "AI Content", line: "AI used where it amplifies the idea, with the craft and judgement still human.", format: "Vertical reels", formats: ["video"], divisions: ["ai-marketing-automation", "video-editing-animation"] },
];

export const screeningBySlug = (slug: string) => screenings.find((s) => s.slug === slug);
export const mediaFor = (slug: string) => media.filter((m) => m.screening === slug);
export const videosFor = (slug: string) => mediaFor(slug).filter((m): m is VideoAsset => m.kind === "video");
export const photosFor = (slug: string) => mediaFor(slug).filter((m): m is PhotoAsset => m.kind === "photo");
export const allVideos = () => media.filter((m): m is VideoAsset => m.kind === "video");
export const findMedia = (id: string) => media.find((m) => m.id === id);
/** Screenings with at least one processed asset; pages only exist for these. */
export const liveScreenings = () => screenings.filter((s) => mediaFor(s.slug).length > 0);
