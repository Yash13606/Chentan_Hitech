"use client";

import { useActionState, useEffect, useState } from "react";
import { updateArticleAction, type ArticleState } from "@/server/actions/admin/articles";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

const INDUSTRY_OPTIONS = [
  { value: "", label: "General (no industry)" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "DEFENCE", label: "Defence & Marine" },
  { value: "MARINE", label: "Marine" },
  { value: "LAUNDRY", label: "Laundry" },
  { value: "EDUCATION", label: "Education" },
  { value: "CORPORATE", label: "Corporate" },
];

interface ArticleData {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  industry: string | null;
  tags: string[];
  publishedAt: string | null;
}

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [state, action] = useActionState<ArticleState, FormData>(updateArticleAction, {});

  useEffect(() => {
    if (state.success) {
      router.push("/admin/knowledge");
    }
  }, [state, router]);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await fetch(`/api/admin/articles/${params.id}`);
        if (!res.ok) throw new Error("Article not found");
        const data = await res.json();
        setArticle(data);
      } catch {
        setFetchError("Could not load article. It may not exist.");
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading article…</p>
      </div>
    );
  }

  if (fetchError || !article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <Link href="/admin/knowledge" className="text-xs text-muted-foreground hover:text-foreground">← Knowledge Center</Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">Edit Article</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <p className="text-sm text-destructive">{fetchError ?? "Article not found."}</p>
          <Link href="/admin/knowledge" className="inline-block mt-4 text-sm text-muted-foreground underline underline-offset-4">
            Back to Knowledge Center
          </Link>
        </div>
      </div>
    );
  }

  const isPublished = !!article.publishedAt;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/admin/knowledge" className="text-xs text-muted-foreground hover:text-foreground">← Knowledge Center</Link>
            <h1 className="font-heading font-medium text-xl text-foreground mt-1">Edit Article</h1>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full border font-mono ${isPublished ? "text-green-700 bg-green-50 border-green-200" : "text-muted-foreground bg-muted border-border"}`}>
              {isPublished ? "Published" : "Draft"}
            </span>
            <span className="text-muted-foreground font-mono">{article.slug}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {state.error && (
          <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-3">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-5">
          {/* Hidden id field */}
          <input type="hidden" name="id" value={article.id} />

          <div className="border border-border rounded-md bg-card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
              <input
                name="title"
                required
                defaultValue={article.title}
                placeholder="e.g. Scaling Laundry Operations for 500-Bed Hospitals"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">Slug is fixed after creation: <code className="font-mono text-xs">{article.slug}</code></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Excerpt</label>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={article.excerpt ?? ""}
                placeholder="Short summary shown in listings…"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Industry</label>
                <select
                  name="industry"
                  defaultValue={article.industry ?? ""}
                  className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                <input
                  name="tags"
                  defaultValue={article.tags.join(", ")}
                  placeholder="Case Study, Compliance, Engineering"
                  className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-md bg-card p-5">
            <label className="block text-sm font-medium text-foreground mb-1">Body (HTML) *</label>
            <p className="text-xs text-muted-foreground mb-2">
              Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;code&gt;, &lt;blockquote&gt;.
            </p>
            <textarea
              name="body"
              rows={24}
              required
              defaultValue={article.body}
              placeholder="<h2>Introduction</h2><p>…</p>"
              className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              type="submit"
              name="publishNow"
              value="false"
              className="border border-border bg-card text-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Save Changes
            </button>

            {!isPublished ? (
              <button
                type="submit"
                name="publishNow"
                value="true"
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Publish Now
              </button>
            ) : (
              <button
                type="submit"
                name="unpublish"
                value="true"
                className="border border-destructive/30 text-destructive px-5 py-2.5 rounded-md text-sm font-medium hover:bg-destructive/10 transition-colors"
              >
                Unpublish
              </button>
            )}

            {isPublished && (
              <Link
                href={`/knowledge/${article.slug}`}
                target="_blank"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                View live
              </Link>
            )}

            <Link href="/admin/knowledge" className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
