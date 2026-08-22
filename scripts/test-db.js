const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Loaded (starts with ' + process.env.DATABASE_URL.slice(0, 25) + '...)' : 'MISSING');
  console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Loaded' : 'MISSING');

  const prisma = new PrismaClient();
  try {
    const categories = await prisma.category.findMany();
    console.log('✅ Connected to database!');
    console.log('Categories count:', categories.length);
    console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

    const items = await prisma.portfolioItem.findMany({ take: 5 });
    console.log('Portfolio items count:', items.length);
  } catch (err) {
    console.error('❌ Database query failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
