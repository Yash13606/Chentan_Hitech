"use client";

import { useState, useRef } from "react";
import { runCsvImportAction } from "@/server/actions/admin/csv-import";
import Link from "next/link";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

const CSV_TEMPLATE = `sku,title,description,category_slug,availability,price_rupees,specs_json
KCH-COM-10G,Commercial Combi Oven 10-Grid,Combi oven with 10 x 1/1 GN capacity,kitchen-equipment,IN_STOCK,125000,"[{""label"":""Capacity"",""value"":""10 x 1/1 GN""}]"`;

type ImportResult = {
  importRunId: string;
  totalRows: number;
  okRows: number;
  failedRows: number;
  errors: { row: number; sku?: string; message: string }[];
};

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Please upload a .csv file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File must be under 10 MB.");
      return;
    }

    setStatus("uploading");
    setErrorMsg(null);

    // 1. Get presigned PUT URL
    const presignRes = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: `imports/${Date.now()}-${file.name}`,
        contentType: "text/csv",
        maxBytes: 10 * 1024 * 1024,
      }),
    });

    if (!presignRes.ok) {
      setStatus("error");
      setErrorMsg("Failed to prepare upload. Please try again.");
      return;
    }

    const { url, key } = await presignRes.json();

    // 2. Upload directly to R2
    const uploadRes = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "text/csv" },
      body: file,
    });

    if (!uploadRes.ok) {
      setStatus("error");
      setErrorMsg("File upload failed. Check R2 CORS configuration.");
      return;
    }

    // 3. Run server-side import
    setStatus("processing");
    const importResult = await runCsvImportAction(key);

    if ("error" in importResult) {
      setStatus("error");
      setErrorMsg(importResult.error);
      return;
    }

    setResult(importResult);
    setStatus("done");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">
            ← Products
          </Link>
          <h1 className="font-heading font-medium text-xl text-foreground mt-1">
            Bulk Import via CSV
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Template download */}
        <div className="border border-border rounded-md bg-card p-5">
          <h2 className="font-medium text-sm text-foreground mb-2">CSV Format</h2>
          <pre className="text-xs font-mono text-muted-foreground overflow-x-auto bg-muted/30 rounded p-3 whitespace-pre-wrap">
            {CSV_TEMPLATE}
          </pre>
          <button
            onClick={() => {
              const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "products-template.csv";
              a.click();
            }}
            className="mt-3 text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Download template
          </button>
        </div>

        {/* Upload area */}
        <div className="border border-border rounded-md bg-card p-6">
          <h2 className="font-medium text-sm text-foreground mb-4">Upload CSV</h2>

          <div className="border-2 border-dashed border-border rounded-md p-8 text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              CSV file, max 10 MB, max 5000 rows
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:border file:border-border file:rounded file:text-sm file:font-medium file:bg-background file:text-foreground hover:file:bg-muted file:cursor-pointer"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-destructive mt-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </p>
          )}

          <button
            onClick={handleImport}
            disabled={status === "uploading" || status === "processing"}
            className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {status === "uploading"
              ? "Uploading…"
              : status === "processing"
              ? "Processing rows…"
              : "Import Products"}
          </button>
        </div>

        {/* Results */}
        {status === "done" && result && (
          <div className="border border-border rounded-md bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h2 className="font-medium text-foreground">Import Complete</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: "Total rows", value: result.totalRows },
                { label: "Imported", value: result.okRows, ok: true },
                { label: "Failed", value: result.failedRows, fail: true },
              ].map((s) => (
                <div key={s.label} className="border border-border rounded p-3 text-center">
                  <div className={`font-heading font-medium text-2xl ${s.ok ? "text-green-600" : s.fail ? "text-destructive" : "text-foreground"}`}>
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {result.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Failed rows ({result.errors.length}):
                </h3>
                <div className="border border-border rounded overflow-auto max-h-48">
                  <table className="w-full text-xs">
                    <thead className="border-b border-border bg-muted/30">
                      <tr>
                        <th className="text-left px-3 py-2 text-muted-foreground">Row</th>
                        <th className="text-left px-3 py-2 text-muted-foreground">SKU</th>
                        <th className="text-left px-3 py-2 text-muted-foreground">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {result.errors.map((err, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-mono">{err.row}</td>
                          <td className="px-3 py-2 font-mono">{err.sku ?? "—"}</td>
                          <td className="px-3 py-2 text-destructive">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fix the failed rows in your CSV and re-import. Re-running is safe — existing SKUs will be updated.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
