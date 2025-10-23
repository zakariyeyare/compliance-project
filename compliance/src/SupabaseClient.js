import { createClient } from '@supabase/supabase-js';

export const Supabase = createClient(
    "https://ruohzjmsyoyuwdghusfq.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1b2h6am1zeW95dXdkZ2h1c2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNTI3MjAsImV4cCI6MjA3NDYyODcyMH0.57g6XDQExWQXF0ZPG5LUlU8IQtX50USAJQ_tKncnGts"
);
export default Supabase;
