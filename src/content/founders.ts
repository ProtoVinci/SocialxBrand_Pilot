// The founders, from the owner's own text (2026-10-17), condensed and reworded for clients. Every
// line below traces to that text: no years of experience, past employers, results or credentials
// were given, so none appear. Change a name, role or line only with the owner's approval.
// Portraits: the originals are in docs/source/founders/; `node scripts/media/founders.mjs` writes
// the 4:5 crops to public/founders/<id>-<480|800>.<avif|webp>.

export type Founder = {
  id: string;
  /** As shown on the page. */
  name: string;
  /** Full name, for the portrait's alt text and structured data. */
  fullName: string;
  role: string;
  /** Other roles the owner listed, shown under the main one. */
  alsoRole?: string;
  bio: string;
  /** What they lead, in a few words each. */
  focus: string[];
  /** Short description of the photo for screen readers. */
  portraitAlt: string;
};

export const founders: Founder[] = [
  {
    id: "sanket-shedge",
    name: "Sanket Shedge",
    fullName: "Sanket Sanjay Shedge",
    role: "Founder & Director",
    alsoRole: "Founder, Vishay Group of Companies",
    bio: "Sanket founded SOCIALxBRAND PILOT and sets its direction. He leads the client-facing side of the agency: how marketing strategy, creative execution and the experience of working with SxBP come together to support a business's growth.",
    focus: ["Agency direction", "Marketing approach", "Strategy and creative execution", "Client experience"],
    portraitAlt: "Sanket Shedge, in a black-and-white portrait wearing a light blazer",
  },
  {
    id: "sujal-pisal",
    name: "Sujal Pisal",
    fullName: "Sujal Nandkumar Pisal",
    role: "Co-Founder, Operations",
    bio: "Sujal co-founded SOCIALxBRAND PILOT and leads its operations: the systems and processes behind the agency's work. His focus is a reliable foundation, so that every project is delivered smoothly and the company is ready to grow.",
    focus: ["Operations", "Systems and processes", "Reliable delivery", "Long-term growth"],
    portraitAlt: "Sujal Pisal, in a dark suit and white shirt, leaning against a marble wall",
  },
];

/** The owner's closing line for both founders, merged. */
export const foundersTogether =
  "Together, they are building a structured, creative and growth-driven agency that helps businesses build their brands, reach the right audiences and grow through purposeful digital marketing.";

export const portrait = (id: string, w: 480 | 800, fmt: "avif" | "webp") => `/founders/${id}-${w}.${fmt}`;
