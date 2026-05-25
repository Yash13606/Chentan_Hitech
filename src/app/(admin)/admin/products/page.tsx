import { db } from "@/server/db";
import { deleteProductAction } from "@/server/actions/admin/products";
import Link from "next/link";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      sku: true,
      title: true,
      availability: true,
      isActive: true,
      priceCents: true,
      category: { select: { name: true } },
      createdAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground">← Admin</Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">Products</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/products/import"
              className="border border-border rounded-md px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Import CSV
            </Link>
            <Link
              href="/admin/products/new"
              className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              + New Product
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">SKU / Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Availability</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No products yet.{" "}
                    <Link href="/admin/products/new" className="underline underline-offset-2 text-foreground">
                      Add one
                    </Link>{" "}
                    or{" "}
                    <Link href="/admin/products/import" className="underline underline-offset-2 text-foreground">
                      import from CSV
                    </Link>
                    .
                  </td>
                </tr>
              )}
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-muted-foreground">{product.sku}</div>
                    <div className="font-medium text-foreground">{product.title}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {product.category.name}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      product.availability === "IN_STOCK"
                        ? "bg-green-100 text-green-700"
                        : product.availability === "MADE_TO_ORDER"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {product.availability.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {product.priceCents
                      ? `₹${(product.priceCents / 100).toLocaleString("en-IN")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${product.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <form action={deleteProductAction.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="text-xs text-destructive hover:text-destructive/80 transition-colors"
                        >
                          Deactivate
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
