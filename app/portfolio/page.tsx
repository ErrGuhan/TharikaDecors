import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioFeed from '@/components/PortfolioFeed';
import { PortfolioCardItem } from '@/components/PortfolioCard';
import { ensureDatabaseSchema } from '@/lib/dbInit';

export const revalidate = 3600; // ISR: serve from cache, rebuild every hour

export const metadata: Metadata = {
  title: 'Our Works | Tharika Decors & Events',
  description:
    'Explore bespoke wedding mandaps, floral stage decor, traditional valaikappu setups, and milestone celebrations curated by Tharika Decors.',
};

export default async function PortfolioPage() {
  let items: PortfolioCardItem[] = [];

  try {
    await ensureDatabaseSchema().catch(() => null);

    // Strictly fetch dynamic data from PostgreSQL database via Prisma
    const dbItems = await prisma.portfolioItem
      .findMany({
        include: { category: true },
        orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
      })
      .catch((err) => {
        console.warn('[Prisma Portfolio Query Fallback in Portfolio Page]:', err);
        return [];
      });

    if (dbItems && Array.isArray(dbItems) && dbItems.length > 0) {
      items = dbItems.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        caption: item.caption,
        price: item.price,
        instagramUrl: item.instagramUrl,
        category: item.category?.name || 'Showcase',
        isCover: item.isCover,
      }));
    }
  } catch (error) {
    console.error('Database query error in portfolio page:', error);
    items = [];
  }

  // If no custom uploads are in database yet, showcase authentic event collections
  if (items.length === 0) {
    items = [
      {
        id: 'showcase-wedding-1',
        title: 'Royal Floral Muhurtham Mandap',
        imageUrl: '/wedding-cover.png',
        caption: 'Sacred wedding thaali setup, fragrant jasmine & marigold floral garlands, gold brass bells, and royal ceremonial stage backdrop.',
        category: 'Weddings',
        price: 'Starts at ₹75,000',
        instagramUrl: 'https://www.instagram.com/tharikadecors',
        isCover: true,
      },
      {
        id: 'showcase-baby-shower-1',
        title: 'Traditional Valaikappu & Seemantham Stage',
        imageUrl: '/baby-shower-cover.jpg',
        caption: 'Auspicious traditional glass bangle backdrops, lotus blooms, bespoke celebratory stage styling, and brass lamp arrangements.',
        category: 'Baby Showers',
        price: 'Starts at ₹45,000',
        instagramUrl: 'https://www.instagram.com/tharikadecors',
      },
      {
        id: 'showcase-ear-piercing-1',
        title: 'Royal Ear Piercing Ceremony & Gala Backdrop',
        imageUrl: '/ear-piercing-cover.jpg',
        caption: 'Bespoke golden throne styling, handcrafted floral pillars, pearl hangings, and grand family celebration decor.',
        category: 'Ear Piercing',
        price: 'Starts at ₹35,000',
        instagramUrl: 'https://www.instagram.com/tharikadecors',
      },
    ];
  }

  return (
    <PortfolioFeed
      initialItems={items}
      title="Our Works"
      subtitle="Discover our hand-crafted wedding stages, intimate family ceremonies, and luxury event decors."
      defaultCategory="all"
    />
  );
}
