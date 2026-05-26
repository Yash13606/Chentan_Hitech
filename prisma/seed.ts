/**
 * prisma/seed.ts — Idempotent seed for Chetan Hi-Tech procurement platform.
 *
 * Run with:
 *   npm run db:seed
 *
 * What it seeds (all upserts, keyed on stable unique fields):
 *   • 10 top-level Categories (slug-unique)
 *   • 8  Industries (type-unique)
 *   • 40 Products (sku/slug-unique) with real titles, specs, prices
 *   •  6 marked `featured: true` for the homepage
 *   •  6 KnowledgeArticles (slug-unique)
 *
 * Admin users are NOT seeded here — use `npm run admin:create` for that.
 * Keeping admin creation out of the seed avoids storing credentials in
 * env vars, .env files, CI secrets, or shell history.
 *
 * Re-runs are safe. Existing rows are updated, not duplicated.
 * Source for product/brand/price data: www.chetanhitech.com scraped docs.
 *
 * Images are intentionally left empty (`images: []`) until the owner uploads
 * to R2. The product card renders a placeholder when empty.
 */

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

// Prisma 7 requires a driver adapter for Postgres.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const db = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────
// CATEGORIES — top-level only for v1
// ─────────────────────────────────────────────────────

const CATEGORIES = [
  {
    slug: "cooking-equipment",
    name: "Cooking Equipment",
    description:
      "Combi ovens, ranges, fryers, griddles, tilting pans and induction platforms for commercial kitchens.",
    sortOrder: 10,
  },
  {
    slug: "refrigeration",
    name: "Refrigeration",
    description:
      "Reach-ins, chest freezers, glass-door coolers, drawer refrigeration and ice systems.",
    sortOrder: 20,
  },
  {
    slug: "dishwashing",
    name: "Dishwashing",
    description:
      "Hood-type, rack-conveyor, flight-type and under-counter commercial dishwashers.",
    sortOrder: 30,
  },
  {
    slug: "laundry-equipment",
    name: "Laundry Equipment",
    description:
      "Washer-extractors, tumble dryers, flat-work ironers, folders and finishing systems.",
    sortOrder: 40,
  },
  {
    slug: "bar-equipment",
    name: "Bar Equipment",
    description:
      "Mini bars, ice-cube machines, beverage dispensers and espresso platforms.",
    sortOrder: 50,
  },
  {
    slug: "food-processing",
    name: "Food Processing",
    description:
      "Wet grinders, vegetable cutters, dough machines, peelers and prep equipment.",
    sortOrder: 60,
  },
  {
    slug: "display-service",
    name: "Display & Service",
    description:
      "Holding cabinets, buffet displays, food warmers, transport carriers and counters.",
    sortOrder: 70,
  },
  {
    slug: "bakery-equipment",
    name: "Bakery Equipment",
    description:
      "Bakery ovens, pizza ovens, dough machines, deck ovens and stone ovens.",
    sortOrder: 80,
  },
  {
    slug: "housekeeping",
    name: "Housekeeping",
    description:
      "Hose reels, hand-sanitizer dispensers, housekeeping trolleys and shoe-shine machines.",
    sortOrder: 90,
  },
  {
    slug: "custom-fabrication",
    name: "Custom Fabrication",
    description:
      "Bespoke stainless-steel counters, shelves, trolleys and complete kitchen layouts.",
    sortOrder: 100,
  },
] as const;

// ─────────────────────────────────────────────────────
// INDUSTRIES — must match IndustryType enum
// ─────────────────────────────────────────────────────

const INDUSTRIES = [
  {
    slug: "hospitality",
    name: "Hospitality",
    type: "HOSPITALITY" as const,
    description: "Hotels, resorts and serviced apartments.",
    sortOrder: 10,
  },
  {
    slug: "restaurant",
    name: "Restaurant",
    type: "RESTAURANT" as const,
    description: "Stand-alone restaurants, cafés and quick-service food courts.",
    sortOrder: 20,
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    type: "HEALTHCARE" as const,
    description: "Hospital kitchens, central sterile supply and patient-care laundries.",
    sortOrder: 30,
  },
  {
    slug: "defence",
    name: "Defence",
    type: "DEFENCE" as const,
    description: "Army cantonment messes, Navy galleys and Air Force station kitchens.",
    sortOrder: 40,
  },
  {
    slug: "marine",
    name: "Marine",
    type: "MARINE" as const,
    description: "Cruise lines, coast-guard vessels and offshore platforms.",
    sortOrder: 50,
  },
  {
    slug: "education",
    name: "Education",
    type: "EDUCATION" as const,
    description: "School, college and corporate-campus dining facilities.",
    sortOrder: 60,
  },
  {
    slug: "corporate",
    name: "Corporate",
    type: "CORPORATE" as const,
    description: "Office cafeterias, employee dining and corporate catering.",
    sortOrder: 70,
  },
  {
    slug: "industrial-kitchens",
    name: "Industrial Kitchens",
    type: "OTHER" as const,
    description: "Bulk-cooking units, central kitchens and large industrial canteens.",
    sortOrder: 80,
  },
] as const;

// ─────────────────────────────────────────────────────
// PRODUCTS — 40 items across 10 categories
// All prices in paise (₹ × 100). Specs are real wherever sourced.
// ─────────────────────────────────────────────────────

type SeedProduct = {
  sku: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  brand: string;
  priceCents: number | null;
  availability: "IN_STOCK" | "MADE_TO_ORDER" | "DISCONTINUED";
  specs: Record<string, string | number>;
  featured?: boolean;
  industries?: readonly ("HOSPITALITY" | "RESTAURANT" | "HEALTHCARE" | "DEFENCE" | "MARINE" | "EDUCATION" | "CORPORATE" | "OTHER")[];
  sortOrder: number;
};

const PRODUCTS: SeedProduct[] = [
  // ── COOKING EQUIPMENT (4) ──────────────────────────
  {
    sku: "RAT-COMBI-101",
    slug: "rational-icombi-pro-10-1",
    title: "Rational iCombi Pro 10-1/1 Combi Oven",
    description:
      "Ten-grid combi oven with iCookingSuite and iProductionManager. The global benchmark for hotel and banquet kitchens — grills, roasts, steams, bakes and finishes from one platform.",
    categorySlug: "cooking-equipment",
    brand: "Rational",
    priceCents: 109000000, // ₹10.90 L
    availability: "MADE_TO_ORDER",
    specs: {
      brand: "Rational",
      model: "iCombi Pro 10-1/1",
      capacity: "10 × 1/1 GN trays",
      meals: "100–150 covers/day",
      power: "18.6 kW · 3-phase",
      dimensions: "847 × 776 × 1042 mm",
      origin: "Germany",
    },
    featured: true,
    industries: ["HOSPITALITY", "RESTAURANT", "DEFENCE"],
    sortOrder: 10,
  },
  {
    sku: "UNX-MARINE-CMB",
    slug: "unox-marine-combi-oven",
    title: "Unox Marine Combi Oven",
    description:
      "Combi oven engineered for shipboard galleys — gimbal-mounted, sea-water-tolerant, certified for Indian Navy and merchant marine service.",
    categorySlug: "cooking-equipment",
    brand: "Unox",
    priceCents: 149500000, // ₹14.95 L
    availability: "MADE_TO_ORDER",
    specs: {
      brand: "Unox",
      certification: "Marine / Defence",
      capacity: "10 × GN 1/1",
      power: "20 kW",
      construction: "Stainless steel grade 304",
      origin: "Italy",
    },
    featured: true,
    industries: ["MARINE", "DEFENCE"],
    sortOrder: 20,
  },
  {
    sku: "AKS-BURNER-1",
    slug: "akasa-single-burner-range-backsplash",
    title: "AKASA Single Burner Range with Back Splash",
    description:
      "Heavy-duty stainless-steel single-burner range with rear back splash. Built for high-throughput Indian-style cooking.",
    categorySlug: "cooking-equipment",
    brand: "AKASA",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "AKASA",
      construction: "SS 304",
      burnerType: "Cast iron",
      gasType: "LPG / PNG",
      origin: "India",
    },
    industries: ["RESTAURANT", "EDUCATION", "CORPORATE"],
    sortOrder: 30,
  },
  {
    sku: "LOR-TILT-PAN",
    slug: "lorman-tilting-boiling-pan",
    title: "Tilting Boiling Pan — Gas / Electric",
    description:
      "Counter-tilting boiling pan for bulk-cooking units and central kitchens. Available in gas or electric variants.",
    categorySlug: "cooking-equipment",
    brand: "LORMAN",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      brand: "LORMAN",
      capacity: "80 L / 150 L",
      heatSource: "Gas or electric",
      construction: "Stainless steel",
      tilt: "Manual hand-wheel",
    },
    industries: ["DEFENCE", "EDUCATION", "OTHER"],
    sortOrder: 40,
  },

  // ── REFRIGERATION (4) ──────────────────────────────
  {
    sku: "CEL-FKG-110",
    slug: "celfrost-showcase-cooler-fkg-110",
    title: "Celfrost Showcase Cooler FKG-110",
    description:
      "Single-door upright glass showcase cooler. LED-lit canopy, energy-efficient compressor, ideal for restaurants and forecourts.",
    categorySlug: "refrigeration",
    brand: "Celfrost",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Celfrost",
      model: "FKG-110",
      capacity: "110 L",
      doors: "1 glass",
      temperature: "2 – 8 °C",
      refrigerant: "R600a",
    },
    featured: true,
    industries: ["HOSPITALITY", "RESTAURANT", "CORPORATE"],
    sortOrder: 110,
  },
  {
    sku: "CEL-VGD-FRZ",
    slug: "celfrost-vertical-glass-door-freezer",
    title: "Celfrost Vertical Glass Door Freezer",
    description:
      "Vertical glass-door freezer for retail and bar display. Frost-free with self-closing door and adjustable shelves.",
    categorySlug: "refrigeration",
    brand: "Celfrost",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Celfrost",
      doors: "1 glass",
      temperature: "−18 to −22 °C",
      shelves: "4 adjustable",
    },
    industries: ["HOSPITALITY", "RESTAURANT"],
    sortOrder: 120,
  },
  {
    sku: "WST-BEER-COOL",
    slug: "western-beer-beverage-cooler",
    title: "Western Beer & Beverage Cooler",
    description:
      "Back-bar beverage cooler with sliding glass doors. Suits bars, lounges and hotel banquets.",
    categorySlug: "refrigeration",
    brand: "Western Refrigeration",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Western",
      doors: "2 / 3 sliding glass",
      temperature: "2 – 10 °C",
      construction: "SS interior",
    },
    industries: ["HOSPITALITY"],
    sortOrder: 130,
  },
  {
    sku: "ADN-DRAWER-FRZ",
    slug: "adande-drawer-refrigeration-vcs2",
    title: "Adande VCS2 Drawer Refrigeration",
    description:
      "Two-drawer high-performance refrigeration system. Holds temperature even in 43 °C ambient — designed for hot, tight kitchens.",
    categorySlug: "refrigeration",
    brand: "Adande",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      brand: "Adande",
      model: "VCS2",
      drawers: 2,
      ambientTolerance: "Up to 43 °C",
      origin: "UK",
    },
    industries: ["HOSPITALITY", "RESTAURANT"],
    sortOrder: 140,
  },

  // ── DISHWASHING (4) ────────────────────────────────
  {
    sku: "ELX-HOOD-DW",
    slug: "electrolux-commercial-hood-dishwasher",
    title: "Electrolux Commercial Hood-Type Dishwasher",
    description:
      "Hood-type pass-through dishwasher for hotel banquets and 300-cover restaurants. Two wash cycles, integrated booster.",
    categorySlug: "dishwashing",
    brand: "Electrolux Professional",
    priceCents: 23000000, // ₹2.30 L
    availability: "IN_STOCK",
    specs: {
      brand: "Electrolux Professional",
      throughput: "60 racks/hr",
      cycles: "2 (90 s · 120 s)",
      power: "9.4 kW",
      origin: "Sweden",
    },
    featured: true,
    industries: ["HOSPITALITY", "RESTAURANT", "HEALTHCARE"],
    sortOrder: 210,
  },
  {
    sku: "ELX-HOOD-DW-XL",
    slug: "electrolux-hood-dishwasher-xl",
    title: "Hood-Type Dishwasher Machine — XL",
    description:
      "Extended-capacity hood dishwasher with auto-water-fill, energy recovery and rinse-aid dosing.",
    categorySlug: "dishwashing",
    brand: "Electrolux Professional",
    priceCents: 24000000, // ₹2.40 L
    availability: "IN_STOCK",
    specs: {
      throughput: "80 racks/hr",
      cycles: "3 programmable",
      power: "12 kW",
    },
    industries: ["HOSPITALITY", "DEFENCE"],
    sortOrder: 220,
  },
  {
    sku: "ELX-RACK-CONV",
    slug: "electrolux-rack-conveyor-dishwasher",
    title: "Rack Conveyor Dishwasher",
    description:
      "Multi-tank rack conveyor for 500+ cover banquet halls. Wash, rinse, sanitise and dry in a single pass.",
    categorySlug: "dishwashing",
    brand: "Electrolux Professional",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      throughput: "200 racks/hr",
      tanks: "Pre-wash + 2 wash + final rinse",
    },
    industries: ["HOSPITALITY", "DEFENCE"],
    sortOrder: 230,
  },
  {
    sku: "ELX-FLIGHT-DW",
    slug: "electrolux-flight-type-dishwasher",
    title: "Flight-Type Industrial Dishwasher",
    description:
      "Flight-type conveyor dishwasher for hospital food-trays and high-volume catering. Continuous conveyor with no rack changeover.",
    categorySlug: "dishwashing",
    brand: "Electrolux Professional",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      throughput: "5000 plates/hr",
      conveyor: "Continuous belt",
    },
    industries: ["HEALTHCARE", "OTHER"],
    sortOrder: 240,
  },

  // ── LAUNDRY EQUIPMENT (4) ──────────────────────────
  {
    sku: "IFB-HWF33",
    slug: "ifb-washer-extractor-hwf33",
    title: "IFB HWF33 High-Spin Washer-Extractor",
    description:
      "Soft-mount industrial washer-extractor for hotels and hospitals. 24 programmable wash programs, Japanese inverter drive, fully suspended.",
    categorySlug: "laundry-equipment",
    brand: "IFB",
    priceCents: 69000000, // ₹6.90 L
    availability: "IN_STOCK",
    specs: {
      brand: "IFB",
      model: "HWF33",
      washCapacity: "26–35 kg",
      machineCapacity: "50 kg",
      loading: "Front",
      cycleTime: "60 min",
      water: "10 kg / 50 L",
      weight: "290 kg",
      dimensions: "1905 × 1195 × 1330 mm",
    },
    featured: true,
    industries: ["HOSPITALITY", "HEALTHCARE", "DEFENCE"],
    sortOrder: 310,
  },
  {
    sku: "IFB-DRYER-ID9",
    slug: "ifb-tumble-dryer-id9",
    title: "IFB Industrial Tumble Dryer ID9",
    description:
      "30 kg-capacity industrial tumble dryer with stainless drum, microprocessor controls and combined radial / axial airflow.",
    categorySlug: "laundry-equipment",
    brand: "IFB",
    priceCents: 19000000, // ₹1.90 L
    availability: "IN_STOCK",
    specs: {
      brand: "IFB",
      model: "ID9",
      capacity: "30 kg (36–50 kg drying)",
      drum: "Stainless steel",
      heating: "Electric",
      power: "3 × 380–415 V · 50/60 Hz",
      weight: "180 kg",
    },
    industries: ["HOSPITALITY", "HEALTHCARE"],
    sortOrder: 320,
  },
  {
    sku: "IFB-AUTO-LMC",
    slug: "ifb-fully-automatic-laundry-machine",
    title: "Fully Automatic Industrial Laundry Machine",
    description:
      "PLC-driven fully automatic laundry machine for high-throughput commercial laundries. Pause/resume on power loss, 24 stored programs.",
    categorySlug: "laundry-equipment",
    brand: "IFB",
    priceCents: 45000000, // ₹4.50 L
    availability: "IN_STOCK",
    specs: {
      capacity: "20 kg",
      automation: "Fully automatic PLC",
      programs: "24 stored",
    },
    industries: ["HOSPITALITY", "HEALTHCARE", "DEFENCE"],
    sortOrder: 330,
  },
  {
    sku: "IFB-IRON-FW",
    slug: "ifb-flat-work-ironer",
    title: "IFB Flat-Work Ironer",
    description:
      "Heated-roller flat-work ironer for bedsheets, table linen and napkins. Front-finish output, adjustable speed.",
    categorySlug: "laundry-equipment",
    brand: "IFB",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      rollerLength: "2.0 m / 2.5 m",
      heating: "Electric / steam",
    },
    industries: ["HOSPITALITY", "HEALTHCARE"],
    sortOrder: 340,
  },

  // ── BAR EQUIPMENT (4) ──────────────────────────────
  {
    sku: "TRU-MB40",
    slug: "trufrost-mini-bar-mb-40",
    title: "Trufrost Mini Bar MB 40",
    description:
      "40 L silent absorption mini bar for hotel rooms. Lockable, energy-efficient, no compressor noise.",
    categorySlug: "bar-equipment",
    brand: "Trufrost",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Trufrost",
      model: "MB 40",
      capacity: "40 L",
      type: "Absorption (silent)",
      doors: "1 lockable",
    },
    industries: ["HOSPITALITY"],
    sortOrder: 410,
  },
  {
    sku: "IMC-ICE-100",
    slug: "imc-commercial-ice-cube-machine-100kg",
    title: "Commercial Ice-Cube Machine — 100 kg/day",
    description:
      "Air-cooled commercial ice-cube machine producing 100 kg of dice-cube ice per day. Suitable for bars and beverage stations.",
    categorySlug: "bar-equipment",
    brand: "IMC",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      output: "100 kg / 24 hr",
      cubeType: "Dice",
      cooling: "Air-cooled",
      storage: "40 kg bin",
    },
    industries: ["HOSPITALITY", "RESTAURANT"],
    sortOrder: 420,
  },
  {
    sku: "ELX-ICE-AUTO",
    slug: "electrolux-automatic-ice-cube-machine",
    title: "Electrolux Automatic Ice-Cube Machine",
    description:
      "Automatic ice-cube machine with self-cleaning cycle. Engineered for continuous duty in hospitality.",
    categorySlug: "bar-equipment",
    brand: "Electrolux Professional",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      output: "150 kg / 24 hr",
      cleaning: "Self-cleaning cycle",
    },
    industries: ["HOSPITALITY"],
    sortOrder: 430,
  },
  {
    sku: "LCM-ESPRESSO",
    slug: "la-cimbali-espresso-machine",
    title: "La Cimbali M100 Espresso Machine",
    description:
      "Two- or three-group espresso machine engineered in Milan since 1912. The choice of luxury hotels and high-volume café chains.",
    categorySlug: "bar-equipment",
    brand: "La Cimbali",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      brand: "La Cimbali",
      model: "M100",
      groups: "2 or 3",
      origin: "Italy",
    },
    industries: ["HOSPITALITY", "CORPORATE"],
    sortOrder: 440,
  },

  // ── FOOD PROCESSING (4) ────────────────────────────
  {
    sku: "LAK-WET-GRND",
    slug: "lakshmi-commercial-wet-grinder",
    title: "Lakshmi Commercial Wet Grinder",
    description:
      "Heavy-duty tilting wet grinder for batter, masala and chutney. The workhorse of Indian commercial kitchens.",
    categorySlug: "food-processing",
    brand: "Lakshmi",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Lakshmi",
      capacity: "10 / 15 / 25 L",
      stones: "Conical granite",
      motor: "1 / 2 HP",
    },
    industries: ["RESTAURANT", "EDUCATION", "OTHER"],
    sortOrder: 510,
  },
  {
    sku: "LAK-VEG-CUT",
    slug: "lakshmi-vegetable-cutter",
    title: "Lakshmi Vegetable Cutter",
    description:
      "Multi-blade vegetable cutter for slicing, dicing, grating and shredding. Stainless-steel construction.",
    categorySlug: "food-processing",
    brand: "Lakshmi",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      blades: "5 interchangeable",
      output: "200 kg / hr",
    },
    industries: ["RESTAURANT", "DEFENCE", "OTHER"],
    sortOrder: 520,
  },
  {
    sku: "LAK-POT-PEEL",
    slug: "lakshmi-potato-peeler",
    title: "Lakshmi Potato Peeler",
    description:
      "Centrifugal potato peeler with abrasive disc. 10–15 kg batch capacity.",
    categorySlug: "food-processing",
    brand: "Lakshmi",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      capacity: "10–15 kg / batch",
      type: "Centrifugal abrasion",
    },
    industries: ["RESTAURANT", "DEFENCE", "OTHER"],
    sortOrder: 530,
  },
  {
    sku: "AKS-DOUGH-BALL",
    slug: "akasa-db10-dough-ball-machine",
    title: "AKASA DB10 Dough-Ball Making Machine",
    description:
      "Automatic dough-ball maker for chapati, paratha and pizza prep. Adjustable weight settings.",
    categorySlug: "food-processing",
    brand: "AKASA",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "AKASA",
      model: "DB10",
      output: "1500 balls / hr",
      weightRange: "20–120 g",
    },
    industries: ["RESTAURANT", "EDUCATION"],
    sortOrder: 540,
  },

  // ── DISPLAY & SERVICE (4) ──────────────────────────
  {
    sku: "ALT-1200UP",
    slug: "alto-shaam-1200-up-holding-cabinet",
    title: "Alto-Shaam 1200-UP Heated Holding Cabinet",
    description:
      "Double-compartment heated holding cabinet using patented Halo Heat® — gentle, fan-free heat that preserves moisture and texture.",
    categorySlug: "display-service",
    brand: "Alto-Shaam",
    priceCents: 45000000, // ₹4.50 L
    availability: "IN_STOCK",
    specs: {
      brand: "Alto-Shaam",
      model: "1200-UP",
      capacity: "400 L",
      shelves: 2,
      compartments: 2,
      heatTech: "Halo Heat®",
      power: "230 V · 50 Hz",
      country: "USA",
    },
    featured: true,
    industries: ["HOSPITALITY", "DEFENCE", "OTHER"],
    sortOrder: 610,
  },
  {
    sku: "ALT-WC-2DR",
    slug: "alto-shaam-warm-cabinet-2-door",
    title: "Alto-Shaam Warm Cabinet — 2 Door",
    description:
      "Floor-standing two-door warm cabinet. Halo Heat® holding from 30–90 °C. Stainless construction throughout.",
    categorySlug: "display-service",
    brand: "Alto-Shaam",
    priceCents: 42500000, // ₹4.25 L
    availability: "IN_STOCK",
    specs: {
      brand: "Alto-Shaam",
      tempRange: "30 – 90 °C",
      doors: "2 solid",
      shelves: 2,
      mounting: "Floor standing",
    },
    industries: ["HOSPITALITY"],
    sortOrder: 620,
  },
  {
    sku: "CAM-TRANSPORT-100",
    slug: "cambro-food-transport-carrier",
    title: "Cambro Insulated Food Transport Carrier",
    description:
      "Insulated end-loading food carrier. Holds temperature for 4+ hours without external power — the catering and outdoor banquet standard.",
    categorySlug: "display-service",
    brand: "Cambro",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Cambro",
      insulation: "Solid foam",
      holdTime: "4+ hrs",
      capacity: "Up to 6 × GN 1/1",
    },
    industries: ["HOSPITALITY", "EDUCATION", "CORPORATE"],
    sortOrder: 630,
  },
  {
    sku: "VNS-BUFFET-DISP",
    slug: "venus-buffet-display-station",
    title: "Venus Buffet Display Station",
    description:
      "Banquet buffet display station with chafing dishes, plate warmers and sneeze guards. Modular for any banquet layout.",
    categorySlug: "display-service",
    brand: "Venus Industries",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      brand: "Venus",
      modules: "Configurable",
      finish: "Mirror / brushed SS",
    },
    industries: ["HOSPITALITY"],
    sortOrder: 640,
  },

  // ── BAKERY EQUIPMENT (4) ───────────────────────────
  {
    sku: "UNX-PIZZA-OVN",
    slug: "unox-electric-pizza-oven",
    title: "Unox Electric Pizza Oven",
    description:
      "Electric pizza oven with refractory stone base. Single-deck up to 9 × 12-inch pizzas per cycle.",
    categorySlug: "bakery-equipment",
    brand: "Unox",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Unox",
      capacity: "9 × 12-inch pizzas",
      stone: "Refractory base",
      tempMax: "500 °C",
    },
    industries: ["RESTAURANT"],
    sortOrder: 710,
  },
  {
    sku: "AKS-DECK-3",
    slug: "akasa-3-deck-baker-oven",
    title: "AKASA 3-Deck Bakery Oven",
    description:
      "Three-deck electric bakery oven for breads, buns and viennoiseries. Independent steam injection per deck.",
    categorySlug: "bakery-equipment",
    brand: "AKASA",
    priceCents: 67500000, // ₹6.75 L
    availability: "MADE_TO_ORDER",
    specs: {
      decks: 3,
      capacityPerDeck: "4 trays",
      steam: "Per-deck injection",
      power: "30 kW · 3-phase",
    },
    industries: ["HOSPITALITY", "RESTAURANT"],
    sortOrder: 720,
  },
  {
    sku: "AKS-STONE-OVN",
    slug: "akasa-stone-oven",
    title: "AKASA Stone Oven",
    description:
      "Wood- or gas-fired stone hearth oven for artisan breads, pizzas and tandoor-style applications.",
    categorySlug: "bakery-equipment",
    brand: "AKASA",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      fuel: "Wood / gas",
      hearthDiameter: "1100 mm",
    },
    industries: ["RESTAURANT", "HOSPITALITY"],
    sortOrder: 730,
  },
  {
    sku: "AKS-FLR-KNEAD",
    slug: "akasa-flour-kneading-machine",
    title: "Flour Kneading Machine",
    description:
      "Twin-arm spiral flour kneader for high-throughput chapati and bread prep. 15 / 25 / 50 kg variants.",
    categorySlug: "bakery-equipment",
    brand: "AKASA",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      action: "Twin-arm spiral",
      capacity: "15 / 25 / 50 kg",
    },
    industries: ["RESTAURANT", "EDUCATION", "OTHER"],
    sortOrder: 740,
  },

  // ── HOUSEKEEPING (4) ───────────────────────────────
  {
    sku: "ZEP-GARDEN-HR",
    slug: "zephyr-retractable-garden-hose-reel",
    title: "Zephyr Retractable Garden Hose Reel",
    description:
      "Wall-mounted retractable garden hose reel. 30 m capacity, auto-rewind, slow-retract braking.",
    categorySlug: "housekeeping",
    brand: "Zephyr",
    priceCents: 1850000, // ₹18,500
    availability: "IN_STOCK",
    specs: {
      brand: "Zephyr",
      hoseLength: "30 m",
      mounting: "Wall · swivel",
      retract: "Auto with brake",
    },
    industries: ["HOSPITALITY"],
    sortOrder: 810,
  },
  {
    sku: "ZEP-AIR-HR",
    slug: "zephyr-heavy-duty-air-hose-reel",
    title: "Zephyr Heavy-Duty Auto-Retractable Air Hose Reel",
    description:
      "Industrial-grade auto-retractable air hose reel for workshops, automotive bays and large facilities.",
    categorySlug: "housekeeping",
    brand: "Zephyr",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Zephyr",
      hoseLength: "15 m",
      pressureRating: "20 bar",
      mounting: "Ceiling / wall",
    },
    industries: ["OTHER"],
    sortOrder: 820,
  },
  {
    sku: "VNS-HK-TROLLEY",
    slug: "venus-housekeeping-trolley",
    title: "Venus Housekeeping Trolley",
    description:
      "Professional housekeeping cart with linen bag, dustbin compartment and amenity trays. Used by 4- and 5-star hotels.",
    categorySlug: "housekeeping",
    brand: "Venus Industries",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brand: "Venus",
      compartments: "Linen + amenity + dustbin",
      wheels: "4 swivel · 2 with brake",
    },
    industries: ["HOSPITALITY"],
    sortOrder: 830,
  },
  {
    sku: "GEN-SHOE-SHINE",
    slug: "automatic-shoe-shine-machine",
    title: "Automatic Shoe Shine Machine",
    description:
      "Free-standing automatic shoe-shine machine for hotel lobbies and corporate receptions. Three brush heads with polish dispenser.",
    categorySlug: "housekeeping",
    brand: "Venus Industries",
    priceCents: null,
    availability: "IN_STOCK",
    specs: {
      brushes: 3,
      power: "230 V · 50 Hz",
      finish: "Stainless steel",
    },
    industries: ["HOSPITALITY", "CORPORATE"],
    sortOrder: 840,
  },

  // ── CUSTOM FABRICATION (4) ─────────────────────────
  {
    sku: "CHT-FAB-COUNTER",
    slug: "custom-stainless-steel-service-counter",
    title: "Custom Stainless-Steel Service Counter",
    description:
      "Built to your drawing — service counters, salad bars, hot plates and undercounter refrigeration. SS 304 grade, welded and polished in-house.",
    categorySlug: "custom-fabrication",
    brand: "Chetan Hi-Tech",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      grade: "SS 304",
      lead: "3 – 4 weeks",
      site: "Pan-India dispatch",
    },
    industries: ["HOSPITALITY", "RESTAURANT", "CORPORATE", "OTHER"],
    sortOrder: 910,
  },
  {
    sku: "CHT-FAB-SHELVING",
    slug: "custom-kitchen-shelving-system",
    title: "Custom Industrial Kitchen Shelving",
    description:
      "Modular stainless-steel kitchen shelving — wire and solid options, adjustable, dollyable. Cambro-compatible.",
    categorySlug: "custom-fabrication",
    brand: "Chetan Hi-Tech",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      style: "Wire / solid SS",
      adjustable: "1-inch increments",
      loadPerShelf: "Up to 250 kg",
    },
    industries: ["HOSPITALITY", "HEALTHCARE", "DEFENCE", "OTHER"],
    sortOrder: 920,
  },
  {
    sku: "CHT-FAB-HOOD",
    slug: "custom-exhaust-hood-system",
    title: "Custom Exhaust Hood System",
    description:
      "Stainless exhaust hoods with baffle filters, fire suppression integration and DG-set-compatible blower units.",
    categorySlug: "custom-fabrication",
    brand: "Chetan Hi-Tech",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      style: "Wall / island / back-shelf",
      filters: "SS baffle, removable",
      suppression: "Optional Ansul compatible",
    },
    industries: ["RESTAURANT", "HOSPITALITY"],
    sortOrder: 930,
  },
  {
    sku: "CHT-FAB-FOODCOURT",
    slug: "food-court-counter-display",
    title: "Food Court Counter Display",
    description:
      "Themed food-court counter displays — signage-ready, with integrated hot/cold sections and POS cut-outs.",
    categorySlug: "custom-fabrication",
    brand: "Chetan Hi-Tech",
    priceCents: null,
    availability: "MADE_TO_ORDER",
    specs: {
      finish: "Painted / SS",
      theme: "Brand-customisable",
      sections: "Hot + cold + dry",
    },
    industries: ["HOSPITALITY", "RESTAURANT", "EDUCATION"],
    sortOrder: 940,
  },
];

// ─────────────────────────────────────────────────────
// KNOWLEDGE ARTICLES — 6 starter posts
// ─────────────────────────────────────────────────────

const ARTICLES = [
  {
    slug: "choosing-a-commercial-dishwasher",
    title: "Choosing a commercial dishwasher: hood, conveyor or flight type?",
    excerpt:
      "A capacity-first decision framework: cover count, peak load, throughput and water economics.",
    body:
      "Sizing a commercial dishwasher correctly is the difference between a kitchen that flows and one that stalls at peak. This guide walks through cover counts, racks-per-hour, water economics and the trade-offs between hood, rack-conveyor and flight-type systems.",
    industry: "HOSPITALITY" as const,
    tags: ["dishwashing", "buyer-guide"],
  },
  {
    slug: "rational-vs-unox-combi-comparison",
    title: "Rational vs Unox: which combi oven for your kitchen?",
    excerpt:
      "Both are world-class — but their strengths diverge sharply. A practical comparison for Indian operators.",
    body:
      "The two leading combi-oven platforms differ in software philosophy, India service network and consumable economics. Here's how to choose for hotel banquets vs centralised kitchens vs marine galleys.",
    industry: "RESTAURANT" as const,
    tags: ["combi-oven", "comparison"],
  },
  {
    slug: "hospital-laundry-compliance",
    title: "Hospital laundry compliance: barrier washers, ozone & infection control",
    excerpt:
      "What healthcare facility managers should specify when designing a compliant on-site laundry.",
    body:
      "Hospital laundries are an infection-control surface. This piece covers barrier washer-extractors, ozone disinfection, thermal cycle requirements and the documentation auditors look for.",
    industry: "HEALTHCARE" as const,
    tags: ["laundry", "compliance"],
  },
  {
    slug: "marine-galley-equipment-india",
    title: "Specifying marine galley equipment for Indian Navy & merchant marine",
    excerpt:
      "Gimbal mounts, salt-fog resistance, certification — what's different about marine procurement.",
    body:
      "Marine galleys demand engineering that landside kitchens never face: gimbal mounts for pitch and roll, SS 316L for salt-fog environments, classification-society certifications. A short guide for marine procurement officers.",
    industry: "MARINE" as const,
    tags: ["marine", "defence"],
  },
  {
    slug: "defence-kitchen-tender-checklist",
    title: "Defence kitchen tender checklist: what L1 doesn't capture",
    excerpt:
      "L1 pricing wins tenders, but lifecycle cost wins kitchens. A specifier's checklist.",
    body:
      "Defence procurement is L1-driven, but lifecycle cost (consumables, breakdown frequency, spares availability) is where real value sits. This checklist helps QM officers write specs that protect the kitchen long-term.",
    industry: "DEFENCE" as const,
    tags: ["defence", "tender"],
  },
  {
    slug: "kitchen-cad-layouts-india",
    title: "Kitchen CAD layouts for a 200-cover hotel restaurant",
    excerpt:
      "Workflow zoning, hood placement and clearances — a walkthrough of a real Chennai restaurant brief.",
    body:
      "Walk through a real 200-cover restaurant kitchen layout: prep, hot line, cold line, dish room and storage zones. Where hoods should go, why corridors matter and what HACCP needs.",
    industry: "HOSPITALITY" as const,
    tags: ["design", "layout"],
  },
] as const;

// ─────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Chetan Hi-Tech database…");

  // 1. Categories — upsert by slug
  const categoryMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
      },
      update: {
        name: c.name,
        description: c.description,
        sortOrder: c.sortOrder,
      },
    });
    categoryMap.set(c.slug, cat.id);
  }
  console.log(`  ✓ ${CATEGORIES.length} categories upserted`);

  // 2. Industries — upsert by type
  const industryMap = new Map<string, string>();
  for (const i of INDUSTRIES) {
    const ind = await db.industry.upsert({
      where: { type: i.type },
      create: {
        slug: i.slug,
        name: i.name,
        type: i.type,
        description: i.description,
        sortOrder: i.sortOrder,
      },
      update: {
        slug: i.slug,
        name: i.name,
        description: i.description,
        sortOrder: i.sortOrder,
      },
    });
    industryMap.set(i.type, ind.id);
  }
  console.log(`  ✓ ${INDUSTRIES.length} industries upserted`);

  // 3. Products — upsert by sku
  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`  ! Skipping ${p.sku}: category "${p.categorySlug}" not found`);
      continue;
    }
    const product = await db.product.upsert({
      where: { sku: p.sku },
      create: {
        sku: p.sku,
        slug: p.slug,
        title: p.title,
        description: p.description,
        categoryId,
        brand: p.brand,
        availability: p.availability,
        specs: p.specs,
        images: [], // owner will upload to R2
        priceCents: p.priceCents,
        featured: p.featured ?? false,
        sortOrder: p.sortOrder,
      },
      update: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        categoryId,
        brand: p.brand,
        availability: p.availability,
        specs: p.specs,
        priceCents: p.priceCents,
        featured: p.featured ?? false,
        sortOrder: p.sortOrder,
      },
    });

    // Industries — replace pivot set each run
    if (p.industries && p.industries.length) {
      await db.industryProduct.deleteMany({
        where: { productId: product.id },
      });
      for (const indType of p.industries) {
        const industryId = industryMap.get(indType);
        if (!industryId) continue;
        await db.industryProduct.create({
          data: { industryId, productId: product.id },
        });
      }
    }
  }
  console.log(`  ✓ ${PRODUCTS.length} products upserted (${PRODUCTS.filter((p) => p.featured).length} featured)`);

  // 4. Articles — upsert by slug, publish immediately
  for (const a of ARTICLES) {
    await db.knowledgeArticle.upsert({
      where: { slug: a.slug },
      create: {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        industry: a.industry,
        tags: [...a.tags],
        publishedAt: new Date(),
      },
      update: {
        title: a.title,
        excerpt: a.excerpt,
        body: a.body,
        industry: a.industry,
        tags: [...a.tags],
      },
    });
  }
  console.log(`  ✓ ${ARTICLES.length} knowledge articles upserted`);

  // Admin users are NOT created by the seed.
  // Use the interactive admin script instead:  npm run admin:create
  // (avoids the risk of credentials sitting in env vars, .env, or CI logs)

  console.log("✨ Seed complete.");
  console.log("→ To create an admin user, run:  npm run admin:create");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
