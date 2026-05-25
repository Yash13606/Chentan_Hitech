/**
 * Branded quotation PDF template using @react-pdf/renderer v4.
 * Runs server-side only — never imported by client code.
 */
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Use built-in PDF fonts (Helvetica, Courier) — always available, no font registration needed
// If custom fonts are placed in public/fonts/, register them here and update fontFamily below.

const BRAND = {
  primary: "#1a1a1a",
  accent: "#c96442",   // Chetan Hi-Tech copper/terracotta accent
  muted: "#666666",
  light: "#f5f5f5",
  border: "#e0e0e0",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: BRAND.primary,
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.accent,
  },
  brandName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BRAND.primary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 8,
    color: BRAND.muted,
    marginTop: 2,
  },
  quotationMeta: {
    alignItems: "flex-end",
  },
  quotationTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: BRAND.primary,
  },
  quotationRef: {
    fontSize: 10,
    fontFamily: "Courier",
    color: BRAND.accent,
    marginTop: 2,
  },

  // ── Parties grid ────────────────────────────────────
  partiesRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 28,
  },
  partyBox: {
    flex: 1,
    backgroundColor: BRAND.light,
    borderRadius: 3,
    padding: 12,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  partyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: BRAND.primary,
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 8.5,
    color: BRAND.muted,
    lineHeight: 1.4,
  },

  // ── Meta row ────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  metaCell: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 8,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 9,
    color: BRAND.primary,
  },

  // ── Line items table ─────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BRAND.primary,
    borderRadius: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    backgroundColor: BRAND.light,
  },
  colDesc: { flex: 1 },
  colQty: { width: 36, textAlign: "center" },
  colUnit: { width: 72, textAlign: "right" },
  colTotal: { width: 72, textAlign: "right" },
  cellText: {
    fontSize: 9,
    color: BRAND.primary,
  },
  cellSku: {
    fontSize: 7.5,
    fontFamily: "Courier",
    color: BRAND.muted,
    marginTop: 1,
  },
  cellNotes: {
    fontSize: 7.5,
    color: BRAND.muted,
    marginTop: 2,
    fontStyle: "italic",
  },

  // ── Totals ───────────────────────────────────────────
  totalsSection: {
    alignItems: "flex-end",
    marginTop: 16,
    marginBottom: 24,
  },
  totalsRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: { fontSize: 9, color: BRAND.muted },
  totalsValue: { fontSize: 9, color: BRAND.primary, fontFamily: "Courier" },
  totalsFinalRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1.5,
    borderTopColor: BRAND.primary,
    marginTop: 4,
  },
  totalsFinalLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: BRAND.primary },
  totalsFinalValue: { fontSize: 11, fontFamily: "Courier", color: BRAND.primary },

  // ── Terms ────────────────────────────────────────────
  termsSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 16,
  },
  termBlock: { flex: 1 },
  termLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  termValue: { fontSize: 8.5, color: BRAND.primary, lineHeight: 1.5 },

  // ── Notes ────────────────────────────────────────────
  notesBox: {
    backgroundColor: BRAND.light,
    borderRadius: 3,
    padding: 12,
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: BRAND.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  notesText: { fontSize: 8.5, color: BRAND.primary, lineHeight: 1.6 },

  // ── Footer ───────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: BRAND.muted },
});

// ─────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────

export type LineItem = {
  productId: string;
  title: string;
  sku: string;
  qty: number;
  unitCents: number;
  notes?: string | null;
};

export type QuotationPdfProps = {
  quotationNumber: string; // e.g. "Q-2024-0001-v2"
  version: number;
  issueDate: string;       // ISO date string
  validUntil?: string | null;
  customerName: string;
  customerEmail: string;
  companyName: string;
  companyCity?: string | null;
  companyState?: string | null;
  lineItems: LineItem[];
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  deliveryTerms?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
};

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────

function formatINR(cents: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────

export function QuotationPdf(props: QuotationPdfProps) {
  const {
    quotationNumber,
    version,
    issueDate,
    validUntil,
    customerName,
    customerEmail,
    companyName,
    companyCity,
    companyState,
    lineItems,
    subtotalCents,
    taxCents,
    totalCents,
    deliveryTerms,
    paymentTerms,
    notes,
  } = props;

  return (
    <Document
      title={`Quotation ${quotationNumber}`}
      author="Chetan Hi-Tech"
      creator="Chetan Hi-Tech Platform"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Chetan Hi-Tech</Text>
            <Text style={styles.brandTagline}>
              Industrial Kitchen &amp; Refrigeration Equipment
            </Text>
          </View>
          <View style={styles.quotationMeta}>
            <Text style={styles.quotationTitle}>QUOTATION</Text>
            <Text style={styles.quotationRef}>{quotationNumber}</Text>
          </View>
        </View>

        {/* ── Parties ── */}
        <View style={styles.partiesRow}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>Chetan Hi-Tech</Text>
            <Text style={styles.partyDetail}>
              Industrial Procurement Platform{"\n"}
              support@chetanhitech.com
            </Text>
          </View>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>Prepared for</Text>
            <Text style={styles.partyName}>{companyName}</Text>
            <Text style={styles.partyDetail}>
              {customerName}{"\n"}
              {customerEmail}
              {(companyCity || companyState)
                ? `\n${[companyCity, companyState].filter(Boolean).join(", ")}`
                : ""}
            </Text>
          </View>
        </View>

        {/* ── Meta row ── */}
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{fmtDate(issueDate)}</Text>
          </View>
          {validUntil && (
            <View style={styles.metaCell}>
              <Text style={styles.metaLabel}>Valid Until</Text>
              <Text style={styles.metaValue}>{fmtDate(validUntil)}</Text>
            </View>
          )}
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Version</Text>
            <Text style={styles.metaValue}>Rev {version}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Items</Text>
            <Text style={styles.metaValue}>{lineItems.length}</Text>
          </View>
        </View>

        {/* ── Line items ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colDesc]}>Description</Text>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, styles.colTotal]}>Amount</Text>
        </View>

        {lineItems.map((item, i) => (
          <View
            key={item.productId + i}
            style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
          >
            <View style={styles.colDesc}>
              <Text style={styles.cellText}>{item.title}</Text>
              <Text style={styles.cellSku}>{item.sku}</Text>
              {item.notes ? <Text style={styles.cellNotes}>{item.notes}</Text> : null}
            </View>
            <Text style={[styles.cellText, styles.colQty]}>{item.qty}</Text>
            <Text style={[styles.cellText, styles.colUnit]}>
              {formatINR(item.unitCents)}
            </Text>
            <Text style={[styles.cellText, styles.colTotal]}>
              {formatINR(item.qty * item.unitCents)}
            </Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatINR(subtotalCents)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>GST / Tax</Text>
            <Text style={styles.totalsValue}>{formatINR(taxCents)}</Text>
          </View>
          <View style={styles.totalsFinalRow}>
            <Text style={styles.totalsFinalLabel}>Total</Text>
            <Text style={styles.totalsFinalValue}>{formatINR(totalCents)}</Text>
          </View>
        </View>

        {/* ── Terms ── */}
        {(deliveryTerms || paymentTerms) && (
          <View style={styles.termsSection}>
            {deliveryTerms && (
              <View style={styles.termBlock}>
                <Text style={styles.termLabel}>Delivery Terms</Text>
                <Text style={styles.termValue}>{deliveryTerms}</Text>
              </View>
            )}
            {paymentTerms && (
              <View style={styles.termBlock}>
                <Text style={styles.termLabel}>Payment Terms</Text>
                <Text style={styles.termValue}>{paymentTerms}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Notes ── */}
        {notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Chetan Hi-Tech &bull; Industrial Procurement Platform
          </Text>
          <Text style={styles.footerText}>
            This quotation is valid for 30 days from issue date unless otherwise stated.
          </Text>
        </View>

      </Page>
    </Document>
  );
}
