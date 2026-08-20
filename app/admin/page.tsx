import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import UploadForm from '@/components/UploadForm';
import AdminRecordsList from '@/components/AdminRecordsList';
import { ShieldCheck, Sparkles, Home } from 'lucide-react';
import Link from 'next/link';

const AUTHORIZED_ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || 'admin@tharikadecors.com'
).toLowerCase();

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Step 1: Server-Side Authentication Check
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthorized =
    (user && user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) ||
    process.env.NODE_ENV === 'development';

  if (!isAuthorized) {
    redirect('/login');
  }

  // Fetch existing items from Prisma PostgreSQL
  let existingItems: any[] = [];
  try {
    const rawItems = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    existingItems = rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      caption: item.caption,
      category: item.category,
      imageUrl: item.imageUrl,
      isCover: item.isCover,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt?.toISOString() || item.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn('Prisma portfolio fetch fallback in admin page:', error);
  }

  return (
    <div className="min-h-screen bg-tharika-cream py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ── Admin Top Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-tharika-blue/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-tharika-green mb-1">
              <ShieldCheck className="w-4 h-4 text-tharika-green" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-tharika-blue tracking-tight">
              Tharika Decors Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Signed in as: <span className="font-semibold text-tharika-blue">{user?.email || AUTHORIZED_ADMIN_EMAIL}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>View Site</span>
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tharika-blue text-white text-sm font-medium hover:bg-[#072844] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Live Portfolio</span>
            </Link>
          </div>
        </header>

        {/* ── Admin Dashboard Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Upload Form */}
          <div className="lg:col-span-5 sticky top-6">
            <UploadForm />
          </div>

          {/* Right Column: Records Manager with Sticky Filter Tabs & Search Bar */}
          <div className="lg:col-span-7">
            <AdminRecordsList initialItems={existingItems} />
          </div>
        </div>
      </div>
    </div>
  );
}
