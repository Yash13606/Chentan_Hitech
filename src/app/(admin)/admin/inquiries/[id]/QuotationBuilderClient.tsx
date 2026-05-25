"use client";

import { useState, useTransition, useActionState } from "react";
import { Plus, Trash2, FileText, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import {
  createQuotationAction,
  generateQuotationPdfAction,
  approveQuotationAction,
  getQuotationPreviewUrlAction,
  type QuotationFormState,
} from "@/server/actions/quotations";
import type { LineItem } from "@/server/services/pdf/QuotationPdf";

type SnapshotItem = {
  productId: string;
  title: string;
  sku: string;
  qty: number;
  priceCents: number | null;
  notes: string | null;
};

type Props = {
  inquiryId: string;
  cartSnapshot: SnapshotItem[];
};

function formatINR(cents: number) {
  return `₹${(cents / 100).toLocaleString("en-IN")}`;
}

export function QuotationBuilderClient({ inquiryId, cartSnapshot }: Props) {
  // Pre-populate line items from the cart snapshot
  const [lineItems, setLineItems] = useState<LineItem[]>(
    cartSnapshot.map((s) => ({
      productId: s.productId,
      title: s.title,
      sku: s.sku,
      qty: s.qty,
      unitCents: s.priceCents ?? 0,
      notes: s.notes ?? null,
    }))
  );

  const [taxPercent, setTaxPercent] = useState(18); // GST default
  const [deliveryTerms, setDeliveryTerms] = useState("Delivered to site");
  const [paymentTerms, setPaymentTerms] = useState("50% advance, 50% on delivery");
  const [notes, setNotes] = useState("");
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  // Server action state
  const [formState, formAction] = useActionState<QuotationFormState, FormData>(
    createQuotationAction,
    {}
  );

  const [isPending, startTransition] = useTransition();
  const [pdfMsg, setPdfMsg] = useState<string | null>(null);
  const [approveMsg, setApproveMsg] = useState<string | null>(null);

  // ── Calculations ──────────────────────────────────────

  const subtotalCents = lineItems.reduce((s, i) => s + i.qty * i.unitCents, 0);
  const taxCents = Math.round(subtotalCents * (taxPercent / 100));
  const totalCents = subtotalCents + taxCents;

  // ── Line item mutations ───────────────────────────────

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setLineItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  }

  function removeItem(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function addBlankItem() {
    setLineItems((prev) => [
      ...prev,
      { productId: `manual-${Date.now()}`, title: "", sku: "", qty: 1, unitCents: 0 },
    ]);
  }

  // ── Build FormData for create action ────────────────

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("inquiryId", inquiryId);
    fd.set("lineItems", JSON.stringify(lineItems));
    fd.set("taxCents", String(taxCents));
    fd.set("deliveryTerms", deliveryTerms);
    fd.set("paymentTerms", paymentTerms);
    fd.set("notes", notes);
    fd.set("validUntil", validUntil);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (formAction as any)(fd);
  }

  // ── PDF generation ────────────────────────────────────

  function handleGeneratePdf(quotationId: string) {
    startTransition(async () => {
      setPdfMsg(null);
      const result = await generateQuotationPdfAction(quotationId);
      if (result.ok) {
        setPdfMsg("PDF generated. Status set to Pending Approval.");
      } else {
        setPdfMsg(`Error: ${result.error}`);
      }
    });
  }

  function handleApprove(quotationId: string) {
    startTransition(async () => {
      setApproveMsg(null);
      const result = await approveQuotationAction(quotationId);
      if (result.success) {
        setApproveMsg("Quotation approved and marked as sent.");
      } else {
        setApproveMsg(`Error: ${result.error}`);
      }
    });
  }

  async function handlePreview(quotationId: string) {
    const result = await getQuotationPreviewUrlAction(quotationId);
    if ("url" in result) {
      window.open(result.url, "_blank");
    } else {
      alert(result.error);
    }
  }

  // ── Render ────────────────────────────────────────────

  // If quotation was just created, show the PDF/approve controls
  if (formState.quotationId) {
    return (
      <div className="border border-border rounded-md bg-card p-5 space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Quotation draft created</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleGeneratePdf(formState.quotationId!)}
            disabled={isPending}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate PDF
          </button>
          <button
            onClick={() => handlePreview(formState.quotationId!)}
            className="flex items-center gap-2 border border-border px-4 py-2 rounded-md text-sm text-foreground hover:bg-muted"
          >
            <ExternalLink className="w-4 h-4" />
            Preview PDF
          </button>
          <button
            onClick={() => handleApprove(formState.quotationId!)}
            disabled={isPending}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Approve & Send
          </button>
        </div>

        {pdfMsg && (
          <p className="text-xs text-muted-foreground">{pdfMsg}</p>
        )}
        {approveMsg && (
          <p className="text-xs text-green-600">{approveMsg}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Line Items */}
      <div className="border border-border rounded-md bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-medium text-sm text-foreground">Build Quotation</h2>
          <button
            type="button"
            onClick={addBlankItem}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add line
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr_60px_90px_90px_36px] gap-2 px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border">
          <span>Description</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Unit Price (₹)</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        <div className="divide-y divide-border">
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_90px_90px_36px] gap-2 px-4 py-3 items-center">
              <div>
                <input
                  value={item.title}
                  onChange={(e) => updateItem(i, { title: e.target.value })}
                  placeholder="Product name"
                  className="w-full text-sm bg-transparent border-b border-border/50 pb-0.5 focus:outline-none focus:border-primary/50 text-foreground"
                />
                <input
                  value={item.sku}
                  onChange={(e) => updateItem(i, { sku: e.target.value })}
                  placeholder="SKU"
                  className="w-full font-mono text-xs text-muted-foreground bg-transparent border-none focus:outline-none mt-0.5"
                />
              </div>
              <input
                type="number"
                min={1}
                value={item.qty}
                onChange={(e) => updateItem(i, { qty: parseInt(e.target.value) || 1 })}
                className="text-center text-sm border border-border rounded px-1 py-1 w-full bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <input
                type="number"
                min={0}
                step={100}
                value={item.unitCents / 100}
                onChange={(e) => updateItem(i, { unitCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                className="text-right text-sm border border-border rounded px-1 py-1 w-full bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <span className="text-right text-sm font-mono text-muted-foreground">
                {formatINR(item.qty * item.unitCents)}
              </span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-muted-foreground hover:text-destructive transition-colors justify-self-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-4 py-4 border-t border-border bg-muted/20 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">{formatINR(subtotalCents)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              GST
              <input
                type="number"
                min={0}
                max={28}
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseInt(e.target.value) || 0)}
                className="w-12 text-center border border-border rounded px-1 py-0.5 text-xs bg-background"
              />
              %
            </span>
            <span className="font-mono">{formatINR(taxCents)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-1.5 border-t border-border">
            <span className="text-foreground">Total</span>
            <span className="font-mono text-foreground">{formatINR(totalCents)}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="border border-border rounded-md bg-card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Delivery Terms
          </label>
          <input
            value={deliveryTerms}
            onChange={(e) => setDeliveryTerms(e.target.value)}
            className="w-full border border-border rounded-md bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Payment Terms
          </label>
          <input
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="w-full border border-border rounded-md bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Valid Until
          </label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full border border-border rounded-md bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Notes (appear on PDF)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-border rounded-md bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
      </div>

      {formState.error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
          {formState.error}
        </p>
      )}

      <button
        type="submit"
        disabled={lineItems.length === 0}
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        Create Quotation Draft
      </button>
    </form>
  );
}
