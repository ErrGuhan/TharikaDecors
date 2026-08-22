const { PrismaClient } = require('@prisma/client');

const password = 'Tharika-decors';
const projectRef = 'msrhvfkdptfghslfxoqv';
const region = 'aws-0-ap-south-1';

const testUrls = [
  {
    name: '1. Direct connection (db.[ref].supabase.co:5432)',
    url: `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres`
  },
  {
    name: '2. Session pooler (pooler...:5432 with user postgres.[ref])',
    url: `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:5432/postgres`
  },
  {
    name: '3. Transaction pooler (pooler...:6543 with pgbouncer=true)',
    url: `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: '4. Direct IPv4 / pooler without pgbouncer (pooler...:6543)',
    url: `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@${region}.pooler.supabase.com:6543/postgres`
  }
];

async function testAll() {
  for (const { name, url } of testUrls) {
    console.log(`\nTesting ${name}...`);
    const prisma = new PrismaClient({
      datasources: { db: { url } },
      log: []
    });
    try {
      const res = await Promise.race([
        prisma.category.findMany({ take: 1 }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timed out after 5s')), 5000))
      ]);
      console.log(`✅ SUCCESS with ${name}! Found:`, res);
    } catch (err) {
      console.log(`❌ FAILED: ${err.message || err}`);
    } finally {
      await prisma.$disconnect().catch(() => null);
    }
  }
}

testAll();
