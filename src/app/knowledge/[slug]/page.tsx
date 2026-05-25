import { getArticleBySlug, getPublishedArticles } from "@/server/dal/articles";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const INDUSTRY_LABELS: Record<string, string> = {
  HOSPITALITY: "Hospitality",
  HEALTHCARE: "Healthcare",
  DEFENCE: "Defence & Marine",
  MARINE: "Marine",
  LAUNDRY: "Laundry",
  EDUCATION: "Education",
  CORPORATE: "Corporate",
  RESTAURANT: "Restaurant",
  OTHER: "General",
};

export async function generateStaticParams() {
  try {
    const articles = await getPublishedArticles(50);
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    // DB not available at build time (e.g. placeholder credentials) — render on demand
    return [];
  }
}

export const dynamicParams = true;

export const revalidate = 3600;

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || !article.publishedAt) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-foreground px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/knowledge"
            className="text-xs text-background/50 hover:text-background/80 transition-colors flex items-center gap-1 mb-6"
          >
            <ArrowLeft className="w-3 h-3" /> Knowledge Center
          </Link>

          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {article.industry && (
              <span className="text-xs font-mono px-2 py-1 bg-background/10 text-background/60 rounded">
                {INDUSTRY_LABELS[article.industry] ?? article.industry}
              </span>
            )}
            {article.tags.map((tag) => (
              <span key={tag} className="text-xs font-mono px-2 py-1 bg-primary/20 text-primary rounded flex items-center gap-1">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>

          <h1 className="font-heading font-medium text-3xl md:text-4xl text-background leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-4 text-lg text-background/60 leading-relaxed">{article.excerpt}</p>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs text-background/40">
            <Calendar className="w-3 h-3" />
            <span>
              Published{" "}
              {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Render body — stored as HTML */}
        <div
          className="prose prose-neutral max-w-none
            prose-headings:font-heading prose-headings:font-medium
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-muted-foreground prose-li:leading-relaxed
            prose-strong:text-foreground prose-strong:font-medium
            prose-code:text-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
            prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* CTA */}
        <div className="mt-16 border border-border rounded-xl bg-card p-6">
          <h3 className="font-heading font-medium text-lg text-foreground mb-2">
            Ready to equip your facility?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Browse our equipment catalog or submit an RFQ to get a tailored quotation within 24 hours.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/catalog"
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Browse Catalog
            </Link>
            <Link
              href="/portal/consultations"
              className="border border-border bg-card text-foreground px-5 py-2.5 rounded-md text-sm font-medium hover:bg-muted transition-colors"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
