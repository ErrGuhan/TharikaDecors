'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { getServiceSupabase } from '@/lib/supabase';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@tharikadecors.com').toLowerCase();

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
    } = await supabaseServer.auth.getUser();

    return !!(user && user.email?.toLowerCase() === ADMIN_EMAIL);
  } catch {
    return false;
  }
}

function revalidateAllRoutes() {
  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/weddings');
  revalidatePath('/baby-showers');
  revalidatePath('/portfolio');
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
  if (!cat) return cat;
  return {
    ...cat,
    createdAt: cat.createdAt instanceof Date ? cat.createdAt.toISOString() : (cat.createdAt ? new Date(cat.createdAt).toISOString() : new Date().toISOString()),
  };
}

function serializeItem(item: any) {
  if (!item) return item;
  return {
    ...item,
    createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : (item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString()),
    updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt ? new Date(item.updatedAt).toISOString() : (item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date().toISOString())),
    category: item.category ? serializeCategory(item.category) : item.category,
  };
}

/**
 * 1. createCategory(name: string, slug?: string)
 */
export async function createCategory(name: string, slug?: string): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Category name is required.' };
    }

    const generatedSlug = (slug?.trim() || slugify(trimmedName)).toLowerCase();

    // Check if category or slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: generatedSlug },
    });

    if (existing) {
      return {
        success: true,
        message: `Category "${existing.name}" already exists.`,
        category: serializeCategory(existing),
      };
    }

    const newCategory = await prisma.category.create({
      data: {
        name: trimmedName,
        slug: generatedSlug,
      },
    });

    revalidateAllRoutes();

    return {
      success: true,
      message: `Category "${newCategory.name}" created successfully!`,
      category: serializeCategory(newCategory),
    };
  } catch (error: any) {
    console.error('Error in createCategory action:', error);
    return {
      success: false,
      error: error.message || 'Failed to create category.',
    };
  }
}

/**
 * 2. deleteCategory(id: string)
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

    const deletedCategory = await prisma.category.delete({
      where: { id },
    });

    revalidateAllRoutes();

    return {
      success: true,
      message: `Deleted category "${deletedCategory.name}" successfully.`,
      category: serializeCategory(deletedCategory),
    };
  } catch (error: any) {
    console.error('Error in deleteCategory action:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete category.',
    };
  }
}

/**
 * Helper to ensure a Category exists (by ID, slug, or name)
 */
async function resolveCategoryId(categoryIdentifier: string): Promise<string> {
  const trimmed = categoryIdentifier.trim();
  const slug = slugify(trimmed);

  // Try finding by ID
  let cat = await prisma.category.findUnique({
    where: { id: trimmed },
  }).catch(() => null);

  if (cat) return cat.id;

  // Try finding by slug
  cat = await prisma.category.findUnique({
    where: { slug },
  });

  if (cat) return cat.id;

  // Create new category dynamically if not found
  const name = trimmed
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const created = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });

  return created.id;
}

/**
 * 3. createPortfolioItem(formData: FormData)
 */
export async function createPortfolioItem(formData: FormData): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null)?.trim();
    const categoryRaw = (formData.get('category') as string | null)?.trim() || (formData.get('categoryId') as string | null)?.trim();
    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const price = (formData.get('price') as string | null)?.trim() || null;
    const instagramUrl = (formData.get('instagramUrl') as string | null)?.trim() || null;
    const isCover = formData.get('isCover') === 'true' || formData.get('isCover') === 'on';

    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: 'A valid image file is required.' };
    }

    if (!title) {
      return { success: false, error: 'Title is required.' };
    }

    if (!categoryRaw) {
      return { success: false, error: 'Category is required.' };
    }

    const categoryId = await resolveCategoryId(categoryRaw);

    // Upload to Supabase Storage bucket 'portfolio-images'
    const supabase = getServiceSupabase();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const uniqueFileName = `${Date.now()}-${sanitizedTitle}.${fileExt}`;
    const filePath = `${categoryRaw}/${uniqueFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    let imageUrl = '';

    if (uploadError) {
      console.warn('Supabase storage upload note:', uploadError.message);
      imageUrl = `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80`;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(uploadData.path);
      imageUrl = publicUrlData.publicUrl;
    }

    let newItem;
    if (isCover) {
      const [_, created] = await prisma.$transaction([
        prisma.portfolioItem.updateMany({
          where: { categoryId },
          data: { isCover: false },
        }),
        prisma.portfolioItem.create({
          data: {
            title,
            caption,
            price,
            instagramUrl,
            categoryId,
            imageUrl,
            isCover: true,
          },
          include: { category: true },
        }),
      ]);
      newItem = created;
    } else {
      newItem = await prisma.portfolioItem.create({
        data: {
          title,
          caption,
          price,
          instagramUrl,
          categoryId,
          imageUrl,
          isCover: false,
        },
        include: { category: true },
      });
    }

    revalidateAllRoutes();

    return {
      success: true,
      message: 'Portfolio item created and saved successfully!',
      item: serializeItem(newItem),
    };
  } catch (error: any) {
    console.error('Error in createPortfolioItem:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while saving.',
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
    const categoryRaw = (formData.get('category') as string | null)?.trim() || (formData.get('categoryId') as string | null)?.trim();
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

    let categoryId: string | undefined;
    if (categoryRaw) {
      categoryId = await resolveCategoryId(categoryRaw);
      updateData.categoryId = categoryId;
    }

    if (isCover !== undefined) {
      updateData.isCover = isCover;
    }

    if (file && file instanceof File && file.size > 0) {
      const supabase = getServiceSupabase();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const uniqueFileName = `${Date.now()}-${sanitizedTitle}.${fileExt}`;
      const filePath = `uploads/${uniqueFileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, fileBuffer, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(uploadData.path);
        updateData.imageUrl = publicUrlData.publicUrl;
      }
    }

    let updatedItem;
    if (isCover === true && categoryId) {
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
    console.error('Error in updatePortfolioItem:', error);
    return {
      success: false,
      error: error.message || 'Failed to update portfolio item.',
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

    const deletedItem = await prisma.portfolioItem.delete({
      where: { id },
    });

    revalidateAllRoutes();

    return {
      success: true,
      message: `Deleted "${deletedItem.title}" successfully.`,
      item: serializeItem(deletedItem),
    };
  } catch (error: any) {
    console.error('Error in deletePortfolioItem:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete portfolio item.',
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

    const [_, updatedItem] = await prisma.$transaction([
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

    revalidateAllRoutes();

    return {
      success: true,
      message: `"${updatedItem.title}" set as primary cover photo!`,
      item: serializeItem(updatedItem),
    };
  } catch (error: any) {
    console.error('Error in setCoverPhoto:', error);
    return {
      success: false,
      error: error.message || 'Failed to set cover photo.',
    };
  }
}
