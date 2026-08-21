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

/**
 * Helper to resolve category ID safely
 */
async function resolveCategoryId(categoryIdentifier: string): Promise<string | null> {
  const trimmed = (categoryIdentifier || '').trim();
  if (!trimmed) return null;

  if (trimmed === 'default' || trimmed.toLowerCase() === 'wedding') {
    let weddingCat = await prisma.category
      .findFirst({
        where: { OR: [{ slug: 'wedding' }, { slug: 'weddings' }, { name: 'Wedding' }] },
      })
      .catch(() => null);

    if (!weddingCat) {
      weddingCat = await prisma.category
        .create({
          data: { name: 'Weddings', slug: 'weddings' },
        })
        .catch(() => null);
    }
    if (weddingCat) return weddingCat.id;
  }

  const slug = slugify(trimmed);

  let cat = await prisma.category
    .findFirst({
      where: { OR: [{ id: trimmed }, { slug }, { name: { equals: trimmed, mode: 'insensitive' } }] },
    })
    .catch(() => null);

  if (cat) return cat.id;

  const name = trimmed
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  try {
    const created = await prisma.category.create({
      data: { name, slug },
    });
    return created.id;
  } catch {
    const anyCat = await prisma.category.findFirst().catch(() => null);
    return anyCat ? anyCat.id : null;
  }
}

/**
 * GET: Fetch all portfolio items
 */
export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    const items = await prisma.portfolioItem
      .findMany({
        include: { category: true },
        orderBy: [{ isCover: 'desc' }, { createdAt: 'desc' }],
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

/**
 * POST: Create a new portfolio item OR set cover photo
 */
export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    // Check if JSON request (e.g. setCover or delete action)
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      const { action, id, category } = body;

      if (action === 'setCover' && id) {
        const categoryId = await resolveCategoryId(category || 'Wedding');
        let updatedItem: any;

        if (categoryId) {
          try {
            const [_, item] = await prisma.$transaction([
              prisma.portfolioItem.updateMany({
                where: { categoryId },
                data: { isCover: false },
              }),
              prisma.portfolioItem.update({
                where: { id },
                data: { isCover: true },
                include: { category: true },
              }),
            ]);
            updatedItem = item;
          } catch {
            updatedItem = await prisma.portfolioItem.update({
              where: { id },
              data: { isCover: true },
              include: { category: true },
            });
          }
        } else {
          updatedItem = await prisma.portfolioItem.update({
            where: { id },
            data: { isCover: true },
            include: { category: true },
          });
        }

        return NextResponse.json({
          success: true,
          message: `"${updatedItem?.title || 'Showcase'}" is now the primary cover photo!`,
          item: updatedItem,
        });
      }

      if (action === 'delete' && id) {
        const deleted = await prisma.portfolioItem.delete({ where: { id } }).catch(() => null);
        return NextResponse.json({
          success: true,
          message: 'Showcase deleted successfully',
          item: deleted,
        });
      }
    }

    // Otherwise standard multipart/form-data upload
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null)?.trim();
    const categoryRaw =
      (formData.get('category') as string | null)?.trim() ||
      (formData.get('categoryId') as string | null)?.trim() ||
      'Wedding';

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

    const categoryId = await resolveCategoryId(categoryRaw);

    // Save exact uploaded image data
    let imageUrl = '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

    try {
      const supabase = getServiceSupabase();
      const bucketName = 'portfolio-images';
      const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `uploads/${slugify(categoryRaw)}/${fileName}`;

      await supabase.storage.createBucket(bucketName, { public: true }).catch(() => null);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (!uploadError && uploadData && uploadData.path) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uploadData.path);
        imageUrl = publicUrlData?.publicUrl || base64DataUrl;
      } else {
        imageUrl = base64DataUrl;
      }
    } catch {
      imageUrl = base64DataUrl;
    }

    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const price = (formData.get('price') as string | null)?.trim() || null;
    const instagramUrl = (formData.get('instagramUrl') as string | null)?.trim() || null;
    const isCover = formData.get('isCover') === 'true' || formData.get('isCover') === 'on';

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
    console.error('API Error in /api/admin/portfolio POST:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT / PATCH: Update an existing portfolio item
 */
export async function PUT(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    const formData = await req.formData();
    const id = (formData.get('id') as string | null)?.trim();
    const title = (formData.get('title') as string | null)?.trim();
    const categoryRaw =
      (formData.get('category') as string | null)?.trim() ||
      (formData.get('categoryId') as string | null)?.trim();
    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const isCoverRaw = formData.get('isCover');
    const isCover = isCoverRaw !== null ? isCoverRaw === 'true' || isCoverRaw === 'on' : undefined;
    const priceRaw = formData.get('price') as string | null;
    const instagramUrlRaw = formData.get('instagramUrl') as string | null;
    const file = formData.get('file') as File | null;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required.' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 });
    }

    const updateData: any = {
      title,
      caption,
    };

    if (formData.has('price')) {
      updateData.price = priceRaw?.trim() || null;
    }
    if (formData.has('instagramUrl')) {
      updateData.instagramUrl = instagramUrlRaw?.trim() || null;
    }

    let categoryId: string | null = null;
    if (categoryRaw) {
      categoryId = await resolveCategoryId(categoryRaw);
      if (categoryId) {
        updateData.categoryId = categoryId;
      }
    }

    if (isCover !== undefined) {
      updateData.isCover = isCover;
    }

    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = file.type || 'image/jpeg';
      const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

      try {
        const supabase = getServiceSupabase();
        const bucketName = 'portfolio-images';
        const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        await supabase.storage.createBucket(bucketName, { public: true }).catch(() => null);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError && uploadData && uploadData.path) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(uploadData.path);
          updateData.imageUrl = publicUrlData?.publicUrl || base64DataUrl;
        } else {
          updateData.imageUrl = base64DataUrl;
        }
      } catch {
        updateData.imageUrl = base64DataUrl;
      }
    }

    let updatedItem: any;
    if (isCover === true && categoryId) {
      try {
        const [_, item] = await prisma.$transaction([
          prisma.portfolioItem.updateMany({
            where: { categoryId, NOT: { id } },
            data: { isCover: false },
          }),
          prisma.portfolioItem.update({
            where: { id },
            data: updateData,
            include: { category: true },
          }),
        ]);
        updatedItem = item;
      } catch {
        updatedItem = await prisma.portfolioItem.update({
          where: { id },
          data: updateData,
          include: { category: true },
        });
      }
    } else {
      updatedItem = await prisma.portfolioItem.update({
        where: { id },
        data: updateData,
        include: { category: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Showcase updated successfully!',
      item: {
        ...updatedItem,
        category: updatedItem.category?.name || categoryRaw,
        createdAt:
          updatedItem.createdAt instanceof Date
            ? updatedItem.createdAt.toISOString()
            : new Date().toISOString(),
        updatedAt:
          updatedItem.updatedAt instanceof Date
            ? updatedItem.updatedAt.toISOString()
            : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/portfolio PUT:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update showcase.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Delete a portfolio item by ID
 */
export async function DELETE(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Item ID is required.' }, { status: 400 });
    }

    const deleted = await prisma.portfolioItem.delete({
      where: { id },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Showcase item deleted successfully.',
      item: deleted,
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/portfolio DELETE:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete portfolio item.' },
      { status: 500 }
    );
  }
}
