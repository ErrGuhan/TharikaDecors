import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioSlider from '@/components/PortfolioSlider';
import { babyShowerImages as fallbackBabyShowerImages } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Baby Showers Portfolio | Tharika Decors',
  description:
    'Discover ethereal baby shower celebrations, pastel balloon clouds, floral backdrops, and dessert tables by Tharika Decors.',
};

export default async function BabyShowersPage() {
  let images: { id: string | number; title: string; url: string; category?: string }[] = [];

  try {
    // Fetch dynamic baby shower showcases from PostgreSQL database via Prisma relation
    const dbItems = await prisma.portfolioItem.findMany({
      where: {
        category: {
          slug: { in: ['baby-shower', 'baby-showers'] },
        },
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    images = dbItems.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.imageUrl,
      category: item.category?.name || 'Baby Shower',
    }));
  } catch (error) {
    console.warn('Database query failed in baby-showers page (using fallback):', error);
  }

  const displayImages = images.length > 0 ? images : fallbackBabyShowerImages;

  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider slides={displayImages} />
    </main>
  );
}
