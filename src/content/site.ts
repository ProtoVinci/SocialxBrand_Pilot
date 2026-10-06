// Company facts and positioning, transcribed from the SOCIALxBRAND PILOT Company Profile and
// the closing pages of the Services document. Nothing here may be invented or embellished.

export const site = {
  name: "SOCIALxBRAND PILOT",
  shortName: "SxBP",
  category: "Digital Marketing Agency",
  market: "India & Global Markets",
  promise: "We will show, you will grow.",
  url: "https://www.sxbp.com",
  email: "socialxbrandpilot@gmail.com",
  phoneDisplay: "+91 8432935877",
  phoneE164: "+918432935877",
  timezone: "Asia/Kolkata",
  locationLabel: "India · IST",
  description:
    "SOCIALxBRAND PILOT is an Indian digital marketing agency built to help businesses build their presence, connect with the right audience, and create meaningful growth through digital.",
} as const;

export const whoWeAre = [
  "SOCIALxBRAND PILOT is an Indian digital marketing agency built to help businesses build their presence, connect with the right audience, and create meaningful growth through digital.",
  "We believe that every business has a story, a purpose, and the potential to grow — but reaching the right people requires the right marketing. That is where we come in.",
  "We combine Strategy, Creativity, Technology, and Execution to create digital marketing solutions designed around the unique needs of each business. We don't believe in one-size-fits-all marketing. Every business is different. Every audience is different. And the way a business should be marketed should be different too.",
];

export const pillars = ["Strategy", "Creativity", "Technology", "Execution"] as const;

export const quote = {
  lead: "We are not here simply to make brands look good online.",
  turn: "We are here to make them matter.",
};

export const impact = {
  lead: "We don't simply aim to create digital activity.",
  turn: "We aim to create digital impact.",
};

export const closing = {
  lead: "Every business has something worth showing.",
  turn: "Every audience has something worth connecting with.",
};

/** "Marketing is more than being seen" — the progression from the philosophy section. */
export const philosophy = {
  intro:
    "Marketing is more than being seen. For us, marketing is not simply about posts, reels, followers, likes, or advertisements.",
  ladder: ["Seen", "Remembered", "Trusted", "Chosen", "Moving forward"],
  outcomes: [
    { title: "Brand & Audience", body: "Build a stronger brand and reach the exact right audience with tailored messaging." },
    { title: "Attention & Trust", body: "Create meaningful attention and foster deep trust and long-term relevance." },
    { title: "Opportunities", body: "Generate actionable business opportunities and high-intent customer leads." },
    { title: "Sustainable Growth", body: "Strengthen customer relationships to support sustainable, long-term business growth." },
  ],
};

export const method = [
  { id: "understand", name: "Understand", body: "Understand the business, market, audience and objectives.", detail: "Deep-dive into business goals, market position, target audience, and current digital footprint." },
  { id: "strategize", name: "Strategize", body: "Build the right strategy and choose the right channels.", detail: "Develop custom marketing roadmaps aligned with primary commercial objectives." },
  { id: "create", name: "Create", body: "Develop the ideas, content, visuals and marketing assets.", detail: "Transform strategies into engaging content, creative campaigns, visual media, and brand experiences." },
  { id: "execute", name: "Execute", body: "Put the strategy into action across relevant channels.", detail: "Deploy precision campaigns across appropriate digital channels and target networks." },
  { id: "measure", name: "Measure", body: "Track performance and understand what is happening.", detail: "Continuously monitor metrics and learn from performance data." },
  { id: "optimize", name: "Optimize", body: "Improve what is working and refine what is not.", detail: "Refine campaign execution based on what the data shows." },
  { id: "grow", name: "Grow", body: "Use insights, execution and continuous improvement to support sustainable business growth.", detail: "Sustainable growth, built step by step." },
] as const;

export type AudienceId = "startups" | "growing" | "established" | "local";

export const audiences: { id: AudienceId; name: string; need: string }[] = [
  { id: "startups", name: "Startups", need: "Need to build awareness and establish early market entry." },
  { id: "growing", name: "Growing Businesses", need: "Need to reach new audiences and scale customer acquisition." },
  { id: "established", name: "Established Brands", need: "Need to strengthen presence, retain relevance, and protect market share." },
  { id: "local", name: "Local Businesses", need: "Need more footfalls, inquiries, and targeted local customers." },
];

export const vision =
  "To build a digital marketing ecosystem where every business—regardless of its size or industry—has the opportunity to build its brand, reach its audience and grow, in India and across the world.";

export const mission =
  "To help businesses build stronger brands, connect with the right audiences, and achieve meaningful growth through strategic, creative and result-oriented digital marketing.";

export const differentiators = [
  { title: "Business-First Marketing", body: "We connect marketing efforts directly with core business objectives rather than treating marketing as an isolated activity." },
  { title: "18 Core Marketing Divisions", body: "Complete capabilities spanning strategy, social, content, branding, performance, search, PR, creators, and AI." },
  { title: "Tailored Strategy", body: "No templates or generic plans. Every solution is custom-designed around your unique audience and market challenge." },
  { title: "Strategy + Creativity + Execution", body: "We combine high-level strategic thinking with bold creative ideas and reliable end-to-end execution." },
  { title: "Digital-First & Growth-Driven", body: "Leveraging modern digital platforms and martech to drive engagement, conversions, and measurable business growth." },
  { title: "Industry-Agnostic Expertise", body: "We apply universal principles of audience psychology and digital strategy across any business sector." },
  { title: "Result-Oriented Thinking", body: "We look beyond vanity metrics (likes/followers) to focus on key performance metrics that impact bottom line." },
  { title: "Future-Ready Marketing", body: "Continuous adaptation to changing platforms, consumer behaviors, AI technologies, and automation tools." },
];

export const principles = [
  { title: "Growth Over Vanity", body: "Progress over superficial vanity metrics." },
  { title: "Strategy Before Execution", body: "Defining direction before creative output." },
  { title: "Creativity With Purpose", body: "Design and story that drives intent." },
  { title: "Marketing For Everyone", body: "Equal access to high-tier strategy." },
  { title: "Adapt, Innovate, Grow", body: "Constant evolution with market shifts." },
  { title: "Long-Term Partnerships", body: "Growing side-by-side with clients." },
];

export const personality = [
  { title: "Professional", body: "Structured, reliable, strategic, and accountable." },
  { title: "Creative", body: "Bold ideas, strong storytelling, and fresh perspectives." },
  { title: "Growth-Driven", body: "Focused on execution, results, and driving revenue." },
];

export const whoWeWorkWith = [
  "We work with businesses across industries, categories, markets, and stages of growth — from ambitious startups to established enterprises expanding their market footprint.",
  "We do not define our work by a single industry; we define it by the marketing need.",
];

export const aiPhilosophy = [
  { not: "AI should not replace creativity.", should: "AI should amplify creativity." },
  { not: "AI should not replace strategy.", should: "AI should accelerate strategy." },
  { not: "AI should not replace people.", should: "AI should help people work better." },
];

export const servicesIntro = {
  lead: "We do not believe every business needs every service.",
  body: "Every business has different objectives, audiences, challenges, opportunities and growth requirements. We identify what the business needs and build the right marketing solution around it.",
};
