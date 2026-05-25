import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { QuotationPdf, type QuotationPdfProps } from "./QuotationPdf";
import { uploadBuffer } from "@/server/services/r2";

/**
 * Renders the quotation PDF to a buffer, uploads to R2, and returns the key.
 * key pattern: quotations/{quotationId}/v{version}-{timestamp}.pdf
 */
export async function renderAndUploadQuotationPdf(
  quotationId: string,
  version: number,
  props: QuotationPdfProps
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(QuotationPdf, props) as any;
  // renderToBuffer is the Node-compatible API — no Chromium needed
  const buffer = await renderToBuffer(element);

  const key = `quotations/${quotationId}/v${version}-${Date.now()}.pdf`;
  await uploadBuffer(key, buffer, "application/pdf");

  return key;
}
