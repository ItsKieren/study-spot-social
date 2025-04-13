// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

console.log("--- src/lib/supabase.ts: MODULE LOADED ---"); // <-- NEW TOP LOG

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("supabase.ts: VITE_SUPABASE_URL =", supabaseUrl);
console.log("supabase.ts: VITE_SUPABASE_ANON_KEY =", supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + "..." : undefined);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("FATAL ERROR: Supabase URL or Anon Key is missing in .env file!");
  throw new Error("Supabase URL or Anon Key is missing. Check .env file and ensure Vite is loading it.");
}

if (!supabaseAnonKey.startsWith('eyJ')) {
    console.error("FATAL ERROR: VITE_SUPABASE_ANON_KEY seems invalid (must start with 'eyJ'). Please check .env file.");
    throw new Error("Invalid Supabase Anon Key format.");
}

let supabaseInstance: SupabaseClient;

try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("supabase.ts: Supabase client CREATED successfully.");
} catch (error) {
    console.error("FATAL ERROR: Failed to create Supabase client:", error);
    throw new Error(`Failed to initialize Supabase client: ${error instanceof Error ? error.message : String(error)}`);
}

export const supabase = supabaseInstance;