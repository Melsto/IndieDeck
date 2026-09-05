import { createClient } from "@supabase/supabase-js";

export function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server Supabase configuration is missing.");
  return createClient(url, key, { auth: { persistSession: false } });
}

export function storageBucket() {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET;
  if (!bucket) throw new Error("Supabase storage bucket is missing.");
  return bucket;
}