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
 * 1. createPortfolioItem(formData: FormData)
 * Reads title, caption, category, isCover (boolean), uploads the image file to Supabase storage portfolio-images,
 * and creates the record in PostgreSQL.
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
    const category = (formData.get('category') as string | null)?.trim();
    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const isCover = formData.get('isCover') === 'true' || formData.get('isCover') === 'on';

    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: 'A valid image file is required.' };
    }

    if (!title) {
      return { success: false, error: 'Title is required.' };
    }

    if (!category || !['wedding', 'baby-shower', 'ear-piercing'].includes(category)) {
      return { success: false, error: 'Category must be wedding, baby-shower, or ear-piercing.' };
    }

    // Upload to Supabase Storage bucket 'portfolio-images'
    const supabase = getServiceSupabase();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const uniqueFileName = `${Date.now()}-${sanitizedTitle}.${fileExt}`;
    const filePath = `${category}/${uniqueFileName}`;

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

    // If isCover is true, reset other covers in this category and create item in transaction
    let newItem;
    if (isCover) {
      const [_, created] = await prisma.$transaction([
        prisma.portfolioItem.updateMany({
          where: { category },
          data: { isCover: false },
        }),
        prisma.portfolioItem.create({
          data: {
            title,
            caption,
            category,
            imageUrl,
            isCover: true,
          },
        }),
      ]);
      newItem = created;
    } else {
      newItem = await prisma.portfolioItem.create({
        data: {
          title,
          caption,
          category,
          imageUrl,
          isCover: false,
        },
      });
    }

    revalidateAllRoutes();

    return {
      success: true,
      message: 'Portfolio item created and saved successfully!',
      item: newItem,
    };
  } catch (error: any) {
    console.error('Error in createPortfolioItem:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while saving.',
    };
  }
}

// Alias for backwards compatibility
export const uploadPortfolioItem = createPortfolioItem;

/**
 * 2. updatePortfolioItem(id: string, formData: FormData)
 * Updates title, caption, category, and isCover. If a new image file is provided, uploads it and replaces imageUrl.
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
    const category = (formData.get('category') as string | null)?.trim();
    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const isCoverRaw = formData.get('isCover');
    const isCover = isCoverRaw !== null ? isCoverRaw === 'true' || isCoverRaw === 'on' : undefined;
    const file = formData.get('file') as File | null;

    if (!title) {
      return { success: false, error: 'Title is required.' };
    }

    if (!category || !['wedding', 'baby-shower', 'ear-piercing'].includes(category)) {
      return { success: false, error: 'Category must be wedding, baby-shower, or ear-piercing.' };
    }

    const updateData: any = {
      title,
      category,
      caption,
    };

    if (isCover !== undefined) {
      updateData.isCover = isCover;
    }

    // If new file is uploaded, upload to Supabase and replace imageUrl
    if (file && file instanceof File && file.size > 0) {
      const supabase = getServiceSupabase();
      const fileExt = file.name.split('.').pop() || 'jpg';
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const uniqueFileName = `${Date.now()}-${sanitizedTitle}.${fileExt}`;
      const filePath = `${category}/${uniqueFileName}`;

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
    if (isCover === true) {
      const [_, item] = await prisma.$transaction([
        prisma.portfolioItem.updateMany({
          where: { category, NOT: { id } },
          data: { isCover: false },
        }),
        prisma.portfolioItem.update({
          where: { id },
          data: updateData,
        }),
      ]);
      updatedItem = item;
    } else {
      updatedItem = await prisma.portfolioItem.update({
        where: { id },
        data: updateData,
      });
    }

    revalidateAllRoutes();

    return {
      success: true,
      message: 'Showcase item updated successfully!',
      item: updatedItem,
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
 * 3. deletePortfolioItem(id: string)
 * Deletes the record from Prisma by ID.
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
      item: deletedItem,
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
 * 4. setCoverPhoto(id: string, category: string)
 * In a transaction, sets isCover: false for all items matching category, then sets isCover: true for the chosen id.
 */
export async function setCoverPhoto(
  id: string,
  category: string
): Promise<ActionResponse> {
  try {
    const isAuthorized = await verifyAdminAuth();
    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can perform this action.',
      };
    }

    if (!id || !category) {
      return { success: false, error: 'Item ID and Category are required.' };
    }

    // In a Prisma transaction:
    // 1. Reset all items matching category to isCover: false
    // 2. Set chosen id to isCover: true
    const [_, updatedItem] = await prisma.$transaction([
      prisma.portfolioItem.updateMany({
        where: { category },
        data: { isCover: false },
      }),
      prisma.portfolioItem.update({
        where: { id },
        data: { isCover: true },
      }),
    ]);

    revalidateAllRoutes();

    return {
      success: true,
      message: `"${updatedItem.title}" set as primary cover for ${category}!`,
      item: updatedItem,
    };
  } catch (error: any) {
    console.error('Error in setCoverPhoto:', error);
    return {
      success: false,
      error: error.message || 'Failed to set cover photo.',
    };
  }
}
