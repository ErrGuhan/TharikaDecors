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
        if (cat.slug === 'wedding' || cat.slug === 'weddings') {
          href = '/weddings';
        } else if (cat.slug === 'baby-shower' || cat.slug === 'baby-showers') {
          href = '/baby-showers';
        }

        return {
          title: cat.name,
          href,
          imageUrl: coverItem?.imageUrl || '',
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
        imageUrl:
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        itemCount: 0,
      },
      {
        title: 'Baby Showers',
        href: '/baby-showers',
        imageUrl:
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
        itemCount: 0,
      },
      {
        title: 'Ear Piercing & Gala',
        href: '/portfolio',
        imageUrl:
          'https://images.pexels.com/photos/28389453/pexels-photo-28389453.jpeg?auto=compress&cs=tinysrgb&h=800&w=800',
        itemCount: 0,
      },
    ];
  }

  return <HomeHeroAndCategories categories={categoryCards} />;
}
