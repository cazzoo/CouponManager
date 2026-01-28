/**
 * SupabaseClient compatibility layer
 * Re-exports PocketBaseClient as SupabaseClient for backward compatibility
 */

import PocketBaseClient from './PocketBaseClient';

// Re-export PocketBaseClient as SupabaseClient for compatibility
export default PocketBaseClient;

// Export the getInstance method for direct access
export const supabase = PocketBaseClient.getInstance();
