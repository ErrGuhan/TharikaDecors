import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import UploadForm from '@/components/UploadForm';
import { ShieldCheck, Database, Layers, Sparkles, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const AUTHORIZED_ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || 'admin@tharikadecors.com'
).toLowerCase();

export default async function AdminDashboardPage() {
  // Step 1: Server-Side Authentication Check
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // In development, allow bypass if ADMIN_DEV_BYPASS=true or if user matches
  const isAuthorized =
    (user && user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL) ||
    process.env.NODE_ENV === 'development';

  // Strict check: if user is not logged in or email does not match, redirect to /login
  if (!isAuthorized) {
    redirect('/login');
  }

  // Fetch existing items from Prisma PostgreSQL
  let existingItems: any[] = [];
  try {
    existingItems = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.warn('Prisma portfolio fetch fallback in admin page:', error);
  }

  return (
    <div className="min-h-screen bg-tharika-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Admin Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-tharika-blue/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-tharika-green mb-1">
              <ShieldCheck className="w-4 h-4 text-tharika-green" />
              <span>Admin Dashboard</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-tharika-blue tracking-tight">
              Tharika Decors Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Authorized admin: <span className="font-semibold text-tharika-blue">{user?.email || AUTHORIZED_ADMIN_EMAIL}</span>
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

        {/* Admin Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Step 2: The Admin UI Form (<UploadForm />) */}
          <div className="lg:col-span-5">
            <UploadForm />
          </div>

          {/* Right Column: Database Records Showcase */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-tharika-blue/10 p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-tharika-blue" />
                  <h2 className="font-heading text-xl text-tharika-blue font-semibold">
                    Published Records (Prisma DB)
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-tharika-blue/10 text-tharika-blue">
                  {existingItems.length} Items
                </span>
              </div>

              {existingItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No records found in PostgreSQL yet.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submit the form on the left to upload your first decor showcase to Supabase Storage.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {existingItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex flex-col"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-black/70 text-white backdrop-blur-sm uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-tharika-blue line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(item.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
