import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Query cache implementation
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      queryCache.delete(key);
    }
  }
}, CACHE_DURATION);

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'sla_session',
    storage: window.localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'Cache-Control': 'max-age=300' }
  }
});

// Cached query helper
export const cachedQuery = async <T>(
  key: string,
  queryFn: () => Promise<{ data: T; error: any }>,
  options?: { forceFresh?: boolean }
): Promise<{ data: T | null; error: any }> => {
  const cached = queryCache.get(key);
  
  if (!options?.forceFresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return { data: cached.data, error: null };
  }

  try {
    const { data, error } = await queryFn();
    if (!error && data) {
      queryCache.set(key, { data, timestamp: Date.now() });
    }
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Batch query helper
export const batchQuery = async <T>(
  queries: Array<() => Promise<{ data: any; error: any }>>,
  options?: { forceFresh?: boolean }
): Promise<Array<{ data: T | null; error: any }>> => {
  return Promise.all(queries.map(query => query()));
};

// Cache invalidation helper
export const invalidateCache = (pattern?: string) => {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of queryCache.keys()) {
      if (regex.test(key)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
};