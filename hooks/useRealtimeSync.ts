'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface UseRealtimeSyncOptions {
  tables?: string[];
  schema?: string;
  onSync?: (payload: RealtimePostgresChangesPayload<any>) => void;
  enabled?: boolean;
}

/**
 * Real-time synchronization hook using Supabase Realtime Channels.
 * Listens for INSERT, UPDATE, and DELETE changes on database tables
 * and automatically triggers Next.js router.refresh() to keep Server Components
 * and client views in sync across multiple admins and users.
 */
export function useRealtimeSync({
  tables = ['portfolio_items', 'categories'],
  schema = 'public',
  onSync,
  enabled = true,
}: UseRealtimeSyncOptions = {}) {
  const router = useRouter();
  const onSyncRef = useRef(onSync);
  onSyncRef.current = onSync;

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-db-sync-${Math.random().toString(36).substring(2, 7)}`;

    let channel = supabase.channel(channelName);

    tables.forEach((tableName) => {
      channel = channel.on(
        'postgres_changes' as any,
        {
          event: '*',
          schema,
          table: tableName,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`[Supabase Realtime] Event "${payload.eventType}" on "${tableName}"`);
          if (onSyncRef.current) {
            onSyncRef.current(payload);
          }
          // Invalidate Next.js client-side router cache and refetch server component data
          router.refresh();
        }
      );
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Connected to realtime stream
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tables, schema, enabled, router]);
}
