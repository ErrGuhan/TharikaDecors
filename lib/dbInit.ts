import { prisma } from './prisma';

let isDbReady = false;

/**
 * Self-healing database initializer:
 * 1. Checks and auto-creates missing `categories` & `portfolio_items` tables.
 * 2. Normalizes column names to standard camelCase identifiers expected by Prisma.
 * 3. Ensures high-performance indexes exist.
 * 4. Seeds essential default categories.
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
        "imageUrl" TEXT,
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

    // 3. Normalize lowercase column names to camelCase if created via unquoted SQL
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='portfolio_items' AND column_name='imageurl') THEN
          ALTER TABLE public.portfolio_items RENAME COLUMN imageurl TO "imageUrl";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='portfolio_items' AND column_name='iscover') THEN
          ALTER TABLE public.portfolio_items RENAME COLUMN iscover TO "isCover";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='portfolio_items' AND column_name='categoryid') THEN
          ALTER TABLE public.portfolio_items RENAME COLUMN categoryid TO "categoryId";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='portfolio_items' AND column_name='instagramurl') THEN
          ALTER TABLE public.portfolio_items RENAME COLUMN instagramurl TO "instagramUrl";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='portfolio_items' AND column_name='createdat') THEN
          ALTER TABLE public.portfolio_items RENAME COLUMN createdat TO "createdAt";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='portfolio_items' AND column_name='updatedat') THEN
          ALTER TABLE public.portfolio_items RENAME COLUMN updatedat TO "updatedAt";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='createdat') THEN
          ALTER TABLE public.categories RENAME COLUMN createdat TO "createdAt";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='imageurl') THEN
          ALTER TABLE public.categories RENAME COLUMN imageurl TO "imageUrl";
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='categories' AND column_name='imageUrl') THEN
          ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
        END IF;
      END $$;
    `).catch(() => null);

    // 4. Create high-performance query indexes inside idempotent block
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        BEGIN
          CREATE INDEX IF NOT EXISTS "categories_name_idx" ON public.categories("name");
        EXCEPTION WHEN duplicate_table OR unique_violation THEN NULL;
        END;
        BEGIN
          CREATE INDEX IF NOT EXISTS "categories_createdAt_idx" ON public.categories("createdAt" DESC);
        EXCEPTION WHEN duplicate_table OR unique_violation THEN NULL;
        END;
        BEGIN
          CREATE INDEX IF NOT EXISTS "portfolio_items_categoryId_idx" ON public.portfolio_items("categoryId");
        EXCEPTION WHEN duplicate_table OR unique_violation THEN NULL;
        END;
        BEGIN
          CREATE INDEX IF NOT EXISTS "portfolio_items_isCover_idx" ON public.portfolio_items("isCover");
        EXCEPTION WHEN duplicate_table OR unique_violation THEN NULL;
        END;
        BEGIN
          CREATE INDEX IF NOT EXISTS "portfolio_items_createdAt_idx" ON public.portfolio_items("createdAt" DESC);
        EXCEPTION WHEN duplicate_table OR unique_violation THEN NULL;
        END;
        BEGIN
          CREATE INDEX IF NOT EXISTS "portfolio_items_cat_cover_created_idx" ON public.portfolio_items("categoryId", "isCover", "createdAt" DESC);
        EXCEPTION WHEN duplicate_table OR unique_violation THEN NULL;
        END;
      END $$;
    `).catch(() => null);

    // 5. Seed initial default categories if table is empty
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
    console.warn('[DB Auto-Init Notice]:', err);
    return false;
  }
}
