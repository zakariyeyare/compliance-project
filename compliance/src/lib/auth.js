import supabase from './SupabaseClient.js';

// SIGN UP (opret bruger)
export async function signUp(email, password, fullName) {
  // Opret auth-bruger
  // trim og lowercase email
  const e = email.trim().toLowerCase();
  const n = fullName?.trim() ?? '';

  console.log("Email sendes til Supabase:", e);

  const { data, error } = await supabase.auth.signUp({ email: e, password, options: { data: { full_name: n } }});
  if (error) throw error;

  // email allerede i systemet
  if (data?.user && data.user.identities.length === 0) {
    const err = new Error("Denne e-mail findes allerede. Log ind i stedet.");
    err.code = "email-already-in-use";
    throw err;
  }

  // Opdater profil (trigger opretter profiles-række automatisk)
  const userId = data.user?.id;
  if (userId && fullName) {
    const { error: upErr } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', userId);
    if (upErr) throw upErr;
  }

  return data;
}

// sign in
export async function signIn(email, password) {
    const e = email.trim().toLowerCase();
    const { user, error } = await supabase.auth.signInWithPassword({ email: e, password });
    if (error) throw error;
    return user;
    }

// sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    }

// get current user (session)
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
}
