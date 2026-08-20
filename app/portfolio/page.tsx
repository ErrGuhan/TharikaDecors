import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioSlider from '@/components/PortfolioSlider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Full Portfolio Showcase | Tharika Decors & Events',
  description:
    'View the complete luxury event styling and decor portfolio by Tharika Decors.',
};

export default async function PortfolioPage() {
  let items: { id: string; title: string; imageUrl: string; caption?: string | null; category?: string }[] = [];

  try {
    // Strictly fetch dynamic data from PostgreSQL database via Prisma
    const dbItems = await prisma.portfolioItem.findMany({
      include: { category: true },
      orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
    });

    items = dbItems.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      caption: item.caption,
      category: item.category?.name || 'Showcase',
    }));
  } catch (error) {
    console.error('Database query error in portfolio page:', error);
  }

  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider
        items={items}
        categoryTitle="Complete Portfolio"
        emptyMessage="Explore our latest wedding and celebration decors. New items will be added shortly."
      />
    </main>
  );
}
