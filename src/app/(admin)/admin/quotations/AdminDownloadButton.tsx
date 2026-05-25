"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getQuotationDownloadUrlAction } from "@/server/actions/quotations";

export function AdminDownloadButton({ quotationId }: { quotationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    const result = await getQuotationDownloadUrlAction(quotationId);
    setLoading(false);
    if ("url" in result) {
      window.open(result.url, "_blank");
    } else {
      alert(result.error);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-primary transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      PDF
    </button>
  );
}
