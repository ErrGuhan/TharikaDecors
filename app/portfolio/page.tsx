import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioSlider from '@/components/PortfolioSlider';
import { weddingImages, babyShowerImages } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Portfolio Showcase | Tharika Decors',
  description: 'View the complete luxury event styling and decor portfolio by Tharika Decors.',
};

export default async function PortfolioPage() {
  let images: { id: string | number; title: string; url: string; category?: string }[] = [];

  try {
    const dbItems = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    images = dbItems.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.imageUrl,
      category: item.category,
    }));
  } catch (error) {
    console.warn('Database query fallback in portfolio page:', error);
  }

  const fallbackAll = [...weddingImages, ...babyShowerImages];
  const displayImages = images.length > 0 ? images : fallbackAll;

  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider slides={displayImages} />
    </main>
  );
}
