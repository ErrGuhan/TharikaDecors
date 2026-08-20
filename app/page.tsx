import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import HomeHeroAndCategories, { DynamicCategoryCard } from '@/components/HomeHeroAndCategories';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Tharika Decors & Events | Luxury Event Styling & Stage Decor',
  description:
    'Bespoke wedding mandaps, floral stage decor, baby shower styling, and milestone celebrations by Tharika Decors.',
};

export default async function HomePage() {
  let categoryCards: DynamicCategoryCard[] = [];

  try {
    // Fetch categories with their latest cover or item from database
    const categoriesFromDb = await prisma.category.findMany({
      include: {
        items: {
          orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
          take: 1,
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    if (categoriesFromDb.length > 0) {
      categoryCards = categoriesFromDb.map((cat) => {
        const coverItem = cat.items[0];
        let href = '/portfolio';
        let defaultImage = '';

        if (cat.slug === 'wedding' || cat.slug === 'weddings') {
          href = '/weddings';
          defaultImage = '/wedding-cover.png';
        } else if (cat.slug === 'baby-shower' || cat.slug === 'baby-showers') {
          href = '/baby-showers';
          defaultImage = '/baby-shower-cover.jpg';
        } else if (cat.slug === 'ear-piercing' || cat.slug === 'ear-piercing-gala') {
          href = '/portfolio';
          defaultImage = '/ear-piercing-cover.jpg';
        }

        return {
          title: cat.name,
          href,
          imageUrl:
            coverItem?.imageUrl ||
            defaultImage ||
            '/ear-piercing-cover.jpg',
          itemCount: cat._count.items,
        };
      });
    }
  } catch (error) {
    console.error('Error fetching categories for homepage:', error);
  }

  // If no dynamic categories exist yet in database, provide standard showcase navigation
  if (categoryCards.length === 0) {
    categoryCards = [
      {
        title: 'Weddings',
        href: '/weddings',
        imageUrl: '/wedding-cover.png',
        itemCount: 0,
      },
      {
        title: 'Baby Showers',
        href: '/baby-showers',
        imageUrl: '/baby-shower-cover.jpg',
        itemCount: 0,
      },
      {
        title: 'Ear Piercing & Gala',
        href: '/portfolio',
        imageUrl: '/ear-piercing-cover.jpg',
        itemCount: 0,
      },
    ];
  }

  return <HomeHeroAndCategories categories={categoryCards} />;
}
