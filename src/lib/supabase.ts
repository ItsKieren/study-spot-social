// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

console.log("--- src/lib/supabase.ts: MODULE LOADED ---"); // Log module load

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the values read from .env
console.log("supabase.ts: Reading VITE_SUPABASE_URL =", supabaseUrl);
console.log("supabase.ts: Reading VITE_SUPABASE_ANON_KEY =", supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + "..." : undefined); // Mask key for safety

let supabaseInstance: SupabaseClient | null = null; // Initialize as null
let initializationError: string | null = null;

// Validate environment variables
if (!supabaseUrl) {
  initializationError = 'VITE_SUPABASE_URL is missing or empty in .env file.';
  console.error("supabase.ts:", initializationError);
} else if (!supabaseAnonKey) {
  initializationError = 'VITE_SUPABASE_ANON_KEY is missing or empty in .env file.';
  console.error("supabase.ts:", initializationError);
} else if (!supabaseAnonKey.startsWith('eyJ')) {
  initializationError = 'VITE_SUPABASE_ANON_KEY seems invalid (must start with "eyJ"). Please check .env file.';
  console.error("supabase.ts:", initializationError);
}

// Attempt to create the client only if validation passes
if (!initializationError) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log("supabase.ts: Supabase client CREATED successfully.");
  } catch (error) {
    initializationError = `Failed to initialize Supabase client during createClient: ${error instanceof Error ? error.message : String(error)}`;
    console.error("supabase.ts: ERROR during createClient:", error);
    supabaseInstance = null; // Ensure instance is null on error
  }
}

// Export either the real instance or the mock object
export const supabase = supabaseInstance !== null && !initializationError
  ? supabaseInstance // Use the real instance if creation succeeded
  : (() => { // Otherwise, create and return the mock
      console.warn(`supabase.ts: Using MOCK Supabase client. Reason: ${initializationError || 'Unknown initialization issue.'}`);
      const mockMessage = initializationError || 'Supabase not configured';
      const mockError = { name: 'ConfigError', message: mockMessage };
      // Return a mock object that prevents crashes
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
          const tableError = { message: `Mock Supabase: ${mockMessage} (table: ${table})`, details: '', hint: '', code: 'MOCK' };
          return ({
            select: async () => ({ data: null, error: tableError }),
            insert: async () => ({ data: null, error: tableError }),
            update: async () => ({ data: null, error: tableError }),
            delete: async () => ({ data: null, error: tableError }),
            eq: () => mockSupabase.from(table),
            single: () => Promise.resolve({ data: null, error: tableError })
          })
        },
      };
      return mockSupabase as any;
    })();