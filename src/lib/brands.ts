/**
 * Curated list of brand partners Chetan Hi-Tech distributes.
 * Source: existing www.chetanhitech.com "Brands We Deal In" page.
 *
 * Two consumers:
 *   - Homepage brand wall (top 12, monochrome wordmarks)
 *   - /brands page (full list with descriptions, grouped by tier)
 *
 * Stored in code, not DB — these change rarely and never need admin editing.
 * If that changes, promote to a `Brand` model.
 */

export type BrandTier = "international" | "regional";

export type Brand = {
  /** Canonical name as it appears on product specs and filters */
  name: string;
  /** kebab-case slug, used for `?brand=` query param */
  slug: string;
  tier: BrandTier;
  /** One-line positioning */
  blurb: string;
  /** Product categories this brand covers */
  categories: readonly string[];
  /** Country of origin (or "Global" for multi-region brands) */
  origin: string;
};

export const BRANDS: readonly Brand[] = [
  // ── International ──────────────────────────────────────
  {
    name: "Rational",
    slug: "rational",
    tier: "international",
    blurb: "Combi ovens and iCombi platforms — the global standard for commercial kitchens.",
    categories: ["Cooking Equipment", "Bakery Equipment"],
    origin: "Germany",
  },
  {
    name: "Unox",
    slug: "unox",
    tier: "international",
    blurb: "Italian-engineered combi and convection ovens for restaurants, bakeries and marine.",
    categories: ["Cooking Equipment", "Bakery Equipment"],
    origin: "Italy",
  },
  {
    name: "Electrolux Professional",
    slug: "electrolux",
    tier: "international",
    blurb: "Full-service kitchen, dishwashing and ice systems used in hotel groups worldwide.",
    categories: ["Dishwashing", "Refrigeration", "Bar Equipment"],
    origin: "Sweden",
  },
  {
    name: "Alto-Shaam",
    slug: "alto-shaam",
    tier: "international",
    blurb: "Halo Heat® holding cabinets and combi-therm ovens — moist heat without fans.",
    categories: ["Display & Service", "Cooking Equipment"],
    origin: "USA",
  },
  {
    name: "Cambro",
    slug: "cambro",
    tier: "international",
    blurb: "Camshelving, ingredient bins, food transport and storage essentials.",
    categories: ["Display & Service", "Food Processing"],
    origin: "USA",
  },
  {
    name: "Adande",
    slug: "adande",
    tier: "international",
    blurb: "High-performance drawer refrigeration for tight, demanding kitchens.",
    categories: ["Refrigeration"],
    origin: "UK",
  },
  {
    name: "Hamilton Beach Commercial",
    slug: "hamilton-beach",
    tier: "international",
    blurb: "Blenders, mixers and beverage prep equipment trusted across hospitality.",
    categories: ["Food Processing", "Bar Equipment"],
    origin: "USA",
  },
  {
    name: "La Cimbali",
    slug: "la-cimbali",
    tier: "international",
    blurb: "Espresso machines and grinders engineered in Milan since 1912.",
    categories: ["Bar Equipment"],
    origin: "Italy",
  },
  {
    name: "Middleby Marshall",
    slug: "middleby-marshall",
    tier: "international",
    blurb: "Conveyor ovens, fryers and high-volume cooking solutions.",
    categories: ["Cooking Equipment"],
    origin: "USA",
  },
  {
    name: "PITCO",
    slug: "pitco",
    tier: "international",
    blurb: "Commercial fryers favoured by quick-service and food courts.",
    categories: ["Cooking Equipment"],
    origin: "USA",
  },
  {
    name: "Turbo Chef",
    slug: "turbo-chef",
    tier: "international",
    blurb: "Rapid-cook ovens that bring microwave-speed prep to chef-quality results.",
    categories: ["Cooking Equipment"],
    origin: "USA",
  },
  {
    name: "IFB",
    slug: "ifb",
    tier: "international",
    blurb: "Industrial washer-extractors, tumble dryers and flat-work ironers for laundries.",
    categories: ["Laundry Equipment"],
    origin: "India",
  },
  {
    name: "Bosch",
    slug: "bosch",
    tier: "international",
    blurb: "German precision in dishwashing and food-prep machinery.",
    categories: ["Dishwashing", "Food Processing"],
    origin: "Germany",
  },

  // ── Regional / India ───────────────────────────────────
  {
    name: "Celfrost",
    slug: "celfrost",
    tier: "regional",
    blurb: "Reach-in refrigeration, glass-door coolers and showcase chillers.",
    categories: ["Refrigeration"],
    origin: "India",
  },
  {
    name: "Elanpro",
    slug: "elanpro",
    tier: "regional",
    blurb: "Chest freezers, mini bars, ice-cube machines and retail refrigeration.",
    categories: ["Refrigeration", "Bar Equipment"],
    origin: "India",
  },
  {
    name: "Western Refrigeration",
    slug: "western",
    tier: "regional",
    blurb: "Chest freezers, eutectic freezers, chest coolers and SS reach-ins.",
    categories: ["Refrigeration"],
    origin: "India",
  },
  {
    name: "Vestfrost",
    slug: "vestfrost",
    tier: "regional",
    blurb: "Glass-door refrigeration and reliable cold storage for retail and labs.",
    categories: ["Refrigeration"],
    origin: "Denmark / India",
  },
  {
    name: "Trufrost",
    slug: "trufrost",
    tier: "regional",
    blurb: "Mini bars and beverage coolers built for hospitality.",
    categories: ["Refrigeration", "Bar Equipment"],
    origin: "India",
  },
  {
    name: "Venus Industries",
    slug: "venus",
    tier: "regional",
    blurb: "Banquet ware, buffet displays, trolleys and housekeeping accessories.",
    categories: ["Display & Service", "Housekeeping"],
    origin: "India",
  },
  {
    name: "Lakshmi",
    slug: "lakshmi",
    tier: "regional",
    blurb: "Wet grinders, vegetable cutters and food-processing machines.",
    categories: ["Food Processing"],
    origin: "India",
  },
  {
    name: "AKASA",
    slug: "akasa",
    tier: "regional",
    blurb: "Fryers, momo steamers, griddles, salamanders and stone ovens.",
    categories: ["Cooking Equipment", "Bakery Equipment"],
    origin: "India",
  },
  {
    name: "LORMAN",
    slug: "lorman",
    tier: "regional",
    blurb: "Induction cooking platforms, rice steamers and food warmers.",
    categories: ["Cooking Equipment"],
    origin: "India",
  },
  {
    name: "IMC",
    slug: "imc",
    tier: "regional",
    blurb: "Commercial ice machines, beverage dispensers and bar utility.",
    categories: ["Bar Equipment"],
    origin: "Global",
  },
  {
    name: "Toastmaster",
    slug: "toastmaster",
    tier: "regional",
    blurb: "Conveyor toasters and counter-top griddles.",
    categories: ["Cooking Equipment"],
    origin: "USA",
  },
  {
    name: "Zephyr",
    slug: "zephyr",
    tier: "regional",
    blurb: "Retractable hose reels, air hose reels and housekeeping hardware.",
    categories: ["Housekeeping"],
    origin: "India",
  },
] as const;

/** Sorted by tier then name */
export const BRANDS_BY_TIER = {
  international: BRANDS.filter((b) => b.tier === "international"),
  regional: BRANDS.filter((b) => b.tier === "regional"),
};

/** First 12 for the homepage brand wall — handpicked for recognition */
export const HOMEPAGE_BRANDS: readonly Brand[] = [
  BRANDS.find((b) => b.slug === "rational")!,
  BRANDS.find((b) => b.slug === "unox")!,
  BRANDS.find((b) => b.slug === "electrolux")!,
  BRANDS.find((b) => b.slug === "alto-shaam")!,
  BRANDS.find((b) => b.slug === "cambro")!,
  BRANDS.find((b) => b.slug === "ifb")!,
  BRANDS.find((b) => b.slug === "bosch")!,
  BRANDS.find((b) => b.slug === "la-cimbali")!,
  BRANDS.find((b) => b.slug === "celfrost")!,
  BRANDS.find((b) => b.slug === "venus")!,
  BRANDS.find((b) => b.slug === "lakshmi")!,
  BRANDS.find((b) => b.slug === "akasa")!,
];

export function findBrand(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
