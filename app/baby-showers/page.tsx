import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioFeed from '@/components/PortfolioFeed';
import { PortfolioCardItem } from '@/components/PortfolioCard';
import { ensureDatabaseSchema } from '@/lib/dbInit';

export const revalidate = 3600; // ISR: serve from cache, rebuild in background every hour


export const metadata: Metadata = {
  title: 'Baby Showers & Seemantham Portfolio | Tharika Decors & Events',
  description:
    'Enchanting baby shower themes, traditional Valaikappu ceremonies, cradle decor, and bespoke milestone styling by Tharika Decors.',
};

export default async function BabyShowersPage() {
  let items: PortfolioCardItem[] = [];

  try {
    await ensureDatabaseSchema().catch(() => null);

    // Strictly fetch dynamic data from PostgreSQL database via Prisma
    const portfolioItems = await prisma.portfolioItem
      .findMany({
        where: {
          OR: [
            { category: { slug: { in: ['baby-shower', 'baby-showers', 'seemantham', 'valaikappu'] } } },
            { category: { name: { contains: 'baby', mode: 'insensitive' } } },
            { category: { name: { contains: 'valaikappu', mode: 'insensitive' } } },
            { category: { name: { contains: 'seemantham', mode: 'insensitive' } } },
          ],
        },
        include: { category: true },
        orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
      })
      .catch((err) => {
        console.warn('[Prisma Portfolio Query Fallback in Baby Showers Page]:', err);
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
        category: item.category?.name || 'Baby Shower',
        isCover: item.isCover,
      }));
    }
  } catch (error) {
    console.error('Error fetching baby shower portfolio items from database:', error);
    items = [];
  }

  // Use authentic traditional Valaikappu/Seemantham showcase if no database records uploaded yet
  if (items.length === 0) {
    items = [
      {
        id: 'baby-shower-showcase-1',
        title: 'Traditional Valaikappu & Seemantham Decor',
        imageUrl: '/baby-shower-cover.jpg',
        caption: 'Sacred glass bangle ceremony backdrop, vibrant auspicious florals, brass lamps, and bespoke celebratory stage styling.',
        category: 'Baby Showers',
        price: 'Starts at ₹45,000',
        instagramUrl: 'https://www.instagram.com/tharikadecors',
        isCover: true,
      },
    ];
  }

  return (
    <PortfolioFeed
      initialItems={items}
      title="Baby Showers & Valaikappu"
      subtitle="Celebrate motherhood and joyous new beginnings with enchanting floral setups and traditional stage designs."
      defaultCategory="Baby Shower"
      hideFilterTabs={true}
    />
  );
}
