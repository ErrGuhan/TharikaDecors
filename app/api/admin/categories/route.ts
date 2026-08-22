import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServiceSupabase } from '@/lib/supabase';
import { ensureDatabaseSchema } from '@/lib/dbInit';

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
 * Upload category image helper to Supabase storage with base64 fallback
 */
async function processCategoryImageUpload(file: File, categorySlug: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = file.type || 'image/jpeg';
  const base64DataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  try {
    const supabase = getServiceSupabase();
    const bucketName = 'portfolio-images';
    const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/categories/${slugify(categorySlug)}/${fileName}`;

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
      return publicUrlData?.publicUrl || base64DataUrl;
    }
    return base64DataUrl;
  } catch {
    return base64DataUrl;
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    const categories = await prisma.category
      .findMany({
        include: {
          _count: {
            select: { items: true },
          },
        },
        orderBy: { name: 'asc' },
      })
      .catch(() => []);

    const safeCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl || null,
      createdAt:
        cat.createdAt instanceof Date
          ? cat.createdAt.toISOString()
          : new Date().toISOString(),
      _count: cat._count,
    }));

    return NextResponse.json({ success: true, categories: safeCategories });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    let name = '';
    let slug = '';
    let imageUrl: string | null = null;
    let file: File | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = (formData.get('name') as string | null)?.trim() || '';
      slug = (formData.get('slug') as string | null)?.trim() || '';
      imageUrl = (formData.get('imageUrl') as string | null)?.trim() || null;
      file = formData.get('file') as File | null;
    } else {
      const body = await req.json().catch(() => ({}));
      name = (body.name || '').trim();
      slug = (body.slug || '').trim();
      imageUrl = (body.imageUrl || '').trim() || null;
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required.' },
        { status: 400 }
      );
    }

    const finalSlug = (slug || slugify(name)).trim().toLowerCase();

    // Process image file upload if provided
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      imageUrl = await processCategoryImageUpload(file, finalSlug);
    }

    const existing = await prisma.category
      .findFirst({
        where: { OR: [{ slug: finalSlug }, { name }] },
      })
      .catch(() => null);

    if (existing) {
      // If category exists and imageUrl was provided, update it
      if (imageUrl && imageUrl !== existing.imageUrl) {
        const updated = await prisma.category.update({
          where: { id: existing.id },
          data: { imageUrl },
        });
        return NextResponse.json({
          success: true,
          message: `Category "${updated.name}" updated with new image!`,
          category: {
            id: updated.id,
            name: updated.name,
            slug: updated.slug,
            imageUrl: updated.imageUrl || null,
            createdAt:
              updated.createdAt instanceof Date
                ? updated.createdAt.toISOString()
                : new Date().toISOString(),
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Category "${existing.name}" already exists.`,
        category: {
          id: existing.id,
          name: existing.name,
          slug: existing.slug,
          imageUrl: existing.imageUrl || null,
          createdAt:
            existing.createdAt instanceof Date
              ? existing.createdAt.toISOString()
              : new Date().toISOString(),
        },
      });
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Category "${newCategory.name}" created successfully!`,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        imageUrl: newCategory.imageUrl || null,
        createdAt:
          newCategory.createdAt instanceof Date
            ? newCategory.createdAt.toISOString()
            : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create category.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureDatabaseSchema();

    let id = '';
    let name = '';
    let slug = '';
    let imageUrl: string | null = null;
    let removeImage = false;
    let file: File | null = null;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      id = (formData.get('id') as string | null)?.trim() || '';
      name = (formData.get('name') as string | null)?.trim() || '';
      slug = (formData.get('slug') as string | null)?.trim() || '';
      imageUrl = (formData.get('imageUrl') as string | null)?.trim() || null;
      removeImage = formData.get('removeImage') === 'true';
      file = formData.get('file') as File | null;
    } else {
      const body = await req.json().catch(() => ({}));
      id = (body.id || '').trim();
      name = (body.name || '').trim();
      slug = (body.slug || '').trim();
      imageUrl = (body.imageUrl || '').trim() || null;
      removeImage = body.removeImage === true;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Category not found.' },
        { status: 404 }
      );
    }

    const finalName = name || existing.name;
    const finalSlug = slug ? slugify(slug) : (name ? slugify(name) : existing.slug);

    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      imageUrl = await processCategoryImageUpload(file, finalSlug);
    }

    const updateData: { name: string; slug: string; imageUrl?: string | null } = {
      name: finalName,
      slug: finalSlug,
    };

    if (removeImage) {
      updateData.imageUrl = null;
    } else if (imageUrl !== null) {
      updateData.imageUrl = imageUrl;
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Category "${updated.name}" updated successfully!`,
      category: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        imageUrl: updated.imageUrl || null,
        createdAt:
          updated.createdAt instanceof Date
            ? updated.createdAt.toISOString()
            : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update category.' },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json(
        { success: false, error: 'Category ID is required.' },
        { status: 400 }
      );
    }

    const deleted = await prisma.category.delete({
      where: { id },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
      category: deleted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
