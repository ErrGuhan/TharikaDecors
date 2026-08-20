import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import AdminDashboardShell from '@/components/AdminDashboardShell';

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

  // Fetch dynamic items & categories from PostgreSQL via Prisma
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

    availableCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      createdAt: c.createdAt.toISOString(),
    }));

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
    <AdminDashboardShell
      userEmail={user.email || authorizedAdminEmail}
      initialItems={existingItems}
      initialCategories={availableCategories}
    />
  );
}
