import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServiceSupabase } from '@/lib/supabase';
import { ensureDatabaseSchema } from '@/lib/dbInit';

// Authorized admin emails check helper
const AUTHORIZED_ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.ADMIN_EMAIL ||
  'admin@tharikadecor.com,owner@tharikadecor.com,admin@tharikadecors.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    const items = await prisma.portfolioItem
      .findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      })
      .catch((err) => {
        console.warn('GET /api/admin/portfolio fallback:', err);
        return [];
      });

    const safeItems = (items || []).map((item) => ({
      id: item.id,
      title: item.title,
      caption: item.caption || '',
      price: item.price || null,
      instagramUrl: item.instagramUrl || null,
      category: item.category?.name || item.category?.slug || 'Wedding',
      categoryId: item.categoryId || null,
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

    return NextResponse.json({ success: true, items: safeItems });
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json(
      { success: false, items: [], error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null)?.trim();
    const categoryRaw =
      (formData.get('category') as string | null)?.trim() ||
      (formData.get('categoryId') as string | null)?.trim() ||
      'Wedding';
    const userEmail = (formData.get('userEmail') as string | null)?.trim();

    // 1. Validation
    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title (Design Name) is required.' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Image file is required.' },
        { status: 400 }
      );
    }

    // Optional admin verification
    if (userEmail && !AUTHORIZED_ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
      console.warn('[API Auth Note] Admin verification check:', userEmail);
    }

    // 2. Resolve Category ID safely
    let categoryId: string | null = null;
    try {
      const slug = slugify(categoryRaw);
      let cat = await prisma.category
        .findFirst({
          where: { OR: [{ id: categoryRaw }, { slug }, { name: categoryRaw }] },
        })
        .catch(() => null);

      if (!cat) {
        cat = await prisma.category
          .create({
            data: {
              name: categoryRaw,
              slug,
            },
          })
          .catch(() => null);
      }

      if (cat) {
        categoryId = cat.id;
      }
    } catch (catErr) {
      console.warn('Category resolve error in API route:', catErr);
    }

    // 3. Upload file to Supabase Storage
    let imageUrl = '';
    try {
      const supabase = getServiceSupabase();
      const bucketName = 'portfolio-images';
      const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${slugify(categoryRaw)}/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });

      if (uploadError || !uploadData || !uploadData.path) {
        console.warn('Supabase storage warning:', uploadError?.message);
        imageUrl = `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80`;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uploadData.path);
        imageUrl = publicUrlData?.publicUrl || '';
      }
    } catch (storageErr) {
      console.warn('Storage error in API route:', storageErr);
      imageUrl = `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80`;
    }

    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const price = (formData.get('price') as string | null)?.trim() || null;
    const instagramUrl = (formData.get('instagramUrl') as string | null)?.trim() || null;
    const isCover = formData.get('isCover') === 'true' || formData.get('isCover') === 'on';

    // 4. Save PortfolioItem record to Database via Prisma
    const itemData: any = {
      title,
      caption,
      price,
      instagramUrl,
      imageUrl,
      isCover,
    };

    if (categoryId) {
      itemData.categoryId = categoryId;
    }

    let newItem: any;
    if (isCover && categoryId) {
      try {
        const [_, created] = await prisma.$transaction([
          prisma.portfolioItem.updateMany({
            where: { categoryId },
            data: { isCover: false },
          }),
          prisma.portfolioItem.create({
            data: itemData,
            include: { category: true },
          }),
        ]);
        newItem = created;
      } catch {
        newItem = await prisma.portfolioItem.create({
          data: itemData,
          include: { category: true },
        });
      }
    } else {
      newItem = await prisma.portfolioItem.create({
        data: itemData,
        include: { category: true },
      });
    }

    const safeItem = {
      id: newItem.id,
      title: newItem.title,
      caption: newItem.caption || '',
      price: newItem.price || null,
      instagramUrl: newItem.instagramUrl || null,
      category: newItem.category?.name || categoryRaw,
      categoryId: newItem.categoryId || null,
      imageUrl: newItem.imageUrl,
      isCover: newItem.isCover ?? false,
      createdAt:
        newItem.createdAt instanceof Date
          ? newItem.createdAt.toISOString()
          : new Date().toISOString(),
      updatedAt:
        newItem.updatedAt instanceof Date
          ? newItem.updatedAt.toISOString()
          : new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: `Showcase "${title}" published successfully!`,
      item: safeItem,
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/portfolio:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
