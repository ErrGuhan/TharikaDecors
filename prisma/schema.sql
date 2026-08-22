-- =================================================================
-- Tharika Decors: Supabase PostgreSQL Schema & Storage Setup
-- Run this in your Supabase Project > SQL Editor
-- =================================================================

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Portfolio Items Table
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

-- 3. Column Alignment (Ensures Prisma camelCase identifiers match)
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

-- 4. Create High-Performance Query Indexes
CREATE INDEX IF NOT EXISTS "categories_name_idx" ON public.categories("name");
CREATE INDEX IF NOT EXISTS "categories_createdAt_idx" ON public.categories("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "portfolio_items_categoryId_idx" ON public.portfolio_items("categoryId");
CREATE INDEX IF NOT EXISTS "portfolio_items_isCover_idx" ON public.portfolio_items("isCover");
CREATE INDEX IF NOT EXISTS "portfolio_items_createdAt_idx" ON public.portfolio_items("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "portfolio_items_cat_cover_created_idx" ON public.portfolio_items("categoryId", "isCover", "createdAt" DESC);

-- 5. Seed Default Categories
INSERT INTO public.categories (id, name, slug)
VALUES 
    (gen_random_uuid()::text, 'Weddings', 'weddings'),
    (gen_random_uuid()::text, 'Baby Showers', 'baby-showers'),
    (gen_random_uuid()::text, 'Ear Piercing', 'ear-piercing')
ON CONFLICT (slug) DO NOTHING;

-- 6. Ensure 'portfolio-images' Supabase Storage Bucket Exists and is Public
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Storage Security Policies for Public Display & Uploads
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Access to Portfolio Images'
    ) THEN
        CREATE POLICY "Public Access to Portfolio Images"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'portfolio-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Uploads to Portfolio Images'
    ) THEN
        CREATE POLICY "Allow Uploads to Portfolio Images"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'portfolio-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Updates to Portfolio Images'
    ) THEN
        CREATE POLICY "Allow Updates to Portfolio Images"
        ON storage.objects FOR UPDATE
        USING (bucket_id = 'portfolio-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Allow Deletions from Portfolio Images'
    ) THEN
        CREATE POLICY "Allow Deletions from Portfolio Images"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'portfolio-images');
    END IF;
END $$;
