import { auth } from "@/server/auth";
import { getFeaturedProducts, getTopCategories } from "@/server/dal/products";
import { getPublishedArticles } from "@/server/dal/articles";
import { Nav } from "@/components/home/Nav";
import { Hero } from "@/components/home/Hero";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandWall } from "@/components/home/BrandWall";
import { Industries } from "@/components/home/Industries";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Testimonials } from "@/components/home/Testimonials";
import { KnowledgeTeaser } from "@/components/home/KnowledgeTeaser";
import { AiAssistantCard } from "@/components/home/AiAssistantCard";
import { CeoNote } from "@/components/home/CeoNote";
import { Footer } from "@/components/home/Footer";

export const revalidate = 3600; // revalidate homepage every hour

export default async function HomePage() {
  const [categories, featuredProducts, articles, session] = await Promise.all([
    getTopCategories().catch(() => []),
    getFeaturedProducts().catch(() => []),
    getPublishedArticles(3).catch(() => []),
    auth().catch(() => null),
  ]);

  const isLoggedIn = !!session?.user?.id;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      <Nav />

      <main className="pt-16">
        <Hero />
        <TrustStrip />
        <CategoryGrid categories={categories} />
        <FeaturedProducts products={featuredProducts} isLoggedIn={isLoggedIn} />
        <BrandWall />
        <Industries />
        <HowItWorks />
        <Testimonials />
        <KnowledgeTeaser articles={articles} />
        <AiAssistantCard />
        <CeoNote />
      </main>

      <Footer />
    </div>
  );
}
