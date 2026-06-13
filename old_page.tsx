import { getFeaturedProducts } from "@/server/dal/products";
import { getPublishedArticles } from "@/server/dal/articles";
import { HomeClient } from "@/components/home/HomeClient";

export const revalidate = 3600; // revalidate homepage every hour

export default async function HomePage() {
  const [featuredProducts, articles] = await Promise.all([
    getFeaturedProducts().catch(() => []),
    getPublishedArticles(3).catch(() => []),
  ]);

  return <HomeClient featuredProducts={featuredProducts} articles={articles} />;
}
