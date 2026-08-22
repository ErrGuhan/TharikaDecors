import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import AdminDashboardShell from '@/components/AdminDashboardShell';
import { ensureDatabaseSchema } from '@/lib/dbInit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  // Step 1: Server-Side Authentication Check via Supabase SSR
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.warn('[Admin Auth Check] No authenticated user found, redirecting to /login:', authError?.message);
    redirect('/login');
  }

  // Admin emails resolution supporting multiple emails
  const rawAdminEmails = (
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    'admin@tharikadecors.com,admin@tharikadecor.com,owner@tharikadecor.com'
  )
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const currentUserEmail = (user.email || '').trim().toLowerCase();

  // Allow access in development, or if the user's email is in ADMIN_EMAILS list
  const isAuthorized =
    process.env.NODE_ENV === 'development' ||
    rawAdminEmails.length === 0 ||
    rawAdminEmails.includes(currentUserEmail);

  if (!isAuthorized) {
    console.warn(`[Admin Auth Check] Unauthorized access attempt by: ${currentUserEmail}`);
    redirect('/login');
  }

  // Step 2: Ensure database schema is initialized, then fetch dynamic items & categories
  await ensureDatabaseSchema().catch(() => null);

  let existingItems: any[] = [];
  let availableCategories: any[] = [
    { id: 'default', name: 'Wedding', slug: 'wedding', createdAt: new Date().toISOString() },
  ];

  try {
    const [rawItems, categories] = await Promise.all([
      prisma.portfolioItem
        .findMany({
          include: { category: true },
          orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
        })
        .catch((err) => {
          console.warn('[Prisma Portfolio Query Fallback in Admin Page]:', err);
          return [];
        }),
      prisma.category
        .findMany({
          orderBy: { name: 'asc' },
        })
        .catch((err) => {
          console.warn('[Prisma Category Query Fallback in Admin Page]:', err);
          return [];
        }),
    ]);

    if (categories && Array.isArray(categories) && categories.length > 0) {
      availableCategories = categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl || null,
        createdAt:
          c.createdAt instanceof Date
            ? c.createdAt.toISOString()
            : c.createdAt
            ? new Date(c.createdAt).toISOString()
            : new Date().toISOString(),
      }));
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
        createdAt:
          item.createdAt instanceof Date
            ? item.createdAt.toISOString()
            : item.createdAt
            ? new Date(item.createdAt).toISOString()
            : new Date().toISOString(),
        updatedAt:
          item.updatedAt instanceof Date
            ? item.updatedAt.toISOString()
            : item.updatedAt
            ? new Date(item.updatedAt).toISOString()
            : new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.warn('[Prisma Global Query Catch in Admin Page]:', error);
  }

  return (
    <AdminDashboardShell
      userEmail={user.email || 'Admin'}
      initialItems={existingItems}
      initialCategories={availableCategories}
    />
  );
}
