import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import PortfolioSlider from '@/components/PortfolioSlider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Baby Showers & Seemantham Portfolio | Tharika Decors & Events',
  description:
    'Enchanting baby shower themes, traditional Valaikappu ceremonies, cradle decor, and bespoke milestone styling by Tharika Decors.',
};

export default async function BabyShowersPage() {
  let items: { id: string; title: string; imageUrl: string; caption?: string | null; category?: string }[] = [];

  try {
    // Strictly fetch dynamic data from PostgreSQL database via Prisma
    const portfolioItems = await prisma.portfolioItem.findMany({
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

  // Use uploaded traditional Valaikappu/Seemantham showcase if no database records uploaded yet
  if (items.length === 0) {
    items = [
      {
        id: 'baby-shower-showcase-1',
        title: 'Traditional Valaikappu & Seemantham Decor',
        imageUrl: '/baby-shower-cover.jpg',
        caption: 'Sacred bangle ceremony, vibrant auspicious florals, and bespoke celebratory stage styling.',
        category: 'Baby Showers',
      },
    ];
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
