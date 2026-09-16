import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { QuotationPdf } from "@/server/services/pdf/QuotationPdf";

export async function POST(request: Request) {
  try {
    const { cartRows, customerName, customerEmail, companyName } = await request.json();

    if (!cartRows || !Array.isArray(cartRows)) {
      return new NextResponse("Invalid cart items", { status: 400 });
    }

    const lineItems = cartRows.map((row: any) => ({
      productId: row.productId,
      title: row.title,
      sku: row.sku,
      qty: row.qty,
      unitCents: row.priceCents || 0,
      notes: row.notes,
    }));

    const subtotalCents = lineItems.reduce(
      (sum: number, item: any) => sum + item.qty * item.unitCents,
      0
    );
    const taxCents = Math.round(subtotalCents * 0.18);
    const totalCents = subtotalCents + taxCents;

    const props = {
      quotationNumber: "PREVIEW",
      version: 1,
      issueDate: new Date().toISOString(),
      customerName: customerName || "Guest User",
      customerEmail: customerEmail || "guest@example.com",
      companyName: companyName || "Preview Company",
      lineItems,
      subtotalCents,
      taxCents,
      totalCents,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = createElement(QuotationPdf, props as any) as any;
    const buffer = await renderToBuffer(element);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=preview.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating preview PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
