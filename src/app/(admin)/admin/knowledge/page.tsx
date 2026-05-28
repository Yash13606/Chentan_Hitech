import { auth } from "@/server/auth";
import { getAllArticlesAdmin } from "@/server/dal/articles";
import { deleteArticleAction } from "@/server/actions/admin/articles";
import Link from "next/link";
import { Role } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export default async function AdminKnowledgePage() {
  // TODO(temp): dev bypass — see (admin)/layout.tsx for the matching note.
  if (process.env.NODE_ENV === "production") {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN) redirect("/unauthorized");
  }

  const articles = await getAllArticlesAdmin();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground">← Admin</Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">Knowledge Center</h1>
          </div>
          <Link
            href="/admin/knowledge/new"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> New Article
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {articles.length === 0 ? (
          <div className="border border-border rounded-md bg-card p-12 text-center">
            <p className="text-muted-foreground text-sm">No articles yet.</p>
            <Link href="/admin/knowledge/new" className="inline-block mt-4 text-sm font-medium text-foreground underline underline-offset-4">
              Create the first one
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-md bg-card overflow-hidden">
            <div className="divide-y divide-border">
              {articles.map((article) => (
                <div key={article.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {article.publishedAt ? (
                        <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <Eye className="w-3 h-3" /> Published
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <EyeOff className="w-3 h-3" /> Draft
                        </span>
                      )}
                      {article.industry && (
                        <span className="text-xs font-mono text-muted-foreground">{article.industry}</span>
                      )}
                    </div>
                    <p className="font-medium text-sm text-foreground truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{article.slug}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {article.publishedAt && (
                      <Link href={`/knowledge/${article.slug}`} target="_blank" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                        View
                      </Link>
                    )}
                    <Link
                      href={`/admin/knowledge/${article.id}/edit`}
                      className="flex items-center gap-1.5 text-xs border border-border rounded px-2 py-1.5 hover:bg-muted transition-colors"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        await deleteArticleAction(article.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 text-xs border border-destructive/30 text-destructive rounded px-2 py-1.5 hover:bg-destructive/10 transition-colors"
                        onClick={(e) => {
                          if (!confirm("Delete this article?")) e.preventDefault();
                        }}
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
