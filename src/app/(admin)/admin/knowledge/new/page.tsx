"use client";

import { useActionState } from "react";
import { createArticleAction, type ArticleState } from "@/server/actions/admin/articles";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

export default function NewArticlePage() {
  const router = useRouter();
  const [state, action] = useActionState<ArticleState, FormData>(createArticleAction, {});

  useEffect(() => {
    if (state.success && state.id) {
      router.push("/admin/knowledge");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/admin/knowledge" className="text-xs text-muted-foreground hover:text-foreground">← Knowledge Center</Link>
          <h1 className="font-heading font-medium text-xl text-foreground mt-1">New Article</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {state.error && (
          <div className="mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-4 py-3">
            {state.error}
          </div>
        )}

        <form action={action} className="space-y-5">
          <div className="border border-border rounded-md bg-card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
              <input
                name="title"
                required
                placeholder="e.g. Scaling Laundry Operations for 500-Bed Hospitals"
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">Slug will be auto-generated from title</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Excerpt</label>
              <textarea
                name="excerpt"
                rows={2}
                placeholder="Short summary shown in listings..."
                className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Industry</label>
                <select
                  name="industry"
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
              Write in HTML. Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;code&gt;, &lt;blockquote&gt;.
            </p>
            <textarea
              name="body"
              rows={20}
              required
              placeholder="<h2>Introduction</h2><p>...</p>"
              className="w-full border border-border rounded-md bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              name="publishNow"
              value="false"
              className="border border-border bg-card text-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              name="publishNow"
              value="true"
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Publish Now
            </button>
            <Link href="/admin/knowledge" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
