import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Admin email authorization check
  const rawAdminEmails = (
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    'admin@tharikadecors.com,admin@tharikadecor.com,owner@tharikadecor.com'
  )
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const currentUserEmail = (user.email || '').trim().toLowerCase();

  const isAuthorized =
    process.env.NODE_ENV === 'development' ||
    rawAdminEmails.length === 0 ||
    rawAdminEmails.includes(currentUserEmail);

  if (!isAuthorized) {
    redirect('/login');
  }

  return <>{children}</>;
}
