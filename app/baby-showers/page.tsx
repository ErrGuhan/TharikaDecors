import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioSlider from '@/components/PortfolioSlider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Baby Showers Portfolio | Tharika Decors & Events',
  description:
    'Enchanting baby shower themes, cradle ceremonies, balloon garlands, and bespoke milestone styling by Tharika Decors.',
};

export default async function BabyShowersPage() {
  let items: { id: string; title: string; imageUrl: string; caption?: string | null; category?: string }[] = [];

  try {
    // Strictly fetch dynamic data from PostgreSQL database via Prisma
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: {
        OR: [
          { category: { slug: { in: ['baby-shower', 'baby-showers'] } } },
          { category: { name: { contains: 'baby', mode: 'insensitive' } } },
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
      category: item.category?.name || 'Baby Shower',
    }));
  } catch (error) {
    console.error('Error fetching baby shower portfolio items from database:', error);
  }

  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider
        items={items}
        categoryTitle="Baby Shower Decor"
        emptyMessage="New whimsical baby shower and cradle ceremony decor showcases will be published soon."
      />
    </main>
  );
}
