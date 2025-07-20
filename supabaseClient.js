import { createClient } from '@supabase/supabase-js'

// Use Vite's syntax for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add a check to give a clearer error if the variables aren't loaded
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and/or anon key are missing. Make sure you have a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, and have restarted the dev server.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
