import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioSlider from '@/components/PortfolioSlider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Weddings Portfolio | Tharika Decors & Events',
  description:
    'Explore bespoke wedding stages, royal mandaps, floral arches, and luxury banquet decor curated by Tharika Decors.',
};

export default async function WeddingsPage() {
  let items: { id: string; title: string; imageUrl: string; caption?: string | null; category?: string }[] = [];

  try {
    // Strictly fetch dynamic data from PostgreSQL database via Prisma
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        OR: [
          { category: { slug: { in: ['wedding', 'weddings'] } } },
          { category: { name: { contains: 'wedding', mode: 'insensitive' } } },
        ],
      },
      include: { category: true },
      orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
    });

    items = portfolioItems.map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.imageUrl,
      caption: item.caption,
      category: item.category?.name || 'Wedding',
    }));
  } catch (error) {
    console.error('Error fetching wedding portfolio items from database:', error);
  }

  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider
        items={items}
        categoryTitle="Wedding Decor"
        emptyMessage="New wedding mandap and floral stage showcases will be available soon."
      />
    </main>
  );
}
