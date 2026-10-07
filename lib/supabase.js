import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ quiet: true });

const missing = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'].filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing ${missing.join(' and ')} in .env. Copy .env.example to .env and fill it in.`);
  process.exit(1);
}

// Keep only https://<project>.supabase.co, even if the URL was pasted with /rest/v1/ on the end.
const projectUrl = new URL(process.env.SUPABASE_URL).origin;

// Server-side only: the secret key bypasses Row Level Security, so it must never reach the browser.
export const supabase = createClient(projectUrl, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

export const SPOT_COLUMNS = 'id,name,lat,lng,vehicles,price_amount,price_currency,phone,is_sample';
