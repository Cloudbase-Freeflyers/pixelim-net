import type { ActivePage } from "@/app/components/SiteHeader";

export type Option = { title: string; body: string; tags: string[] };
export type Benefit = { glyph: string; title: string; body: string };
export type Step = { n: string; title: string; body: string };
export type GalleryTile = { label: string; img: string };
export type Review = { quote: string; name: string; meta: string; initial: string };
export type Faq = { q: string; a: string };

export type Product = {
  slug: "acrylic-photo-prints" | "canvas-prints" | "aluminium-prints";
  active: ActivePage;
  hero: {
    img: string;
    alt: string;
    badge: string;
    titleLines: [string, string];
    para: string;
    tags: [string, string, string];
    priceLine: string;
  };
  why: { kicker: string; heading: string; para: string };
  options: { heading: string; para: string; edgeImg: string; edgeAlt: string; items: Option[] };
  benefits: Benefit[];
  steps: Step[];
  gallery: GalleryTile[];
  reviews: Review[];
  faqs: Faq[];
  contact: { img: string; alt: string };
  finalCta: { heading: string; para: string };
};

// ---- Content shared across all three product pages -------------------------

const REVIEW_PEOPLE = [
  { name: "Sarah M.", meta: "Verified buyer · Tel Aviv", initial: "S" },
  { name: "Daniel K.", meta: "Verified buyer · London", initial: "D" },
  { name: "Yael A.", meta: "Verified buyer · New York", initial: "Y" },
] as const;

const REVIEW_2_QUOTE =
  "I sent a 12-year-old photo and expected the worst. They checked it, fixed it, and it came out sharp.";

const STEP_1: Step = {
  n: "1",
  title: "Upload your photo",
  body: "Drop in a JPG or PNG. We check the quality for you.",
};
const STEP_3: Step = {
  n: "3",
  title: "Checkout securely",
  body: "Prices in USD. Card, PayPal or Apple Pay.",
};
const STEP_4: Step = {
  n: "4",
  title: "We print & ship",
  body: "Produced in 24–72h, delivered in 10–12 business days.",
};

const FAQ_SHIPPING: Faq = {
  q: "What are the shipping times?",
  a: "We produce in 24–72 hours, then delivery runs 10–12 business days worldwide. Every order ships insured with UPS, FedEx or TNT.",
};
const FAQ_FILE: Faq = {
  q: "What file should I upload?",
  a: "JPG or PNG up to 20MB. Bigger is better: aim for the original camera or phone file rather than a screenshot or a download from social media.",
};
const FAQ_TAX: Faq = {
  q: "Do prices include tax and shipping?",
  a: "No. All prices are shown in USD before tax and shipping, which are calculated at checkout based on your address.",
};

function reviews(quote1: string, quote3: string): Review[] {
  return [
    { quote: quote1, ...REVIEW_PEOPLE[0] },
    { quote: REVIEW_2_QUOTE, ...REVIEW_PEOPLE[1] },
    { quote: quote3, ...REVIEW_PEOPLE[2] },
  ];
}

// ---- The three products ----------------------------------------------------

export const ACRYLIC: Product = {
  slug: "acrylic-photo-prints",
  active: "acrylic",
  hero: {
    img: "/images/hero-dark-glow.png",
    alt: "Glowing acrylic glass print in a dark modern room",
    badge: "Acrylic Glass Prints",
    titleLines: ["Printing on", "Acrylic Glass"],
    para: "HD printing straight onto acrylic glass — vivid, durable, gallery-grade. Your photo gets glass-like depth that lifts off the wall.",
    tags: ["8″ to 6 ft wide", "True HD print", "Ready in 24–72h"],
    priceLine: "From $39 · Free design check",
  },
  why: {
    kicker: "Why acrylic",
    heading: "Why choose acrylic photo prints?",
    para: "Sturdy, glass-like depth. Colours that stay rich for decades. Nothing to dust, nothing to frame.",
  },
  options: {
    heading: "Two finishes. Same wow.",
    para: "Pick the surface that suits your room, then choose how it mounts. We handle the rest.",
    edgeImg: "/images/standoff-closeup.png",
    edgeAlt: "Close-up of the polished acrylic edge and standoff mount",
    items: [
      {
        title: "Glossy acrylic",
        body: "Deep, wet-looking colour with a mirror-clear surface. The showstopper.",
        tags: ["Max contrast", "Glass-like depth"],
      },
      {
        title: "Matte acrylic",
        body: "Soft, glare-free finish for bright rooms and sunlit walls.",
        tags: ["No reflections", "Fingerprint-friendly"],
      },
    ],
  },
  benefits: [
    { glyph: "◈", title: "Vivid colours", body: "HD inks printed straight onto the glass. Every shade stays punchy." },
    { glyph: "◇", title: "Luxurious look", body: "Sleek, gallery-style depth that makes a photo feel like an object." },
    { glyph: "◆", title: "Built to last", body: "Sturdy, glass-like acrylic that resists moisture, sun and scratches." },
    { glyph: "○", title: "Effortless care", body: "A soft cloth is all it needs. No sprays, no special products." },
    { glyph: "□", title: "No drilling needed", body: "Choose a hidden float mount and hang it without touching the wall." },
  ],
  steps: [
    STEP_1,
    { n: "2", title: "Pick size & finish", body: "From 8 inches to six feet wide, glossy or matte." },
    STEP_3,
    STEP_4,
  ],
  gallery: [
    { label: "Acrylic print above a linen sofa", img: "/images/hero-living-room.png" },
    { label: "Acrylic triptych in a home office", img: "/images/gallery-office.png" },
    { label: "Portrait acrylic print above a bed", img: "/images/gallery-bedroom.png" },
    { label: "Panoramic acrylic print in a hallway", img: "/images/gallery-hallway.png" },
    { label: "Small acrylic prints in a kitchen", img: "/images/gallery-kitchen.png" },
    { label: "Large-format acrylic print in a stairwell", img: "/images/gallery-stairwell.png" },
  ],
  reviews: reviews(
    "The colour is unreal — it genuinely glows on the wall. Hung in ten minutes with the standoffs.",
    "Second order this year. Packaging is bulletproof and it arrived faster than promised."
  ),
  faqs: [
    {
      q: "How long will an acrylic print last?",
      a: "Decades indoors. The acrylic shields the print from moisture and scratches, and our inks are rated to resist fading for 50+ years away from direct sun.",
    },
    {
      q: "How does it mount on the wall?",
      a: "Two ways. Standoff hardware holds it a few millimetres off the wall for a floating look, or choose the hidden back rail — no visible fixings and no drilling into the print.",
    },
    FAQ_SHIPPING,
    FAQ_FILE,
    {
      q: "Can I return a print?",
      a: "Custom prints are made for you, so we only accept returns for damage or a production fault — tell us within 14 days and we reprint or refund, no argument.",
    },
    FAQ_TAX,
  ],
  contact: {
    img: "/images/gallery-hallway.png",
    alt: "Acrylic print in a warm modern hallway",
  },
  finalCta: {
    heading: "Ready to order your acrylic print?",
    para: "Gallery-grade colour · produced in 24–72h · delivered in 10–12 business days.",
  },
};

export const CANVAS: Product = {
  slug: "canvas-prints",
  active: "canvas",
  hero: {
    img: "/images/canvas-hero-dark.png",
    alt: "Glowing canvas print in a dark modern room",
    badge: "Canvas Prints",
    titleLines: ["Printing on", "Fine-Art Canvas"],
    para: "Rich pigment inks on woven cotton canvas — warm, textured, gallery-wrapped. Your photo becomes a piece of art, frame included.",
    tags: ["8″ to 8 ft wide", "Museum pigment inks", "Ready in 24–72h"],
    priceLine: "From $29 · Free design check",
  },
  why: {
    kicker: "Why canvas",
    heading: "Why choose canvas prints?",
    para: "Soft texture, zero glare, and a solid wooden frame already built in. Warmth you can feel across the room.",
  },
  options: {
    heading: "Two wraps. Both ready to hang.",
    para: "Choose how the image meets the edge, then hang it straight from the box. We stretch and frame it for you.",
    edgeImg: "/images/canvas-edge-closeup.png",
    edgeAlt: "Close-up of canvas texture stretched over a wooden frame",
    items: [
      {
        title: "Gallery wrap",
        body: "Your image continues around the 1.5″ sides. Clean, modern, frameless.",
        tags: ["Image on edges", "1.5″ depth"],
      },
      {
        title: "Mirror wrap",
        body: "Edges mirror the image, so nothing important gets lost around the corner.",
        tags: ["Nothing cropped", "Best for portraits"],
      },
    ],
  },
  benefits: [
    { glyph: "◈", title: "Warm, rich colour", body: "Pigment inks soak into cotton canvas for deep, natural tones." },
    { glyph: "◇", title: "Zero glare", body: "A matte woven surface means no reflections, on any wall, in any light." },
    { glyph: "◆", title: "Solid wood frame", body: "Hand-stretched over a kiln-dried stretcher bar that will not warp." },
    { glyph: "○", title: "Light to hang", body: "Far lighter than glass. One hook and it is up in minutes." },
    { glyph: "□", title: "Arrives ready", body: "Framed, wired and packed. Unbox it and put it straight on the wall." },
  ],
  steps: [
    STEP_1,
    { n: "2", title: "Pick size & wrap", body: "From 8 inches to eight feet wide, gallery or mirror wrap." },
    STEP_3,
    STEP_4,
  ],
  gallery: [
    { label: "Panoramic canvas print above a curved sofa", img: "/images/canvas-living.png" },
    { label: "Canvas triptych in a dining area", img: "/images/canvas-dining.png" },
    { label: "Canvas print above a bed", img: "/images/canvas-bedroom.png" },
    { label: "Small canvas prints in a nursery", img: "/images/canvas-nursery.png" },
    { label: "Canvas print in a warm living room", img: "/images/product-canvas.png" },
    { label: "Canvas print glowing in a dark room", img: "/images/canvas-hero-dark.png" },
  ],
  reviews: reviews(
    "The texture makes it feel like a painting, not a photo. It suits our living room perfectly.",
    "Third canvas from Pixelim. The frames are properly made — no sagging, no warping."
  ),
  faqs: [
    {
      q: "How long will a canvas print last?",
      a: "Decades indoors. We use pigment inks rated to resist fading for 75+ years, plus a protective coating that guards against dust, moisture and light scuffs.",
    },
    {
      q: "How does it mount on the wall?",
      a: "It arrives stretched on a wooden frame with the hanging hardware already fitted. One nail or hook and it is level — no framing shop, no extra parts.",
    },
    FAQ_SHIPPING,
    FAQ_FILE,
    {
      q: "Can I return a canvas?",
      a: "Custom prints are made for you, so we only accept returns for damage or a production fault — tell us within 14 days and we reprint or refund, no argument.",
    },
    FAQ_TAX,
  ],
  contact: {
    img: "/images/canvas-living.png",
    alt: "Canvas print above a sofa in a warm modern living room",
  },
  finalCta: {
    heading: "Ready to order your canvas print?",
    para: "Hand-stretched · produced in 24–72h · delivered in 10–12 business days.",
  },
};

export const ALUMINIUM: Product = {
  slug: "aluminium-prints",
  active: "aluminium",
  hero: {
    img: "/images/aluminum-hero-dark.png",
    alt: "Glowing aluminium print in a dark modern room",
    badge: "Aluminum Prints",
    titleLines: ["Printing on", "Brushed Aluminum"],
    para: "Photos fused into slim metal — sharp, weatherproof, impossibly thin. A modern edge that works indoors and out.",
    tags: ["8″ to 10 ft wide", "Weatherproof 3mm metal", "Ready in 24–72h"],
    priceLine: "From $45 · Free design check",
  },
  why: {
    kicker: "Why aluminum",
    heading: "Why choose aluminum prints?",
    para: "Razor-sharp detail on a panel just 3mm thick. Shrug off sun, steam and salt air — indoors or out.",
  },
  options: {
    heading: "Two surfaces. One clean edge.",
    para: "Choose the metal surface, then let it float flush on the hidden rail. No frame, no glass, no fuss.",
    edgeImg: "/images/aluminum-edge-closeup.png",
    edgeAlt: "Close-up of the aluminium panel edge and hidden float rail",
    items: [
      {
        title: "Brushed silver",
        body: "The metal grain shows through lighter tones, giving highlights a real shimmer.",
        tags: ["Metallic sheen", "Best for skies & cities"],
      },
      {
        title: "Matte white base",
        body: "A solid white ground under the ink for true, accurate colour.",
        tags: ["Accurate colour", "No reflections"],
      },
    ],
  },
  benefits: [
    { glyph: "◈", title: "Knife-sharp detail", body: "Inks fuse into the coating, so fine texture and small type stay crisp." },
    { glyph: "◇", title: "Slim modern look", body: "Just 3mm thick with a clean cut edge. No frame, no glass, no bulk." },
    { glyph: "◆", title: "Weatherproof", body: "Happy in bathrooms, kitchens, patios and salt air. Rust never enters it." },
    { glyph: "○", title: "Wipe and go", body: "A damp cloth clears anything. Nothing to yellow, nothing to crack." },
    { glyph: "□", title: "Floats off the wall", body: "A hidden rail lifts it a few millimetres — fixings never show." },
  ],
  steps: [
    STEP_1,
    { n: "2", title: "Pick size & surface", body: "From 8 inches to ten feet wide, brushed or matte white." },
    STEP_3,
    STEP_4,
  ],
  gallery: [
    { label: "Aluminium print in a home office", img: "/images/aluminum-office.png" },
    { label: "Two aluminium prints in a hallway", img: "/images/aluminum-hallway.png" },
    { label: "Aluminium print in a restaurant interior", img: "/images/aluminum-restaurant.png" },
    { label: "Weatherproof aluminium print on a patio", img: "/images/aluminum-patio.png" },
    { label: "Aluminium prints in an office reception", img: "/images/product-aluminum.png" },
    { label: "Aluminium print glowing in a dark room", img: "/images/aluminum-hero-dark.png" },
  ],
  reviews: reviews(
    "We put one on a covered patio two summers ago. Sun, rain, humidity — it still looks new.",
    "Ordered four for our reception. The float mount makes them look like they cost a fortune."
  ),
  faqs: [
    {
      q: "How long will an aluminum print last?",
      a: "Decades, indoors or out. The image is fused into a coating bonded to the metal, so it will not peel, yellow or rot — and the panel cannot rust.",
    },
    {
      q: "How does it mount on the wall?",
      a: "A hidden aluminium rail is fitted to the back, so the panel floats a few millimetres off the wall with no visible fixings. Standoff bolts are available if you prefer them on show.",
    },
    FAQ_SHIPPING,
    FAQ_FILE,
    {
      q: "Can I use it outdoors?",
      a: "Yes. Aluminum is our only fully weatherproof product. Keep it out of constant direct midday sun and it will hold colour for years on a patio or entrance wall.",
    },
    FAQ_TAX,
  ],
  contact: {
    img: "/images/aluminum-office.png",
    alt: "Aluminium print in a warm modern office",
  },
  finalCta: {
    heading: "Ready to order your aluminum print?",
    para: "Weatherproof finish · produced in 24–72h · delivered in 10–12 business days.",
  },
};
