// Client feedback. Never add ratings, review counts or results that the client did not state and
// the owner cannot evidence.
//
// Where the words came from is recorded per entry in `sourceRef`, and it is not always the client:
// the nine entries below were drafted by the agency with each client's permission (see the note
// above `onBehalf`). The owner chose to publish them on that permission (2026-10-17, after the
// Pilot6 audit recommended waiting for each client to confirm the exact wording). When a client
// confirms or changes their line, put their final words in `quote` and update `sourceRef`.
//
// To add one: put the client's words in `quote`, record where they came from in `sourceRef`, set
// `approved: true` and the sign-off date in `approvedAt`. Logos: the
// client's original goes in docs/source/feedback-logos/, `node scripts/media/feedback-logos.mjs`
// writes the small WebP to public/clients/<id>.webp, and `logo` points at that.
//
// Only entries with `approved: true`, an `approvedAt` date and a quote render, and only the public
// fields (quote, name, role, business, logo, service) leave the server: `sourceRef` and the approval
// fields stay internal.

export type FeedbackEntry = {
  id: string;
  /** The client's exact words. Empty until received. */
  quote: string;
  /** The person, as they agreed to be named. */
  displayName: string;
  /** Only with permission. */
  role?: string;
  /** The client's business, as they agreed to be named. */
  business?: string;
  /** Path under /public, e.g. "/clients/sandesh-caterers.webp" (the client's own logo, with permission). */
  logo?: string;
  /** The service or work collection it concerns (plain words). */
  about?: string;
  /** Internal: where the feedback came from (message, email, review link). Never rendered. */
  sourceRef: string;
  /** Written permission to publish this exact quote and attribution. */
  approved: boolean;
  /** When the owner signed it off (YYYY-MM-DD). Never rendered. */
  approvedAt?: string;
};

// 2026-10-17: the owner reports that all nine clients gave permission for the agency to write their
// feedback on their behalf. The wording below was drafted on that basis: plain opinions about working
// with SxBP, with no figures, results or claims a client could not vouch for. Each client should still
// see and OK their own line; edit it here to match whatever they say.
const onBehalf = "Written on the client's behalf with the client's permission (owner statement, 2026-10-17); wording to be confirmed by the client";
const signedOff = "2026-10-17";

export const feedback: FeedbackEntry[] = [
  {
    id: "bikers-adda", business: "Bikers Adda", displayName: "Vikram Kadam",
    quote: "The SxBP team understood what our riders care about and turned it into content that actually feels like Bikers Adda. Working with them has been easy from day one.",
    sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "coastal-tawa-bhiwandi", business: "Coastal Tawa Bhiwandi", displayName: "Nitish Shetty",
    quote: "They captured our food and our coastal flavour beautifully. The team listens, shares good ideas and is always quick to respond.",
    logo: "/clients/coastal-tawa-bhiwandi.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "sandesh-caterers", business: "Sandesh Caterers", displayName: "Sandesh Dalvi",
    quote: "Our festive posters and menus now look professional and clear. SxBP took the time to understand our catering business before designing anything.",
    logo: "/clients/sandesh-caterers.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "the-local-katta", business: "The Local Katta", displayName: "Samadhan Gholap",
    quote: "SxBP gave The Local Katta a consistent look online. The team is friendly, patient with changes and genuinely invested in our business.",
    logo: "/clients/the-local-katta.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "thet-tumchya-gharatun", business: "Thet Tumchya Gharatun", displayName: "Prasad Khandekar",
    quote: "They understood the homely feel of our brand and brought it across in every post. Communication was simple and clear throughout.",
    logo: "/clients/thet-tumchya-gharatun.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "24-benne-tribe", business: "24 Benne Tribe", displayName: "Ashish Singh",
    quote: "Creative, reliable and easy to work with. SxBP helped us present 24 Benne Tribe the way we always imagined it.",
    logo: "/clients/24-benne-tribe.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "firdosh-marbel-arts", business: "Firdosh Marbel Arts", displayName: "Kalamuddin",
    quote: "Our marble work is detailed, and SxBP showed it with real care. They made our craft look as good online as it does in person.",
    logo: "/clients/firdosh-marbel-arts.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "celebration-cakes-bakery", business: "Celebration Cakes & Bakery", displayName: "Rameshwar Koli",
    quote: "From cake photos to festival posts, everything feels fresh and on-brand. The team plans ahead, so we always know what is coming next.",
    logo: "/clients/celebration-cakes-bakery.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
  {
    id: "cool-goti-soda", business: "Cool Goti Soda", displayName: "Akshay Mohite",
    quote: "SxBP gave Cool Goti Soda a fun, energetic voice on social media. Great ideas, and a team that actually listens.",
    logo: "/clients/cool-goti-soda.webp", sourceRef: onBehalf, approved: true, approvedAt: signedOff,
  },
];

/** What the site may show: approved, dated entries with a real quote and a name. */
export const publishableFeedback = () => feedback.filter((f) => f.approved && Boolean(f.approvedAt) && f.quote.trim() && f.displayName.trim());
