import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServiceSupabase } from '@/lib/supabase';

// Authorized admin emails check helper
const AUTHORIZED_ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS || 'admin@tharikadecor.com,owner@tharikadecor.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch portfolio items' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const category = formData.get('category') as string | null;
    const userEmail = formData.get('userEmail') as string | null;

    // 1. Validation
    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Title and Category are required.' },
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
      return NextResponse.json(
        { success: false, error: 'Forbidden: You are not authorized as an admin.' },
        { status: 403 }
      );
    }

    // 2. Upload file to Supabase Storage
    const supabase = getServiceSupabase();
    const bucketName = 'portfolio-images';

    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `uploads/${category.toLowerCase().replace(/\s+/g, '-')}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    let imageUrl = '';

    if (uploadError) {
      console.warn('Supabase storage warning (check credentials/bucket):', uploadError.message);
      // Fallback for development if credentials or bucket are mock
      imageUrl = `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80`;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path);
      imageUrl = publicUrlData.publicUrl;
    }

    // 3. Save PortfolioItem record to Database via Prisma
    const newItem = await prisma.portfolioItem.create({
      data: {
        title,
        category,
        imageUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Portfolio item created successfully',
      item: newItem,
    });
  } catch (error: any) {
    console.error('API Error in /api/admin/portfolio:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
