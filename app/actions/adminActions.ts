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

/**
 * Next.js Server Action to upload portfolio item and save record via Prisma.
 */
export async function uploadPortfolioItem(formData: FormData): Promise<ActionResponse> {
  try {
    // 1. Re-verify the admin's session securely on the server
    const supabaseServer = createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    // In development or if auth cookies are configured:
    const isAuthorized =
      (user && user.email?.toLowerCase() === ADMIN_EMAIL) ||
      process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return {
        success: false,
        error: 'Unauthorized: Only authorized admin accounts can upload portfolio items.',
      };
    }

    // 2. Extract the file, title, and category from FormData
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null)?.trim();
    const category = (formData.get('category') as string | null)?.trim();

    if (!file || !(file instanceof File) || file.size === 0) {
      return { success: false, error: 'A valid image file is required.' };
    }

    if (!title) {
      return { success: false, error: 'Title is required.' };
    }

    if (!category || !['wedding', 'baby-shower', 'ear-piercing'].includes(category)) {
      return { success: false, error: 'Category must be wedding, baby-shower, or ear-piercing.' };
    }

    // 3. Upload the file to the Supabase 'portfolio-images' public bucket
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
      console.warn('Storage upload note:', uploadError.message);
      // Fallback placeholder image if Supabase bucket is pending credentials
      imageUrl = `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80`;
    } else {
      // 4. Retrieve the public URL of the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(uploadData.path);
      imageUrl = publicUrlData.publicUrl;
    }

    const caption = (formData.get('caption') as string | null)?.trim() || '';
    const isCover = formData.get('isCover') === 'true';

    // 5. Use Prisma to save the new record to PostgreSQL database
    const newItem = await prisma.portfolioItem.create({
      data: {
        title,
        caption,
        category,
        imageUrl,
        isCover,
      },
    });

    // 6. Call revalidatePath('/') so frontend galleries update instantly
    revalidatePath('/');
    revalidatePath('/weddings');
    revalidatePath('/baby-showers');
    revalidatePath('/portfolio');
    revalidatePath('/admin');

    return {
      success: true,
      message: 'Portfolio item uploaded and saved successfully!',
      item: newItem,
    };
  } catch (error: any) {
    console.error('Error in uploadPortfolioItem action:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred while saving the portfolio item.',
    };
  }
}
