import { Metadata } from 'next';
import PortfolioSlider from '@/components/PortfolioSlider';
import { babyShowerImages } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Baby Showers Portfolio | Tharika Decors',
  description:
    'Discover ethereal baby shower celebrations, pastel balloon clouds, floral backdrops, and dessert tables by Tharika Decors.',
};

export default function BabyShowersPage() {
  return (
    <main className="w-full min-h-screen bg-black">
      <PortfolioSlider slides={babyShowerImages} />
    </main>
  );
}
