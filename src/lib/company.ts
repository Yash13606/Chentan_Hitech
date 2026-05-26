/**
 * Single source of truth for company facts.
 * Used by: footer, About page, CEO note, SEO, seed.
 *
 * Phone is a placeholder until the owner provides the live number.
 * GSTIN/IEC/Address are from the existing www.chetanhitech.com listing.
 */
export const COMPANY = {
  name: "Chetan Hitech Corporations",
  shortName: "Chetan Hi-Tech",
  tagline:
    "Commercial kitchen, laundry & refrigeration equipment for India's hospitality, healthcare & defence sectors.",
  description:
    "Established in 2013, Chetan Hitech Corporations is a wholesaler, trader and exporter of commercial kitchen, laundry, refrigeration and food-service equipment. We supply hotels, hospitals, defence forces, marine clients and industrial kitchens across India — with selective export to Asian markets.",
  founded: 2013,
  ceo: {
    name: "Mr. Ketan N. Shah",
    title: "Proprietor & CEO",
    quote:
      "We've spent the last decade earning the trust of facility managers, F&B directors and procurement teams across India. Every order — from a single hose reel to a 200-cover hotel kitchen — gets the same care.",
  },
  legal: {
    status: "Proprietorship",
    gstin: "33AAKPK7027P1ZA",
    iec: "AAKPK7027P",
    gstRegistered: "2017-07-01",
    employeeCount: "Up to 10",
    annualTurnover: "₹1.5 – 5 Cr",
  },
  contact: {
    addressLines: [
      "Ground Floor, 64/2, Vadamalai Street",
      "Perumalpet, Purasaivakkam",
      "Chennai – 600 007",
      "Tamil Nadu, India",
    ],
    addressShort: "Purasaivakkam, Chennai 600 007",
    mapsUrl: "https://maps.google.com/?q=13.09089000,80.25788000",
    phone: "+91  XXXXX XXXXX", // TODO: replace with real number from owner
    phoneCallable: "tel:+91XXXXXXXXXX",
    email: "info@chetanhitech.com",
    emailMailto: "mailto:info@chetanhitech.com",
    callResponseRate: 80, // percent
    hours: "Mon – Sat · 9:00 AM – 7:00 PM IST",
  },
  banking: ["Yes Bank", "Canara Bank"],
  paymentTerms: ["L/C", "Cash", "Credit Card", "Cheque", "DD"],
  shipmentModes: ["By Road", "By Air", "By Sea", "By Cargo"],
  trust: {
    rating: 4.7,
    reviewCount: 60,
    yearsInBusiness: new Date().getFullYear() - 2013,
    partnerBrandCount: 25,
    exportShare: 20, // percent of business
  },
  social: {
    facebook: "https://www.facebook.com/sharer.php?u=https://www.chetanhitech.com/",
    linkedin: "https://www.linkedin.com/cws/share?url=https://www.chetanhitech.com/",
  },
} as const;

export type CompanyShape = typeof COMPANY;
