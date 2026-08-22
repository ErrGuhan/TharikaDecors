import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioFeed from '@/components/PortfolioFeed';
import { PortfolioCardItem } from '@/components/PortfolioCard';
import { ensureDatabaseSchema } from '@/lib/dbInit';

export const revalidate = 3600; // ISR: serve from cache, rebuild in background every hour


export const metadata: Metadata = {
  title: 'Weddings Portfolio | Tharika Decors & Events',
  description:
    'Explore bespoke wedding stages, royal mandaps, floral arches, and luxury banquet decor curated by Tharika Decors.',
};

export default async function WeddingsPage() {
  let items: PortfolioCardItem[] = [];

  try {
    await ensureDatabaseSchema().catch(() => null);

    // Strictly fetch dynamic data from PostgreSQL database via Prisma
    const portfolioItems = await prisma.portfolioItem
      .findMany({
        where: {
          OR: [
            { category: { slug: { in: ['wedding', 'weddings'] } } },
            { category: { name: { contains: 'wedding', mode: 'insensitive' } } },
          ],
        },
        include: { category: true },
        orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
      })
      .catch((err) => {
        console.warn('[Prisma Portfolio Query Fallback in Weddings Page]:', err);
        return [];
      });

    if (portfolioItems && Array.isArray(portfolioItems) && portfolioItems.length > 0) {
      items = portfolioItems.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        caption: item.caption,
        price: item.price,
        instagramUrl: item.instagramUrl,
        category: item.category?.name || 'Wedding',
        isCover: item.isCover,
      }));
    }
  } catch (error) {
    console.error('Error fetching wedding portfolio items from database:', error);
    items = [];
  }

  // Use authentic traditional wedding showcase if no database records uploaded yet
  if (items.length === 0) {
    items = [
      {
        id: 'wedding-showcase-1',
        title: 'Traditional Muhurtham & Mandap Decor',
        imageUrl: '/wedding-cover.png',
        caption: 'Sacred wedding thaali, fragrant jasmine garlands, gold brass pillars, and authentic traditional ritual stage backdrop.',
        category: 'Weddings',
        price: 'Starts at ₹75,000',
        instagramUrl: 'https://www.instagram.com/tharikadecors',
        isCover: true,
      },
    ];
  }

  return (
    <PortfolioFeed
      initialItems={items}
      title="Wedding Decors"
      subtitle="Bespoke mandaps, grand floral reception stages, and traditional muhurtham setups crafted with timeless elegance."
      defaultCategory="Wedding"
      hideFilterTabs={true}
    />
  );
}
