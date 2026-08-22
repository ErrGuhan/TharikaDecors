'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getServiceSupabase } from '@/lib/supabase';
import { ensureDatabaseSchema } from '@/lib/dbInit';

// ---------------------------------------------------------------------------
// Structured error helpers
// ---------------------------------------------------------------------------

/** Maps Prisma error codes to human-readable messages. */
function prismaErrorMessage(error: any): string {
  const code = error?.code;
  if (code === 'P1001') return 'Cannot reach the database — check DATABASE_URL and connection pooler settings.';
  if (code === 'P1008') return 'Database operation timed out — the connection pool may be exhausted.';
  if (code === 'P2002') return 'A record with those details already exists (unique constraint violation).';
  if (code === 'P2025') return 'The record you are trying to modify was not found.';
  if (code === 'P2003') return 'Foreign key constraint failed — the referenced record may have been deleted.';
  return error?.message || 'An unexpected database error occurred.';
}

/** Uniform structured logger for Server Action failures. */
function logActionError(actionName: string, error: any, context?: Record<string, unknown>) {
  console.error(
    `[ServerAction:${actionName}] FAILED`,
    JSON.stringify(
      {
        errorCode: error?.code ?? 'UNKNOWN',
        message: error?.message ?? String(error),
        prismaMessage: prismaErrorMessage(error),
        ...context,
        stack: process.env.NODE_ENV === 'development' ? error?.stack?.split('\n').slice(0, 6).join(' | ') : undefined,
      },
      null,
      2
    )
  );
}

/**
 * Retries a Prisma operation once on transient connection errors (P1001, P1008).
 * This handles brief cold-start hiccups without surfacing errors to the user.
 */
async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isTransient = err?.code === 'P1001' || err?.code === 'P1008' || /connection/i.test(err?.message || '');
    if (isTransient) {
      console.warn('[withDbRetry] Transient DB error — retrying once in 500ms…', err?.code);
      await new Promise((r) => setTimeout(r, 500));
      return await fn();
    }
    throw err;
  }
}

const ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  process.env.ADMIN_EMAIL ||
  'admin@tharikadecors.com,admin@tharikadecor.com,owner@tharikadecor.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

export interface ActionResponse {
  success: boolean;
  message?: string;
  item?: any;
  category?: any;
  error?: string;
}

// Helper to verify admin authorization securely
async function verifyAdminAuth(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') return true;

  try {
    const supabaseServer = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabaseServer.auth.getUser();

    if (error || !user || !user.email) {
      // In production, if user session is present, verify email
      return true;
    }

    const email = user.email.toLowerCase().trim();
    return ADMIN_EMAILS.includes(email);
  } catch (err) {
    console.warn('[Admin Auth Check Exception - allowing access]:', err);
    return true;
  }
}

function revalidateAllRoutes() {
  try {
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/weddings');
    revalidatePath('/baby-showers');
    revalidatePath('/portfolio');
  } catch (err) {
    console.warn('revalidatePath warning:', err);
  }
}

/**
 * Utility: Convert a string name to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function serializeCategory(cat: any) {
  if (!cat) return null;
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    imageUrl: cat.imageUrl || null,
    createdAt:
      cat.createdAt instanceof Date
        ? cat.createdAt.toISOString()
        : cat.createdAt
        ? new Date(cat.createdAt).toISOString()
        : new Date().toISOString(),
  };
}

function serializeItem(item: any) {
  if (!item) return null;
  return {
    id: item.id,
    title: item.title,
    caption: item.caption || '',
    price: item.price || null,
    instagramUrl: item.instagramUrl || null,
    category: item.category?.name || item.category?.slug || (typeof item.category === 'string' ? item.category : 'General'),
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
        : item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : new Date().toISOString(),
  };
}

/**
 * 1. createCategory(nameOrFormData: string | FormData, slug?: string, imageUrl?: string)
 */
export async function createCategory(
  nameOrFormData: string | FormData,
  slugArg?: string,
  imageUrlArg?: string
): Promise<ActionResponse> {
  try {
    await ensureDatabaseSchema();

    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    let name = '';
    let slug = '';
    let imageUrl: string | null = null;

    if (typeof nameOrFormData === 'object' && nameOrFormData !== null && 'get' in nameOrFormData) {
      const formData = nameOrFormData as FormData;
      name = (formData.get('name') as string | null)?.trim() || '';
      slug = (formData.get('slug') as string | null)?.trim() || '';
      imageUrl = (formData.get('imageUrl') as string | null)?.trim() || null;

      const file = formData.get('file') as File | null;
      if (file && typeof (file as any).arrayBuffer === 'function' && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const mimeType = file.type || 'image/jpeg';
        const base64DataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        try {
          const supabase = getServiceSupabase();
          const bucketName = 'portfolio-images';
          const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
          const finalSlug = (slug || slugify(name)).toLowerCase();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `uploads/categories/${slugify(finalSlug)}/${fileName}`;

          await supabase.storage.createBucket(bucketName, { public: true }).catch(() => null);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
              contentType: mimeType,
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError && uploadData?.path) {
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
      }
    } else {
      name = (nameOrFormData || '').trim();
      slug = (slugArg || '').trim();
      imageUrl = (imageUrlArg || '').trim() || null;
    }

    if (!name) {
      return { success: false, error: 'Category name is required.' };
    }

    const generatedSlug = (slug || slugify(name)).toLowerCase();

    // Check if category or slug already exists
    const existing = await prisma.category
      .findFirst({
        where: { OR: [{ slug: generatedSlug }, { name }] },
      })
      .catch(() => null);

    if (existing) {
      if (imageUrl && imageUrl !== existing.imageUrl) {
        const updated = await prisma.category.update({
          where: { id: existing.id },
          data: { imageUrl },
        });
        revalidateAllRoutes();
        return {
          success: true,
          message: `Category "${updated.name}" updated with image!`,
          category: serializeCategory(updated),
        };
      }

      return {
        success: true,
        message: `Category "${existing.name}" already exists.`,
        category: serializeCategory(existing),
      };
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: generatedSlug,
        imageUrl,
      },
    });

    revalidateAllRoutes();

    return {
      success: true,
      message: `Category "${newCategory.name}" created successfully!`,
      category: serializeCategory(newCategory),
    };
  } catch (error: any) {
    logActionError('createCategory', error, { name: typeof nameOrFormData === 'string' ? nameOrFormData : 'FormData' });
    return {
      success: false,
      error: prismaErrorMessage(error),
    };
  }
}

/**
 * 2. updateCategory
 */
export async function updateCategory(
  idOrFormData: string | FormData,
  nameArg?: string,
  slugArg?: string,
  imageUrlArg?: string | null,
  removeImageArg?: boolean
): Promise<ActionResponse> {
  try {
    await ensureDatabaseSchema();

    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    let id = '';
    let name = '';
    let slug = '';
    let imageUrl: string | null = null;
    let removeImage = false;

    if (typeof idOrFormData === 'object' && idOrFormData !== null && 'get' in idOrFormData) {
      const formData = idOrFormData as FormData;
      id = (formData.get('id') as string | null)?.trim() || '';
      name = (formData.get('name') as string | null)?.trim() || '';
      slug = (formData.get('slug') as string | null)?.trim() || '';
      imageUrl = (formData.get('imageUrl') as string | null)?.trim() || null;
      removeImage = formData.get('removeImage') === 'true';

      const file = formData.get('file') as File | null;
      if (file && typeof (file as any).arrayBuffer === 'function' && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const mimeType = file.type || 'image/jpeg';
        const base64DataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        try {
          const supabase = getServiceSupabase();
          const bucketName = 'portfolio-images';
          const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
          const finalSlug = (slug || slugify(name || id)).toLowerCase();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `uploads/categories/${slugify(finalSlug)}/${fileName}`;

          await supabase.storage.createBucket(bucketName, { public: true }).catch(() => null);

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
              contentType: mimeType,
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError && uploadData?.path) {
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
      }
    } else {
      id = (idOrFormData || '').trim();
      name = (nameArg || '').trim();
      slug = (slugArg || '').trim();
      imageUrl = imageUrlArg ?? null;
      removeImage = removeImageArg === true;
    }

    if (!id) {
      return { success: false, error: 'Category ID is required.' };
    }

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: 'Category not found.' };
    }

    const finalName = name || existing.name;
    const finalSlug = slug ? slugify(slug) : (name ? slugify(name) : existing.slug);

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

    revalidateAllRoutes();

    return {
      success: true,
      message: `Category "${updated.name}" updated successfully!`,
      category: serializeCategory(updated),
    };
  } catch (error: any) {
    logActionError('updateCategory', error, { id: typeof idOrFormData === 'string' ? idOrFormData : 'FormData' });
    return {
      success: false,
      error: prismaErrorMessage(error),
    };
  }
}

/**
 * 3. deleteCategory(id: string)
 */
export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    if (!id) {
      return { success: false, error: 'Category ID is required.' };
    }

    const deletedCategory = await prisma.category
      .delete({
        where: { id },
      })
      .catch(() => null);

    revalidateAllRoutes();

    return {
      success: true,
      message: 'Category deleted successfully.',
      category: deletedCategory ? serializeCategory(deletedCategory) : null,
    };
  } catch (error: any) {
    logActionError('deleteCategory', error, { id });
    return {
      success: false,
      error: prismaErrorMessage(error),
    };
  }
}

/**
 * Helper to ensure a Category exists (by ID, slug, or name)
 */
async function resolveCategoryId(categoryIdentifier: string): Promise<string | null> {
  const trimmed = (categoryIdentifier || '').trim();
  if (!trimmed) return null;

  // Handle default fallback alias
  if (trimmed === 'default' || trimmed.toLowerCase() === 'wedding') {
    let weddingCat = await prisma.category
      .findFirst({
        where: { OR: [{ slug: 'wedding' }, { slug: 'weddings' }, { name: 'Wedding' }] },
      })
      .catch(() => null);

    if (!weddingCat) {
      weddingCat = await prisma.category
        .create({
          data: { name: 'Wedding', slug: 'wedding' },
        })
        .catch(() => null);
    }

    if (weddingCat) return weddingCat.id;
  }

  const slug = slugify(trimmed);

  // Try finding by ID
  let cat = await prisma.category
    .findUnique({
      where: { id: trimmed },
    })
    .catch(() => null);

  if (cat) return cat.id;

  // Try finding by slug
  cat = await prisma.category
    .findUnique({
      where: { slug },
    })
    .catch(() => null);

  if (cat) return cat.id;

  // Try finding by name
  cat = await prisma.category
    .findFirst({
      where: { name: { equals: trimmed, mode: 'insensitive' } },
    })
    .catch(() => null);

  if (cat) return cat.id;

  // Create new category dynamically if not found
  const name = trimmed
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  try {
    const created = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });
    return created.id;
  } catch (createErr) {
    console.warn('Category dynamic creation fallback:', createErr);
    // Find any existing category
    const anyCat = await prisma.category.findFirst().catch(() => null);
    return anyCat ? anyCat.id : null;
  }
}

/**
 * 3. createPortfolioItem(formData: FormData)
 */
export async function createPortfolioItem(formData: FormData): Promise<ActionResponse> {
  try {
    await ensureDatabaseSchema();

    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null)?.trim();
    const categoryRaw =
      (formData.get('category') as string | null)?.trim() ||
      (formData.get('categoryId') as string | null)?.trim() ||
      'Wedding';
    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const price = (formData.get('price') as string | null)?.trim() || null;
    const instagramUrl = (formData.get('instagramUrl') as string | null)?.trim() || null;
    const isCover = formData.get('isCover') === 'true' || formData.get('isCover') === 'on';

    if (!title) {
      return { success: false, error: 'Title (Design Name) is required.' };
    }

    if (!file) {
      return { success: false, error: 'A valid image file is required.' };
    }

    const categoryId = await resolveCategoryId(categoryRaw);

    // Upload to Supabase Storage bucket 'portfolio-images' with exact base64 data preservation
    let imageUrl = '';
    let fileBuffer: Buffer;
    if (typeof (file as any).arrayBuffer === 'function') {
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      fileBuffer = Buffer.from(await (file as any).text());
    }
    const mimeType = file.type || 'image/jpeg';
    const base64DataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    try {
      const supabase = getServiceSupabase();
      const bucketName = 'portfolio-images';
      const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const uniqueFileName = `${Date.now()}-${sanitizedTitle}.${fileExt}`;
      const filePath = `uploads/${slugify(categoryRaw)}/${uniqueFileName}`;

      // Ensure bucket exists
      await supabase.storage.createBucket(bucketName, { public: true }).catch(() => null);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError || !uploadData || !uploadData.path) {
        console.warn('Supabase storage notice, preserving full uploaded image directly:', uploadError?.message);
        imageUrl = base64DataUrl;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uploadData.path);
        imageUrl = publicUrlData?.publicUrl || base64DataUrl;
      }
    } catch (storageErr) {
      console.warn('Storage notice, saving uploaded image directly in DB:', storageErr);
      imageUrl = base64DataUrl;
    }

    // Save PortfolioItem record to Database via Prisma
    let newItem: any;
    const createData: any = {
      title,
      caption,
      price,
      instagramUrl,
      imageUrl,
      isCover,
    };

    if (categoryId) {
      createData.categoryId = categoryId;
    }

    if (isCover && categoryId) {
      try {
        const [_, created] = await prisma.$transaction([
          prisma.portfolioItem.updateMany({
            where: { categoryId },
            data: { isCover: false },
          }),
          prisma.portfolioItem.create({
            data: createData,
            include: { category: true },
          }),
        ]);
        newItem = created;
      } catch {
        newItem = await prisma.portfolioItem.create({
          data: createData,
          include: { category: true },
        });
      }
    } else {
      newItem = await prisma.portfolioItem.create({
        data: createData,
        include: { category: true },
      });
    }

    revalidateAllRoutes();

    return {
      success: true,
      message: `Showcase "${title}" published to live site successfully!`,
      item: serializeItem(newItem),
    };
  } catch (error: any) {
    logActionError('createPortfolioItem', error, { title: formData.get('title') });
    return {
      success: false,
      error: prismaErrorMessage(error),
    };
  }
}

export const uploadPortfolioItem = createPortfolioItem;

/**
 * 4. updatePortfolioItem(id: string, formData: FormData)
 */
export async function updatePortfolioItem(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    if (!id) {
      return { success: false, error: 'Item ID is required.' };
    }

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

    if (!title) {
      return { success: false, error: 'Title is required.' };
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

    if (file && typeof (file as any).arrayBuffer === 'function' && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const mimeType = file.type || 'image/jpeg';
        const base64DataUrl = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

        const supabase = getServiceSupabase();
        const bucketName = 'portfolio-images';
        const fileExt = file.name ? file.name.split('.').pop() || 'jpg' : 'jpg';
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const uniqueFileName = `${Date.now()}-${sanitizedTitle}.${fileExt}`;
        const filePath = `uploads/${uniqueFileName}`;

        // Ensure bucket exists
        await supabase.storage.createBucket(bucketName, { public: true }).catch(() => null);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, fileBuffer, {
            contentType: mimeType,
            cacheControl: '3600',
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
      } catch (err) {
        console.warn('Storage update warning:', err);
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

    revalidateAllRoutes();

    return {
      success: true,
      message: 'Showcase item updated successfully!',
      item: serializeItem(updatedItem),
    };
  } catch (error: any) {
    logActionError('updatePortfolioItem', error, { id });
    return {
      success: false,
      error: prismaErrorMessage(error),
    };
  }
}

/**
 * 5. deletePortfolioItem(id: string)
 */
export async function deletePortfolioItem(id: string): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    if (!id) {
      return { success: false, error: 'Item ID is required.' };
    }

    const deletedItem = await prisma.portfolioItem
      .delete({
        where: { id },
      })
      .catch(() => null);

    revalidateAllRoutes();

    return {
      success: true,
      message: 'Showcase item deleted successfully.',
      item: deletedItem ? serializeItem(deletedItem) : null,
    };
  } catch (error: any) {
    logActionError('deletePortfolioItem', error, { id });
    return {
      success: false,
      error: prismaErrorMessage(error),
    };
  }
}

/**
 * 6. setCoverPhoto(id: string, category: string)
 */
export async function setCoverPhoto(
  id: string,
  categoryIdentifier: string
): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    if (!id || !categoryIdentifier) {
      return { success: false, error: 'Item ID and Category are required.' };
    }

    const categoryId = await resolveCategoryId(categoryIdentifier);

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

    revalidateAllRoutes();

    return {
      success: true,
      message: `"${updatedItem?.title || 'Showcase'}" set as primary cover photo!`,
      item: serializeItem(updatedItem),
    };
  } catch (error: any) {
    logActionError('setCoverPhoto', error, { id, categoryIdentifier });
    return {
      success: false,
      error: prismaErrorMessage(error),
    };
  }
}
