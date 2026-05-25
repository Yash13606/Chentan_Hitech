"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { getQuotationDownloadUrlAction } from "@/server/actions/quotations";

export function DownloadButton({ quotationId }: { quotationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    const result = await getQuotationDownloadUrlAction(quotationId);
    setLoading(false);
    if ("url" in result) {
      window.open(result.url, "_blank");
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        Download PDF
      </button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
