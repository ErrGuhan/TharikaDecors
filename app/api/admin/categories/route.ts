import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const body = await req.json().catch(() => ({}));
    const name = (body.name || '').trim();
    const slug = (body.slug || slugify(name)).trim().toLowerCase();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required.' },
        { status: 400 }
      );
    }

    const existing = await prisma.category
      .findFirst({
        where: { OR: [{ slug }, { name }] },
      })
      .catch(() => null);

    if (existing) {
      return NextResponse.json({
        success: true,
        message: `Category "${existing.name}" already exists.`,
        category: {
          id: existing.id,
          name: existing.name,
          slug: existing.slug,
          createdAt:
            existing.createdAt instanceof Date
              ? existing.createdAt.toISOString()
              : new Date().toISOString(),
        },
      });
    }

    const newCategory = await prisma.category.create({
      data: { name, slug },
    });

    return NextResponse.json({
      success: true,
      message: `Category "${newCategory.name}" created successfully!`,
      category: {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
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
