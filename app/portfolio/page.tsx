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

  // If no custom uploads are in database yet, showcase the user's 3 authentic event collections
  if (items.length === 0) {
    items = [
      {
        id: 'showcase-wedding',
        title: 'Traditional Muhurtham & Mandap Decor',
        imageUrl: '/wedding-cover.png',
        caption: 'Sacred wedding thaali, fragrant jasmine garlands, and gold-hued traditional ritual decor.',
        category: 'Weddings',
      },
      {
        id: 'showcase-baby-shower',
        title: 'Traditional Valaikappu & Seemantham Decor',
        imageUrl: '/baby-shower-cover.jpg',
        caption: 'Auspicious glass bangles, vibrant florals, and bespoke celebratory stage styling.',
        category: 'Baby Showers',
      },
      {
        id: 'showcase-ear-piercing',
        title: 'Ear Piercing Ceremony & Royal Gala Styling',
        imageUrl: '/ear-piercing-cover.jpg',
        caption: 'Bespoke golden ear piercing decor, pearl stage elements, and festive family celebration backdrops.',
        category: 'Ear Piercing',
      },
    ];
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
