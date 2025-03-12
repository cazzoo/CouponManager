import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Detect if we're in Node.js environment
const isNode: boolean = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

let supabaseUrl: string;
let supabaseKey: string;

if (isNode) {
  // Node.js environment (scripts)
  try {
    // Dynamic import for dotenv (ESM)
    await import('dotenv/config');
    supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    // Try both environment variable names
    supabaseKey = process.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  } catch (error) {
    console.error('Error loading environment variables:', error);
    supabaseUrl = '';
    supabaseKey = '';
  }
} else {
  // Browser environment
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  // Try both environment variable names
  supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

// Use fallback URL if not defined
supabaseUrl = supabaseUrl || 'https://xovlwgnfhtnycavejtzd.supabase.co';

// Validate that the key exists in production
if ((!isNode && process.env.NODE_ENV === 'production' && !supabaseKey) ||
    (isNode && !supabaseKey)) {
  console.error('Missing Supabase key. Please check your environment variables.');
  console.error('Expected either VITE_SUPABASE_KEY or VITE_SUPABASE_ANON_KEY to be defined.');
}

// Create and export the Supabase client
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase; 