"use server";

import { requireAdmin } from "@/server/actions/_wrap";
import { db } from "@/server/db";
import { revalidateTag } from "next/cache";
import { r2, R2_BUCKET } from "@/server/services/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

// ─────────────────────────────────────────────────────
// CSV PRODUCT IMPORT
// CSV format: sku,title,description,category_slug,availability,price_rupees,specs_json
// ─────────────────────────────────────────────────────

const csvRowSchema = z.object({
  sku: z.string().min(1, "SKU required"),
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  category_slug: z.string().min(1, "Category slug required"),
  availability: z
    .enum(["IN_STOCK", "MADE_TO_ORDER", "DISCONTINUED"])
    .default("IN_STOCK"),
  price_rupees: z.coerce.number().optional(),
  specs_json: z.string().optional(), // JSON string: [{"label":"Power","value":"18kW"}]
});

type ImportError = { row: number; sku?: string; message: string };

type ValidRow = {
  sku: string;
  slug: string;
  title: string;
  description: string | null;
  categoryId: string;
  availability: "IN_STOCK" | "MADE_TO_ORDER" | "DISCONTINUED";
  priceCents: number | null;
  specs: object;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function streamToString(body: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

export type ImportRunResult = {
  importRunId: string;
  totalRows: number;
  okRows: number;
  failedRows: number;
  errors: ImportError[];
};

export async function runCsvImportAction(
  fileKey: string
): Promise<ImportRunResult | { error: string }> {
  const session = await requireAdmin();

  // Hard row limit
  const MAX_ROWS = 5000;

  // Fetch the CSV from R2
  let csvText: string;
  try {
    const obj = await r2.send(
      new GetObjectCommand({ Bucket: R2_BUCKET, Key: fileKey })
    );
    csvText = await streamToString(obj.Body as NodeJS.ReadableStream);
  } catch {
    return { error: "Could not read uploaded file. Please try again." };
  }

  const rows = parseCSV(csvText);
  if (rows.length === 0) return { error: "CSV file is empty or has no data rows." };
  if (rows.length > MAX_ROWS)
    return {
      error: `CSV has ${rows.length} rows. Maximum allowed is ${MAX_ROWS}. Split your file.`,
    };

  // Create ImportRun record
  const importRun = await db.importRun.create({
    data: {
      userId: session.user.id,
      fileKey,
      totalRows: rows.length,
      status: "PROCESSING",
    },
  });

  const errors: ImportError[] = [];
  let okRows = 0;

  // Fetch all categories for lookup (needed during import)
  const categories = await db.category.findMany({ select: { id: true, slug: true } });
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  // Process in chunks of 500
  const CHUNK_SIZE = 500;
  for (let offset = 0; offset < rows.length; offset += CHUNK_SIZE) {
    const chunk = rows.slice(offset, offset + CHUNK_SIZE);
    const validRows: ValidRow[] = [];

    for (const [i, raw] of chunk.entries()) {
      const rowIndex = offset + i + 2; // +2 for 1-indexed + header row
      const parsed = csvRowSchema.safeParse(raw);

      if (!parsed.success) {
        errors.push({
          row: rowIndex,
          sku: raw.sku,
          message: parsed.error.issues.map((e) => e.message).join("; "),
        });
        continue;
      }

      const { sku, title, description, category_slug, availability, price_rupees, specs_json } =
        parsed.data;

      const categoryId = categoryMap.get(category_slug);
      if (!categoryId) {
        errors.push({
          row: rowIndex,
          sku,
          message: `Category slug "${category_slug}" not found. Create it first.`,
        });
        continue;
      }

      let specs: object = {};
      if (specs_json) {
        try {
          specs = JSON.parse(specs_json);
        } catch {
          errors.push({ row: rowIndex, sku, message: "Invalid specs_json — must be valid JSON." });
          continue;
        }
      }

      validRows.push({
        sku,
        slug: `${slugify(title)}-${sku.toLowerCase()}`,
        title,
        description: description ?? null,
        categoryId,
        availability,
        priceCents: price_rupees ? Math.round(price_rupees * 100) : null,
        specs,
      });
      okRows++;
    }

    // Prisma 7 only supports the callback form of $transaction
    if (validRows.length > 0) {
      await db.$transaction(async (tx) => {
        for (const row of validRows) {
          await tx.product.upsert({
            where: { sku: row.sku },
            create: {
              sku: row.sku,
              slug: row.slug,
              title: row.title,
              description: row.description,
              categoryId: row.categoryId,
              availability: row.availability,
              priceCents: row.priceCents,
              specs: row.specs,
            },
            update: {
              title: row.title,
              description: row.description,
              categoryId: row.categoryId,
              availability: row.availability,
              priceCents: row.priceCents,
              specs: row.specs,
            },
          });
        }
      });
    }
  }

  // Update ImportRun with results
  await db.importRun.update({
    where: { id: importRun.id },
    data: {
      status: errors.length > 0 && okRows === 0 ? "FAILED" : "COMPLETED",
      okRows,
      failedRows: errors.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errors: errors as any,
      completedAt: new Date(),
    },
  });

  revalidateTag("products", "default");

  return {
    importRunId: importRun.id,
    totalRows: rows.length,
    okRows,
    failedRows: errors.length,
    errors,
  };
}
