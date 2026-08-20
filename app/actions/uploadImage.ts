'use server';

import { supabase } from '@/lib/supabase';

export interface UploadImageResult {
  success: boolean;
  publicUrl?: string;
  filePath?: string;
  error?: string;
}

/**
 * Async Next.js Server Action / upload function to upload an image from FormData to Supabase Storage.
 * - Generates a unique timestamped filename.
 * - Uploads the file to the 'portfolio-images' bucket.
 * - Retrieves and returns the public URL via getPublicUrl().
 * - Includes robust error handling.
 */
export async function uploadPortfolioImage(formData: FormData): Promise<UploadImageResult> {
  try {
    const file = formData.get('file') as File | null;

    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: 'No valid image file provided in FormData.',
      };
    }

    // 1. Generate a unique filename using Date.now()
    const fileExt = file.name.split('.').pop() || 'jpg';
    const sanitizedBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();
    const uniqueFileName = `${Date.now()}-${sanitizedBaseName}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `uploads/${uniqueFileName}`;

    // 2. Convert File into a buffer for server-side upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Supabase bucket 'portfolio-images'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('portfolio-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return {
        success: false,
        error: uploadError.message,
      };
    }

    // 3. Retrieve and return the public URL using getPublicUrl()
    const { data: publicUrlData } = supabase.storage
      .from('portfolio-images')
      .getPublicUrl(uploadData.path);

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      filePath: uploadData.path,
    };
  } catch (error: any) {
    console.error('Unexpected error during Supabase upload:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during image upload.',
    };
  }
}
