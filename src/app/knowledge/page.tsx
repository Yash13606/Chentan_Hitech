import { getPublishedArticles } from "@/server/dal/articles";
import Link from "next/link";
import { BookOpen, ArrowUpRight, ArrowLeft } from "lucide-react";

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

export const revalidate = 3600;

export default async function KnowledgePage() {
  const articles = await getPublishedArticles(50).catch(() => []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-foreground px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-xs text-background/50 hover:text-background/80 transition-colors flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Home
          </Link>
          <p className="text-xs font-sans font-medium tracking-[0.4px] text-background/40 uppercase mb-2">Knowledge Center</p>
          <h1 className="font-heading font-medium text-3xl md:text-4xl text-background">Engineering Insights</h1>
          <p className="text-background/50 mt-2 max-w-xl">
            Case studies, compliance guides, and operational strategies for facility managers and procurement teams.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {articles.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-heading font-medium text-foreground mb-2">No articles published yet</p>
            <p className="text-sm text-muted-foreground">Check back soon — our engineering team is writing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/knowledge/${article.slug}`} className="group">
                <div className="aspect-[16/10] bg-muted rounded-lg border border-border mb-4 flex items-center justify-center overflow-hidden">
                  <BookOpen size={32} className="text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="flex items-center gap-3 mb-3">
                  {article.industry && (
                    <span className="text-xs font-mono px-2 py-1 bg-muted rounded text-muted-foreground">
                      {INDUSTRY_LABELS[article.industry] ?? article.industry}
                    </span>
                  )}
                  {article.tags.slice(0, 1).map((tag) => (
                    <span key={tag} className="text-xs font-mono px-2 py-1 bg-primary/10 text-primary rounded">
                      {tag}
                    </span>
                  ))}
                  {article.publishedAt && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(article.publishedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>

                <h2 className="font-heading text-lg font-medium text-foreground group-hover:text-primary transition-colors flex items-start justify-between gap-2">
                  {article.title}
                  <ArrowUpRight size={16} className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h2>

                {article.excerpt && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
