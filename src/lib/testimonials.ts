/**
 * Real testimonials pulled from the existing chetanhitech.com reviews page
 * (60 verified reviews, 4.7 / 5 average).
 *
 * These are presented as-is — names, locations and quotes match the source.
 * If/when the owner wants to edit these in-app, promote to a `Testimonial`
 * Prisma model.
 */

export type Testimonial = {
  id: string;
  name: string;
  /** "City, State" — exactly as displayed on source site */
  location: string;
  /** Product the review is tied to */
  product: string;
  /** Direct quote — empty string if the source had no written comment */
  quote: string;
  /** ISO-ish date string (YYYY-MM-DD) */
  date: string;
  /** 1–5 stars; all imported reviews were 5★ */
  rating: 5;
};

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: "t-rajesh-hyd",
    name: "Rajesh",
    location: "Hyderabad, Telangana",
    product: "Dishwasher",
    quote:
      "Mr. Ketan provided excellent service, very customer focused — ensured all my queries were resolved, worked with the product company to solve the issue, constantly in communication providing status. Excellent customer-centric support.",
    date: "2020-09-21",
    rating: 5,
  },
  {
    id: "t-mehul-mum",
    name: "Mehul Davaria",
    location: "Mumbai, Maharashtra",
    product: "Industrial Dishwasher",
    quote: "Good equipment with good service, very positive response.",
    date: "2025-04-24",
    rating: 5,
  },
  {
    id: "t-roopak-blr",
    name: "Roopak Sharma",
    location: "Bengaluru, Karnataka",
    product: "Bosch Dishwasher",
    quote: "Very knowledgeable and courteous service. Great price too.",
    date: "2020-10-03",
    rating: 5,
  },
  {
    id: "t-himanshu-vasai",
    name: "Mr. Himanshu Pal",
    location: "Vasai, Maharashtra",
    product: "Diesel Bowser Auto-Rewind Hose Reel",
    quote: "Thank you for always good communication, Sir.",
    date: "2024-03-19",
    rating: 5,
  },
  {
    id: "t-manohara-chn",
    name: "Manohara Raj",
    location: "Chennai, Tamil Nadu",
    product: "Rational Combi Oven",
    quote: "",
    date: "2025-09-09",
    rating: 5,
  },
] as const;

/** Three strongest quotes for the homepage carousel/grid */
export const HOMEPAGE_TESTIMONIALS: readonly Testimonial[] = [
  TESTIMONIALS[0], // Rajesh — long, articulate quote
  TESTIMONIALS[1], // Mehul — Mumbai, large market signal
  TESTIMONIALS[2], // Roopak — Bengaluru, mentions price + service
];
