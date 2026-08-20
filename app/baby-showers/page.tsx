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
    // Step 2: Fetch dynamic data from PostgreSQL database via Prisma
    const dbItems = await prisma.portfolioItem.findMany({
      where: { category: 'baby-shower' },
      orderBy: { createdAt: 'desc' },
    });

    // Step 3: Map imageUrl and title fields
    images = dbItems.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.imageUrl,
      category: 'Baby Shower',
    }));
  } catch (error) {
    console.warn('Database query failed in baby-showers page (using fallback):', error);
  }

  // Use database images if present, otherwise fallback to curated showcases
  const displayImages = images.length > 0 ? images : fallbackBabyShowerImages;

  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider slides={displayImages} />
    </main>
  );
}
