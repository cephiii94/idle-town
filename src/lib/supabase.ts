import { createClient } from '@supabase/supabase-js';

// Ambil variabel dari environment (.env)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Inisialisasi client Supabase
// Ini digunakan untuk interaksi dengan database dan autentikasi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
