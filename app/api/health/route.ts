import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  let dbStatus = 'disconnected';
  let dbLatencyMs = -1;
  let dbError: string | null = null;
  let storageStatus = 'unchecked';
  let storageBucket = 'portfolio-images';

  // 1. Check Prisma PostgreSQL Database Connection
  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1 as health_check`;
    dbLatencyMs = Math.round(performance.now() - dbStart);
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = 'error';
    dbError = err?.message || 'Failed to connect to database';
    console.error('[Health Diagnostic API] Database connection test failed:', err);
  }

  // 2. Check Supabase Storage Connectivity
  try {
    const supabase = getServiceSupabase();
    const { data: buckets, error: storageErr } = await supabase.storage.listBuckets();
    if (storageErr) {
      storageStatus = 'degraded';
    } else {
      const hasBucket = buckets?.some((b) => b.name === storageBucket);
      storageStatus = hasBucket ? 'connected' : 'bucket_missing';
    }
  } catch (storageException: any) {
    storageStatus = 'error';
    console.warn('[Health Diagnostic API] Storage check warning:', storageException?.message);
  }

  const totalDurationMs = Math.round(performance.now() - startTime);
  const isHealthy = dbStatus === 'connected';

  const responseBody = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp,
    durationMs: totalDurationMs,
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      provider: 'postgresql',
      pooler: process.env.DATABASE_URL?.includes('6543') ? 'pgbouncer-pooler' : 'direct',
      error: dbError,
    },
    storage: {
      status: storageStatus,
      bucket: storageBucket,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      app: 'Tharika Decors & Events',
      router: 'nextjs-app-router',
      uptimeSeconds: Math.round(process.uptime()),
    },
  };

  return NextResponse.json(responseBody, {
    status: isHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
