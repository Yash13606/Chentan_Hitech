import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { SectionHeader } from "./CategoryGrid";

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  industry: string | null;
  tags: string[];
  publishedAt: Date | null;
};

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function KnowledgeTeaser({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="px-6 py-20 md:py-24 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <SectionHeader
          eyebrow="Knowledge"
          title="Buyer guides & specifier notes"
          sub="Plain-English guides for facility managers, F&B directors and procurement officers."
        />
        <Link
          href="/knowledge"
          className="text-sm font-medium text-foreground inline-flex items-center gap-1 hover:gap-2 transition-all whitespace-nowrap"
        >
          All articles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/knowledge/${a.slug}`}
            className="group rounded-xl border border-border bg-card p-7 flex flex-col gap-4 hover:border-foreground/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              {a.publishedAt && (
                <span className="text-[11px] font-mono tracking-tight text-muted-foreground">
                  {formatDate(a.publishedAt)}
                </span>
              )}
            </div>

            <h3 className="font-heading text-lg font-medium text-foreground leading-snug group-hover:underline decoration-border underline-offset-4">
              {a.title}
            </h3>

            {a.excerpt && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {a.excerpt}
              </p>
            )}

            {a.industry && (
              <span className="mt-auto text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
                {a.industry.toLowerCase().replace(/_/g, " ")}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
