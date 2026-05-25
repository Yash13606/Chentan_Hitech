import "server-only";
import { LeadScore, IndustryType } from "@/generated/prisma/client";

/** PRD-defined rules for auto-scoring an inquiry. Pure function — no DB calls. */

const HIGH_PRIORITY_INDUSTRIES: IndustryType[] = [
  IndustryType.DEFENCE,
  IndustryType.HEALTHCARE,
  IndustryType.MARINE,
];

const HIGH_PRIORITY_KEYWORDS = [
  "urgent",
  "immediate",
  "tender",
  "defence",
  "hospital",
  "navy",
  "army",
  "canteen",
];

const LARGE_ORG_SIZES = ["201-500", "500+", "200+"];

interface ScoringInput {
  industry: IndustryType;
  orgSize?: string | null;
  projectNotes?: string | null;
  totalItems: number;
  priority: string;
}

export function computeLeadScore(input: ScoringInput): LeadScore {
  const { industry, orgSize, projectNotes, totalItems, priority } = input;

  // HIGH: defence or hospital industry
  if (HIGH_PRIORITY_INDUSTRIES.includes(industry)) return LeadScore.HIGH;

  // HIGH: large org
  if (orgSize && LARGE_ORG_SIZES.includes(orgSize)) return LeadScore.HIGH;

  // HIGH: urgent/tender keywords in notes
  const notes = (projectNotes ?? "").toLowerCase();
  if (HIGH_PRIORITY_KEYWORDS.some((kw) => notes.includes(kw))) return LeadScore.HIGH;

  // HIGH: marked urgent by customer
  if (priority === "URGENT") return LeadScore.HIGH;

  // MEDIUM: 5+ items in cart
  if (totalItems >= 5) return LeadScore.MEDIUM;

  // MEDIUM: multiple items with notes
  if (totalItems >= 3 && notes.length > 50) return LeadScore.MEDIUM;

  return LeadScore.LOW;
}
