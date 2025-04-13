// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

console.log("--- src/lib/supabase.ts: MODULE LOADED ---");

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the values *as read by Vite*
console.log("supabase.ts: VITE_SUPABASE_URL read as:", supabaseUrl);
console.log("supabase.ts: VITE_SUPABASE_ANON_KEY read as:", supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : '(Not found or empty)');

let supabaseInstance: SupabaseClient | null = null;
let initializationError: string | null = null;

// --- Strict Validation ---
if (!supabaseUrl || typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
  initializationError = 'VITE_SUPABASE_URL is missing, empty, or not a string in environment variables.';
  console.error("supabase.ts: VALIDATION FAILED:", initializationError);
} else if (!supabaseAnonKey || typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
  initializationError = 'VITE_SUPABASE_ANON_KEY is missing, empty, or not a string in environment variables.';
  console.error("supabase.ts: VALIDATION FAILED:", initializationError);
} else if (!supabaseAnonKey.startsWith('eyJ')) {
  initializationError = 'VITE_SUPABASE_ANON_KEY seems invalid (does not start with "eyJ"). Please verify.';
  console.error("supabase.ts: VALIDATION FAILED:", initializationError);
} else {
   console.log("supabase.ts: Environment variables seem present and superficially valid.");
}
// --- End Strict Validation ---


// Attempt to create the client only if validation passes
if (!initializationError) {
  try {
    console.log("supabase.ts: Attempting createClient...");
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("supabase.ts: Supabase client CREATED successfully.");
  } catch (error) {
    initializationError = `Failed to initialize Supabase client during createClient: ${error instanceof Error ? error.message : String(error)}`;
    console.error("supabase.ts: ERROR during createClient:", error);
    supabaseInstance = null;
  }
} else {
   console.error("supabase.ts: Skipping createClient due to validation errors.");
   supabaseInstance = null;
}

// --- Mock Client Logic ---
const createMockSupabase = (reason: string) => {
    console.warn(`supabase.ts: Using MOCK Supabase client. Reason: ${reason}`);
    const mockMessage = reason || 'Supabase not configured';
    const mockError = { name: 'ConfigError', message: mockMessage, status: 500 };

    const mockSupabase = {
      auth: {
        getSession: async () => { console.warn("Mock Supabase: getSession called"); return ({ data: { session: null }, error: mockError }) },
        onAuthStateChange: () => { console.warn("Mock Supabase: onAuthStateChange called"); return ({ data: { subscription: { unsubscribe: () => {} } } }) },
        signInWithPassword: async () => { console.warn("Mock Supabase: signInWithPassword called"); return ({ data: { user: null, session: null}, error: mockError }) },
        signUp: async () => { console.warn("Mock Supabase: signUp called"); return ({ data: { user: null, session: null}, error: mockError }) },
        signInWithOAuth: async () => { console.warn("Mock Supabase: signInWithOAuth called"); return ({ data: { provider: '', url: ''}, error: mockError }) },
        signOut: async () => { console.warn("Mock Supabase: signOut called"); return ({ error: mockError }) },
        getUser: async () => { console.warn("Mock Supabase: getUser called"); return ({ data: { user: null }, error: mockError }) },
      },
      from: (table: string) => {
        console.warn(`Mock Supabase: from('${table}') called`);
        const tableError = { message: `Mock Supabase: ${mockMessage} (table: ${table})`, details: '', hint: '', code: 'MOCK', status: 500 };
        return ({ /* ... mock methods ... */ });
      },
      storage: { from: (bucket: string) => { /* ... mock methods ... */ } }
    };
    return mockSupabase as any;
};
// --- End Mock Client Logic ---

// Export either the real instance or the mock object
export const supabase = supabaseInstance !== null && !initializationError
  ? supabaseInstance
  : createMockSupabase(initializationError || 'Unknown initialization issue.');