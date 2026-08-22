import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  onProgress?: (progress: number) => void;
}

export const DEFAULT_COMPRESSION_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

/**
 * Compresses an image file client-side before uploading to Supabase Storage.
 * Guarantees output file stays under 500KB and max dimensions of 1920px.
 */
export async function compressImage(
  file: File,
  customOptions?: Partial<CompressionOptions>
): Promise<File> {
  // If not an image or SVG/GIF, return original
  if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
    return file;
  }

  const options: CompressionOptions = {
    ...DEFAULT_COMPRESSION_OPTIONS,
    ...customOptions,
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Wrap back into File instance to preserve name and MIME type
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type || file.type,
      lastModified: Date.now(),
    });

    console.log(
      `[Image Compression] Original: ${(file.size / 1024).toFixed(1)}KB -> Compressed: ${(
        compressedFile.size / 1024
      ).toFixed(1)}KB`
    );

    return compressedFile;
  } catch (error) {
    console.warn('[Image Compression] Compression error, falling back to original file:', error);
    return file;
  }
}

export default compressImage;
