export interface PortfolioImage {
  id: string | number;
  url: string;
  title: string;
  category?: string;
  description?: string;
}

export const weddingImages: PortfolioImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    title: 'Grand Floral Mandap & Stage',
    category: 'Wedding',
    description: 'Cascading white blossoms, golden arches, and radiant warm ambient chandeliers.',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    title: 'Elegant Banquet Table Setting',
    category: 'Wedding',
    description: 'Fine crystal stemware, custom velvet runners, and fresh botanical centrepieces.',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1200&q=80',
    title: 'Royal Candlelit Aisle Decor',
    category: 'Wedding',
    description: 'Floating candles in glass cylinders flanked by lush white rose petals.',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    title: 'Fairytale Outdoor Canopy',
    category: 'Wedding',
    description: 'Starlight fairy string canopies overlooking scenic sunset gardens.',
  },
];

export const babyShowerImages: PortfolioImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80',
    title: 'Pastel Cloud & Balloon Arch',
    category: 'Baby Shower',
    description: 'Organic pastel balloons, shimmering golden moons, and soft teddy bear accents.',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    title: 'Botanical Garden Celebration',
    category: 'Baby Shower',
    description: 'Lush eucalyptus foliage, cream peonies, and rustic timber signage.',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    title: 'Ethereal Sweet Table Backdrop',
    category: 'Baby Shower',
    description: 'Artisan floral cake pedestals, golden dessert platters, and custom velvet drapes.',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80',
    title: 'Golden Sunset Welcome Arch',
    category: 'Baby Shower',
    description: 'Custom marquee letters, pastel floral clouds, and gentle fairy lights.',
  },
];
