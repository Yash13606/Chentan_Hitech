import { db } from './src/server/db';

const unsplashImages = [
  "https://images.unsplash.com/photo-1590496736639-6541f4864fa9?w=800&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
  "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
  "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80",
  "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=800&q=80",
  "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&q=80",
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80"
];

async function main() {
  const products = await db.product.findMany();
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const randomImage = unsplashImages[i % unsplashImages.length];
    
    await db.product.update({
      where: { id: product.id },
      data: {
        images: [randomImage]
      }
    });
    console.log(`Updated product ${product.title} with image.`);
  }
  
  console.log("Finished updating products.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
