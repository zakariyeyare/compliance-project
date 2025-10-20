Supabase setup

1. Install dependencies:

   npm install

2. Create a `.env` file in the project root with these values:

REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

3. Use the client in your app:

import supabase from './lib/SupabaseClient';

// Example sign-in
await supabase.signIn('email@example.com', 'password');
