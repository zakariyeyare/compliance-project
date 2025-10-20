import { createClient } from '@supabase/supabase-js';

// Simple Supabase wrapper class
class SupabaseClient {
  constructor() {
    const url = process.env.REACT_APP_SUPABASE_URL || '';
    const key = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      console.warn('Supabase URL or Key not provided. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file');
    }

    this.client = createClient(url, key);
  }

  // Auth helper methods
  async signUp(email, password) {
    return this.client.auth.signUp({ email, password });
  }

  async signIn(email, password) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.client.auth.signOut();
  }

  // Generic query helper
  from(table) {
    return this.client.from(table);
  }
}

const supabase = new SupabaseClient();
export default supabase;