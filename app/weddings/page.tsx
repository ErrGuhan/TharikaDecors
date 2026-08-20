import { Metadata } from 'next';
import PortfolioSlider from '@/components/PortfolioSlider';
import { weddingImages } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Weddings Portfolio | Tharika Decors',
  description:
    'Explore bespoke wedding stages, mandaps, floral arches, and luxury banquet decor curated by Tharika Decors.',
};

export default function WeddingsPage() {
  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider slides={weddingImages} />
    </main>
  );
}
