import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://ixjdjvkktlzgiyojnsto.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_Qb66X-cvzAckaQev2ku1VA__CoLmIB1';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  db: { schema: 'portfolio' },
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

export const db = supabase.schema('portfolio');
