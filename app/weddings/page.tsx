import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioSlider from '@/components/PortfolioSlider';
import { weddingImages as fallbackWeddingImages } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Weddings Portfolio | Tharika Decors',
  description:
    'Explore bespoke wedding stages, mandaps, floral arches, and luxury banquet decor curated by Tharika Decors.',
};

export default async function WeddingsPage() {
  let images: { id: string | number; title: string; url: string; category?: string }[] = [];

  try {
    // Fetch dynamic wedding showcases from PostgreSQL database via Prisma relation
    const dbItems = await prisma.portfolioItem.findMany({
      where: {
        category: {
          slug: { in: ['wedding', 'weddings'] },
        },
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    images = dbItems.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.imageUrl,
      category: item.category?.name || 'Wedding',
    }));
  } catch (error) {
    console.warn('Database query failed in weddings page (using fallback):', error);
  }

  const displayImages = images.length > 0 ? images : fallbackWeddingImages;

  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider slides={displayImages} />
    </main>
  );
}
