import { prisma } from './prisma';

let isDbReady = false;

/**
 * Self-healing database initializer: Automatically creates missing categories
 * and portfolio_items tables with all constraints and indexes in Supabase PostgreSQL
 * if they have not been migrated yet.
 */
export async function ensureDatabaseSchema(): Promise<boolean> {
  if (isDbReady) return true;

  try {
    // 1. Create categories table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.categories (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create portfolio_items table if not exists
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.portfolio_items (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title TEXT NOT NULL,
        caption TEXT DEFAULT '',
        price TEXT,
        "instagramUrl" TEXT,
        "categoryId" TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
        "imageUrl" TEXT NOT NULL,
        "isCover" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create high-performance query indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "portfolio_items_categoryId_idx" ON public.portfolio_items("categoryId");
    `).catch(() => null);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "portfolio_items_createdAt_idx" ON public.portfolio_items("createdAt" DESC);
    `).catch(() => null);

    // 4. Seed initial default categories if table is empty
    await prisma.$executeRawUnsafe(`
      INSERT INTO public.categories (id, name, slug)
      VALUES 
        (gen_random_uuid()::text, 'Weddings', 'weddings'),
        (gen_random_uuid()::text, 'Baby Showers', 'baby-showers'),
        (gen_random_uuid()::text, 'Ear Piercing', 'ear-piercing')
      ON CONFLICT (slug) DO NOTHING;
    `).catch(() => null);

    isDbReady = true;
    return true;
  } catch (err) {
    console.warn('[DB Auto-Init Note]:', err);
    return false;
  }
}
