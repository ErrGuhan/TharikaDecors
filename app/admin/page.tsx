import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import AdminDashboardShell from '@/components/AdminDashboardShell';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // Step 2: Fetch dynamic items & categories with safe fallbacks and try...catch
  let existingItems: any[] = [];
  let availableCategories: any[] = [
    { id: 'default', name: 'Wedding', slug: 'wedding', createdAt: new Date().toISOString() },
  ];

  try {
    const [rawItems, categories] = await Promise.all([
      prisma.portfolioItem
        .findMany({
          include: { category: true },
          orderBy: { createdAt: 'desc' },
        })
        .catch((err) => {
          console.warn('[Prisma Portfolio Query Fallback]:', err);
          return [];
        }),
      prisma.category
        .findMany({
          orderBy: { name: 'asc' },
        })
        .catch((err) => {
          console.warn('[Prisma Category Query Fallback]:', err);
          return [];
        }),
    ]);

    if (categories && Array.isArray(categories) && categories.length > 0) {
      availableCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : (c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString()),
      }));
    } else {
      availableCategories = [
        { id: 'default', name: 'Wedding', slug: 'wedding', createdAt: new Date().toISOString() },
      ];
    }

    if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
      existingItems = rawItems.map((item) => ({
        id: item.id,
        title: item.title,
        caption: item.caption || '',
        price: item.price || null,
        instagramUrl: item.instagramUrl || null,
        category: item.category?.name || item.category?.slug || 'Wedding',
        categoryId: item.categoryId,
        imageUrl: item.imageUrl,
        isCover: item.isCover ?? false,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : (item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()),
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt ? new Date(item.updatedAt).toISOString() : (item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date().toISOString())),
      }));
    } else {
      existingItems = [];
    }
  } catch (error) {
    console.warn('[Prisma Global Query Catch in Admin Page]:', error);
    existingItems = [];
    availableCategories = [
      { id: 'default', name: 'Wedding', slug: 'wedding', createdAt: new Date().toISOString() },
    ];
  }

  return (
    <AdminDashboardShell
      userEmail={user.email || authorizedAdminEmail}
      initialItems={existingItems}
      initialCategories={availableCategories}
    />
  );
}
