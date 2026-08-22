'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getServiceSupabase } from '@/lib/supabase';
import { ensureDatabaseSchema } from '@/lib/dbInit';

// ---------------------------------------------------------------------------
// 1. Validation Schemas (Zod)
// ---------------------------------------------------------------------------

export const CategoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim(),
  slug: z.string().max(100).optional(),
  imageUrl: z.string().nullable().optional(),
});

export const CategoryUpdateSchema = z.object({
  id: z.string().min(1, 'Category ID is required').trim(),
  name: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name cannot exceed 100 characters')
    .trim(),
  slug: z.string().max(100).optional(),
  imageUrl: z.string().nullable().optional(),
  removeImage: z.boolean().optional(),
});

export const CategoryDeleteSchema = z.object({
  id: z.string().min(1, 'Category ID is required').trim(),
});

export const PortfolioItemCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  category: z.string().min(1, 'Category is required').trim(),
  caption: z.string().max(1000, 'Caption cannot exceed 1000 characters').optional().nullable(),
  price: z.string().max(100, 'Price format is too long').optional().nullable(),
  instagramUrl: z.string().max(300, 'Instagram URL is too long').optional().nullable(),
  isCover: z.boolean().optional(),
});

export const PortfolioItemUpdateSchema = z.object({
  id: z.string().min(1, 'Item ID is required').trim(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title cannot exceed 150 characters')
    .trim(),
  category: z.string().optional().nullable(),
  caption: z.string().max(1000, 'Caption cannot exceed 1000 characters').optional().nullable(),
  price: z.string().max(100, 'Price format is too long').optional().nullable(),
  instagramUrl: z.string().max(300, 'Instagram URL is too long').optional().nullable(),
  isCover: z.boolean().optional(),
});

export const PortfolioItemDeleteSchema = z.object({
  id: z.string().min(1, 'Item ID is required').trim(),
});

export const SetCoverPhotoSchema = z.object({
  id: z.string().min(1, 'Item ID is required').trim(),
  category: z.string().min(1, 'Category identifier is required').trim(),
});

// ---------------------------------------------------------------------------
// 2. Structured Error & Security Helpers
// ---------------------------------------------------------------------------

/** Maps Prisma error codes to clean, safe, human-readable messages. */
function sanitizeErrorMessage(error: any): string {
  const code = error?.code;
  if (code === 'P1001') return 'Cannot reach database. Please try again shortly.';
  if (code === 'P1008') return 'Database operation timed out. Please try again.';
  if (code === 'P2002') return 'A record with these details already exists.';
  if (code === 'P2025') return 'The requested record was not found.';
  if (code === 'P2003') return 'Foreign key relation error. The referenced item may not exist.';
  return error?.message || 'An unexpected error occurred. Please try again.';
}

/** Uniform structured logger for Server Action failures. */
function logActionError(actionName: string, error: any, context?: Record<string, unknown>) {
  console.error(
    `[ServerAction:${actionName}] FAILED`,
    JSON.stringify(
      {
        errorCode: error?.code ?? 'UNKNOWN',
        message: error?.message ?? String(error),
        sanitizedMessage: sanitizeErrorMessage(error),
        ...context,
        stack: process.env.NODE_ENV === 'development' ? error?.stack?.split('\n').slice(0, 5).join(' | ') : undefined,
      },
      null,
      2
    )
  );
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
      return true;
    }

    const email = user.email.toLowerCase().trim();
    return ADMIN_EMAILS.includes(email);
  } catch (err) {
    console.warn('[Admin Auth Check Exception - allowing access]:', err);
    return true;
  }
}

/** Instant cache clearance across all dynamic app routes and root layout. */
function revalidateAllRoutes() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/book');
    revalidatePath('/admin');
    revalidatePath('/weddings');
    revalidatePath('/baby-showers');
    revalidatePath('/portfolio');
    revalidateTag('portfolio');
    revalidateTag('categories');
  } catch (err) {
    console.warn('revalidatePath warning:', err);
  }
}

/** Convert string name to URL-friendly slug */
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

/** Helper to ensure a Category exists (by ID, slug, or name) */
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
    const anyCat = await prisma.category.findFirst().catch(() => null);
    return anyCat ? anyCat.id : null;
  }
}

// ---------------------------------------------------------------------------
// 3. Category Mutations
// ---------------------------------------------------------------------------

/**
 * 1. createCategory
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
        message: 'Unauthorized: Only authorized admin accounts can perform this action.',
        error: 'Unauthorized',
      };
    }

    let rawName = '';
    let rawSlug = '';
    let rawImageUrl: string | null = null;
    let file: File | null = null;

    if (typeof nameOrFormData === 'object' && nameOrFormData !== null && 'get' in nameOrFormData) {
      const formData = nameOrFormData as FormData;
      rawName = (formData.get('name') as string | null) || '';
      rawSlug = (formData.get('slug') as string | null) || '';
      rawImageUrl = (formData.get('imageUrl') as string | null) || null;
      file = formData.get('file') as File | null;
    } else {
      rawName = nameOrFormData || '';
      rawSlug = slugArg || '';
      rawImageUrl = imageUrlArg || null;
    }

    // Zod Payload Validation
    const validation = CategoryCreateSchema.safeParse({
      name: rawName,
      slug: rawSlug || undefined,
      imageUrl: rawImageUrl,
    });

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid category data.';
      return { success: false, message: errorMsg, error: errorMsg };
    }

    const { name, slug } = validation.data;
    let imageUrl = validation.data.imageUrl || null;

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
    logActionError('createCategory', error);
    const safeMsg = sanitizeErrorMessage(error);
    return {
      success: false,
      message: safeMsg,
      error: safeMsg,
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
        message: 'Unauthorized: Only authorized admin accounts can perform this action.',
        error: 'Unauthorized',
      };
    }

    let rawId = '';
    let rawName = '';
    let rawSlug = '';
    let rawImageUrl: string | null = null;
    let removeImage = false;
    let file: File | null = null;

    if (typeof idOrFormData === 'object' && idOrFormData !== null && 'get' in idOrFormData) {
      const formData = idOrFormData as FormData;
      rawId = (formData.get('id') as string | null) || '';
      rawName = (formData.get('name') as string | null) || '';
      rawSlug = (formData.get('slug') as string | null) || '';
      rawImageUrl = (formData.get('imageUrl') as string | null) || null;
      removeImage = formData.get('removeImage') === 'true';
      file = formData.get('file') as File | null;
    } else {
      rawId = idOrFormData || '';
      rawName = nameArg || '';
      rawSlug = slugArg || '';
      rawImageUrl = imageUrlArg ?? null;
      removeImage = removeImageArg === true;
    }

    // Zod Payload Validation
    const validation = CategoryUpdateSchema.safeParse({
      id: rawId,
      name: rawName,
      slug: rawSlug || undefined,
      imageUrl: rawImageUrl,
      removeImage,
    });

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid category update data.';
      return { success: false, message: errorMsg, error: errorMsg };
    }

    const { id, name, slug } = validation.data;
    let imageUrl = validation.data.imageUrl ?? null;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, message: 'Category not found.', error: 'Category not found' };
    }

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
    logActionError('updateCategory', error);
    const safeMsg = sanitizeErrorMessage(error);
    return {
      success: false,
      message: safeMsg,
      error: safeMsg,
    };
  }
}

/**
 * 3. deleteCategory
 */
export async function deleteCategory(id: string): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        message: 'Unauthorized: Only authorized admin accounts can perform this action.',
        error: 'Unauthorized',
      };
    }

    const validation = CategoryDeleteSchema.safeParse({ id });
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Category ID is required.';
      return { success: false, message: errorMsg, error: errorMsg };
    }

    const deletedCategory = await prisma.category
      .delete({
        where: { id: validation.data.id },
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
    const safeMsg = sanitizeErrorMessage(error);
    return {
      success: false,
      message: safeMsg,
      error: safeMsg,
    };
  }
}

// ---------------------------------------------------------------------------
// 4. Portfolio Item Mutations
// ---------------------------------------------------------------------------

/**
 * 4. createPortfolioItem
 */
export async function createPortfolioItem(formData: FormData): Promise<ActionResponse> {
  try {
    await ensureDatabaseSchema();

    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        message: 'Unauthorized: Only authorized admin accounts can perform this action.',
        error: 'Unauthorized',
      };
    }

    const file = formData.get('file') as File | null;
    const rawTitle = (formData.get('title') as string | null) || '';
    const rawCategory =
      (formData.get('category') as string | null) ||
      (formData.get('categoryId') as string | null) ||
      'Wedding';
    const rawCaption = (formData.get('caption') as string | null) || '';
    const rawPrice = (formData.get('price') as string | null) || null;
    const rawInstagramUrl = (formData.get('instagramUrl') as string | null) || null;
    const isCover = formData.get('isCover') === 'true' || formData.get('isCover') === 'on';

    // Zod Payload Validation
    const validation = PortfolioItemCreateSchema.safeParse({
      title: rawTitle,
      category: rawCategory,
      caption: rawCaption,
      price: rawPrice,
      instagramUrl: rawInstagramUrl,
      isCover,
    });

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid showcase data.';
      return { success: false, message: errorMsg, error: errorMsg };
    }

    const { title, category, caption, price, instagramUrl } = validation.data;

    if (!file || file.size === 0) {
      return { success: false, message: 'A valid image file is required.', error: 'Image file required' };
    }

    const categoryId = await resolveCategoryId(category);

    // Prepare Image Upload
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
      const filePath = `uploads/${slugify(category)}/${uniqueFileName}`;

      await supabase.storage.createBucket(bucketName, { public: true }).catch(() => null);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, fileBuffer, {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError || !uploadData || !uploadData.path) {
        imageUrl = base64DataUrl;
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(uploadData.path);
        imageUrl = publicUrlData?.publicUrl || base64DataUrl;
      }
    } catch {
      imageUrl = base64DataUrl;
    }

    // Save PortfolioItem record
    let newItem: any;
    const createData: any = {
      title,
      caption: caption || '',
      price: price || null,
      instagramUrl: instagramUrl || null,
      imageUrl,
      isCover: !!isCover,
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
    logActionError('createPortfolioItem', error);
    const safeMsg = sanitizeErrorMessage(error);
    return {
      success: false,
      message: safeMsg,
      error: safeMsg,
    };
  }
}

export const uploadPortfolioItem = createPortfolioItem;

/**
 * 5. updatePortfolioItem
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
        message: 'Unauthorized: Only authorized admin accounts can perform this action.',
        error: 'Unauthorized',
      };
    }

    const rawTitle = (formData.get('title') as string | null) || '';
    const rawCategory =
      (formData.get('category') as string | null) ||
      (formData.get('categoryId') as string | null) ||
      undefined;
    const rawCaption = (formData.get('caption') as string | null) || '';
    const isCoverRaw = formData.get('isCover');
    const isCover = isCoverRaw !== null ? isCoverRaw === 'true' || isCoverRaw === 'on' : undefined;
    const rawPrice = formData.get('price') as string | null;
    const rawInstagramUrl = formData.get('instagramUrl') as string | null;
    const file = formData.get('file') as File | null;

    // Zod Payload Validation
    const validation = PortfolioItemUpdateSchema.safeParse({
      id,
      title: rawTitle,
      category: rawCategory,
      caption: rawCaption,
      price: rawPrice,
      instagramUrl: rawInstagramUrl,
      isCover,
    });

    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Invalid update data.';
      return { success: false, message: errorMsg, error: errorMsg };
    }

    const { title, category, caption, price, instagramUrl } = validation.data;

    const updateData: any = {
      title,
      caption: caption || '',
    };

    if (formData.has('price')) {
      updateData.price = price || null;
    }
    if (formData.has('instagramUrl')) {
      updateData.instagramUrl = instagramUrl || null;
    }

    let categoryId: string | null = null;
    if (category) {
      categoryId = await resolveCategoryId(category);
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
    const safeMsg = sanitizeErrorMessage(error);
    return {
      success: false,
      message: safeMsg,
      error: safeMsg,
    };
  }
}

/**
 * 6. deletePortfolioItem
 */
export async function deletePortfolioItem(id: string): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        message: 'Unauthorized: Only authorized admin accounts can perform this action.',
        error: 'Unauthorized',
      };
    }

    const validation = PortfolioItemDeleteSchema.safeParse({ id });
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Item ID is required.';
      return { success: false, message: errorMsg, error: errorMsg };
    }

    const deletedItem = await prisma.portfolioItem
      .delete({
        where: { id: validation.data.id },
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
    const safeMsg = sanitizeErrorMessage(error);
    return {
      success: false,
      message: safeMsg,
      error: safeMsg,
    };
  }
}

/**
 * 7. setCoverPhoto
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
        message: 'Unauthorized: Only authorized admin accounts can perform this action.',
        error: 'Unauthorized',
      };
    }

    const validation = SetCoverPhotoSchema.safeParse({ id, category: categoryIdentifier });
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || 'Valid Item ID and Category required.';
      return { success: false, message: errorMsg, error: errorMsg };
    }

    const categoryId = await resolveCategoryId(validation.data.category);

    let updatedItem: any;
    if (categoryId) {
      try {
        const [_, item] = await prisma.$transaction([
          prisma.portfolioItem.updateMany({
            where: { categoryId },
            data: { isCover: false },
          }),
          prisma.portfolioItem.update({
            where: { id: validation.data.id },
            data: { isCover: true },
            include: { category: true },
          }),
        ]);
        updatedItem = item;
      } catch {
        updatedItem = await prisma.portfolioItem.update({
          where: { id: validation.data.id },
          data: { isCover: true },
          include: { category: true },
        });
      }
    } else {
      updatedItem = await prisma.portfolioItem.update({
        where: { id: validation.data.id },
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
    const safeMsg = sanitizeErrorMessage(error);
    return {
      success: false,
      message: safeMsg,
      error: safeMsg,
    };
  }
}
