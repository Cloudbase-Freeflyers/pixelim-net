import type { ActivePage } from "@/app/components/SiteHeader";

export type Benefit = { glyph: string; title: string; body: string };
export type Step = { n: string; title: string; body: string };
export type GalleryTile = { label: string; img: string };
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
    tags: string[];
    priceLine: string;
  };
  why: { kicker: string; heading: string; para: string };
  benefits: Benefit[];
  steps: Step[];
  gallery: GalleryTile[];
  faqs: Faq[];
  contact: { img: string; alt: string };
  finalCta: { heading: string; para: string };
};

// ---- Content shared across all three product pages -------------------------

const HERO_PRICE_LINE = "See your live price when you upload a photo.";

const STEPS: Step[] = [
  {
    n: "1",
    title: "Upload your photo",
    body: "Drop in a JPG or PNG and we'll check it looks great at your chosen size.",
  },
  {
    n: "2",
    title: "Pick size & finish",
    body: "Choose your size, material and finish in the order tool.",
  },
  {
    n: "3",
    title: "Checkout securely",
    body: "Review your live price and check out securely.",
  },
  {
    n: "4",
    title: "We print & ship",
    body: "We produce your order and ship it to your door.",
  },
];

const FAQ_MOUNT: Faq = {
  q: "How does it mount on the wall?",
  a: "Several mounting styles are available — pick the one that suits your wall when you place your order.",
};
const FAQ_SHIPPING: Faq = {
  q: "What are the shipping times?",
  a: "Shipping options and timing are shown at checkout, based on your delivery address.",
};
const FAQ_FILE: Faq = {
  q: "What file should I upload?",
  a: "A high-resolution JPG or PNG works best — the larger the original file, the sharper the print.",
};
const FAQ_RETURN: Faq = {
  q: "Can I return a print?",
  a: "Prints are made to order, so returns are handled case by case for damage or a production fault — contact us and we'll put it right.",
};
const FAQ_TAX: Faq = {
  q: "Do prices include tax and shipping?",
  a: "No — prices are shown before tax and shipping, which are added at checkout.",
};

// ---- The three products ----------------------------------------------------

export const ACRYLIC: Product = {
  slug: "acrylic-photo-prints",
  active: "acrylic",
  hero: {
    img: "/images/hero-dark-glow.webp",
    alt: "Glowing acrylic glass print in a dark modern room",
    badge: "Acrylic Glass Prints",
    titleLines: ["Printing on", "Acrylic Glass"],
    para: "HD printing straight onto acrylic glass — vivid, durable, gallery-grade. Your photo gets glass-like depth that lifts off the wall.",
    tags: ["Printed on acrylic glass", "Vivid & durable"],
    priceLine: HERO_PRICE_LINE,
  },
  why: {
    kicker: "Why acrylic",
    heading: "Why choose acrylic photo prints?",
    para: "Sturdy, glass-like depth. Colours that stay rich over time. Nothing to dust, nothing to frame.",
  },
  benefits: [
    { glyph: "◈", title: "Vivid colours", body: "HD inks printed straight onto the glass. Every shade stays punchy." },
    { glyph: "◇", title: "Luxurious look", body: "Sleek, gallery-style depth that makes a photo feel like an object." },
    { glyph: "◆", title: "Built to last", body: "Glass-like acrylic that resists moisture, sun and scratches." },
    { glyph: "○", title: "Effortless care", body: "A soft cloth is all it needs. No sprays, no special products." },
  ],
  steps: STEPS,
  gallery: [
    { label: "Acrylic print above a linen sofa", img: "/images/hero-living-room.webp" },
    { label: "Acrylic triptych in a home office", img: "/images/gallery-office.webp" },
    { label: "Portrait acrylic print above a bed", img: "/images/gallery-bedroom.webp" },
    { label: "Panoramic acrylic print in a hallway", img: "/images/gallery-hallway.webp" },
    { label: "Small acrylic prints in a kitchen", img: "/images/gallery-kitchen.webp" },
  ],
  faqs: [
    {
      q: "How long will an acrylic print last?",
      a: "Made to last for years. The acrylic shields your photo from moisture and scratches, so it keeps its rich colours and clarity over time.",
    },
    FAQ_MOUNT,
    FAQ_SHIPPING,
    FAQ_FILE,
    FAQ_RETURN,
    FAQ_TAX,
  ],
  contact: {
    img: "/images/gallery-hallway.webp",
    alt: "Acrylic print in a warm modern hallway",
  },
  finalCta: {
    heading: "Ready to order your acrylic print?",
    para: "Gallery-grade colour, made to last.",
  },
};

export const CANVAS: Product = {
  slug: "canvas-prints",
  active: "canvas",
  hero: {
    img: "/images/canvas-hero-dark.webp",
    alt: "Glowing canvas print in a dark modern room",
    badge: "Canvas Prints",
    titleLines: ["Printing on", "Fine-Art Canvas"],
    para: "Rich pigment inks on woven cotton canvas — warm, textured, gallery-wrapped. Your photo becomes a piece of art, frame included.",
    tags: ["Matte cotton canvas", "On a stretcher frame"],
    priceLine: HERO_PRICE_LINE,
  },
  why: {
    kicker: "Why canvas",
    heading: "Why choose canvas prints?",
    para: "Soft texture, zero glare, and a solid wooden frame already built in. Warmth you can feel across the room.",
  },
  benefits: [
    { glyph: "◈", title: "Warm, rich colour", body: "Pigment inks soak into cotton canvas for deep, natural tones." },
    { glyph: "◇", title: "Zero glare", body: "A matte woven surface means no reflections, on any wall, in any light." },
    { glyph: "◆", title: "Solid wood frame", body: "Hand-stretched over a wooden stretcher frame." },
    { glyph: "○", title: "Light to hang", body: "Far lighter than glass. One hook and it is up in minutes." },
  ],
  steps: STEPS,
  gallery: [
    { label: "Panoramic canvas print above a curved sofa", img: "/images/canvas-living.webp" },
    { label: "Canvas triptych in a dining area", img: "/images/canvas-dining.webp" },
    { label: "Canvas print above a bed", img: "/images/canvas-bedroom.webp" },
    { label: "Small canvas prints in a nursery", img: "/images/canvas-nursery.webp" },
    { label: "Canvas print in a warm living room", img: "/images/product-canvas.webp" },
  ],
  faqs: [
    {
      q: "How long will a canvas print last?",
      a: "Made to last for years indoors. A protective finish helps guard the canvas against dust, moisture and light scuffs.",
    },
    {
      q: "How does it mount on the wall?",
      a: "It arrives stretched on a wooden frame with the hanging hardware already fitted — one hook and it's level.",
    },
    FAQ_SHIPPING,
    FAQ_FILE,
    { ...FAQ_RETURN, q: "Can I return a canvas?" },
    FAQ_TAX,
  ],
  contact: {
    img: "/images/canvas-living.webp",
    alt: "Canvas print above a sofa in a warm modern living room",
  },
  finalCta: {
    heading: "Ready to order your canvas print?",
    para: "Hand-stretched on a solid frame, ready to hang.",
  },
};

export const ALUMINIUM: Product = {
  slug: "aluminium-prints",
  active: "aluminium",
  hero: {
    img: "/images/aluminum-hero-dark.webp",
    alt: "Glowing aluminium print in a dark modern room",
    badge: "Aluminum Prints",
    titleLines: ["Printing on", "Brushed Aluminum"],
    para: "Photos fused into slim metal — sharp, weatherproof, impossibly thin. A modern edge that works indoors and out.",
    tags: ["3mm aluminum panel", "Indoor & outdoor"],
    priceLine: HERO_PRICE_LINE,
  },
  why: {
    kicker: "Why aluminum",
    heading: "Why choose aluminum prints?",
    para: "Razor-sharp detail on a panel just 3mm thick, durable against most weather conditions — indoors or out.",
  },
  benefits: [
    { glyph: "◈", title: "Knife-sharp detail", body: "Inks fuse into the coating, so fine texture and small type stay crisp." },
    { glyph: "◇", title: "Slim modern look", body: "Just 3mm thick with a clean cut edge. No frame, no glass, no bulk." },
    { glyph: "◆", title: "Weatherproof", body: "Durable against most weather conditions — happy indoors and out." },
    { glyph: "○", title: "Wipe and go", body: "A damp cloth clears anything. Nothing to yellow, nothing to crack." },
  ],
  steps: STEPS,
  gallery: [
    { label: "Aluminium print in a home office", img: "/images/aluminum-office.webp" },
    { label: "Two aluminium prints in a hallway", img: "/images/aluminum-hallway.webp" },
    { label: "Aluminium print in a restaurant interior", img: "/images/aluminum-restaurant.webp" },
    { label: "Weatherproof aluminium print on a patio", img: "/images/aluminum-patio.webp" },
    { label: "Aluminium prints in an office reception", img: "/images/product-aluminum.webp" },
  ],
  faqs: [
    {
      q: "How long will an aluminum print last?",
      a: "Aluminum is durable and weather-resistant, so it holds its colour for years — indoors or in covered outdoor spaces.",
    },
    FAQ_MOUNT,
    FAQ_SHIPPING,
    FAQ_FILE,
    {
      q: "Can I use it outdoors?",
      a: "Yes — aluminum is durable against most weather conditions, so it suits covered outdoor spaces as well as indoors.",
    },
    FAQ_TAX,
  ],
  contact: {
    img: "/images/aluminum-office.webp",
    alt: "Aluminium print in a warm modern office",
  },
  finalCta: {
    heading: "Ready to order your aluminum print?",
    para: "A weatherproof, modern finish for indoors and out.",
  },
};
