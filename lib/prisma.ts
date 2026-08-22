import { PrismaClient } from '@prisma/client';

// ---------------------------------------------------------------------------
// Global singleton type — ensures a single PrismaClient instance survives
// across hot-reloads in development AND across serverless function invocations
// in production (Vercel / Netlify).
//
// Root-cause fix: the previous guard `if (NODE_ENV !== 'production')` never
// assigned the singleton in production, causing a fresh PrismaClient — and a
// fresh connection — to be created on every cold-start, exhausting the Supabase
// PgBouncer connection pool (port 6543).
// ---------------------------------------------------------------------------
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    // Respect DIRECT_URL for migrations & interactive transactions
    // (DATABASE_URL should use pgbouncer=true on port 6543 for pooled queries)
    datasources: process.env.DIRECT_URL
      ? undefined // let schema.prisma pick up both DATABASE_URL + directUrl
      : undefined,
  });
}

// ✅ Assign singleton unconditionally — works in both dev and production.
// In development, globalThis persists across module hot-reloads.
// In production serverless, globalThis is shared within the same function
// instance, preventing connection pool exhaustion.
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

// Always assign back so the next import in the same process reuses it.
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
