import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import UploadForm from '@/components/UploadForm';
import AdminRecordsList from '@/components/AdminRecordsList';
import { ShieldCheck, Sparkles, Home } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Step 1: Server-Side Authentication Check
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Admin email resolution with safe fallback
  const rawAdminEmail = process.env.ADMIN_EMAIL || 'admin@tharikadecors.com';
  const authorizedAdminEmail = rawAdminEmail.trim().toLowerCase();

  console.log('[Admin Auth Check] Current user:', user?.email, '| Configured Admin Email:', authorizedAdminEmail);

  if (authError || !user) {
    console.warn('[Admin Auth Check] No authenticated user found, redirecting to /login:', authError?.message);
    redirect('/login');
  }

  const currentUserEmail = (user.email || '').trim().toLowerCase();
  const isAuthorized = currentUserEmail === authorizedAdminEmail;

  if (!isAuthorized) {
    console.warn(`[Admin Auth Check] Unauthorized access attempt by: ${currentUserEmail}`);
    redirect('/login');
  }

  // Fetch existing items with category relation from Prisma PostgreSQL
  let existingItems: any[] = [];
  let availableCategories: any[] = [];

  try {
    const [rawItems, categories] = await Promise.all([
      prisma.portfolioItem.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    availableCategories = categories;

    existingItems = rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      caption: item.caption,
      category: item.category?.name || item.category?.slug || 'General',
      categoryId: item.categoryId,
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
              Signed in as: <span className="font-semibold text-tharika-blue">{user.email}</span>
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
