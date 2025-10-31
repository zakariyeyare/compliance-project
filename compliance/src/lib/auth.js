import supabase from './SupabaseClient.js';

// Selv-registrering er slået fra – brug admin backend til at oprette brugere
export async function signUp() {
  const err = new Error('Selv-registrering er deaktiveret. Kontakt administratoren.');
  err.code = 'signup-disabled';
  throw err;
}

// Brugerlogin (trin 1): send 6-cifret kode til e-mail
export async function requestUserCode(email) {
  const e = email.trim().toLowerCase();
  const { error } = await supabase.auth.signInWithOtp({
    email: e,
    options: { shouldCreateUser: false }
  });
  if (error) throw error;
  return true;
}

// Brugerlogin (trin 2): verificér 6-cifret kode
export async function verifyUserCode(email, code) {
  const e = email.trim().toLowerCase();
  const token = String(code).trim();
  if (token.length !== 6) {
    const err = new Error('Koden skal være 6 cifre.');
    err.code = 'invalid-otp-length';
    throw err;
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: e,
    token,
    type: 'email'
  });
  if (error) throw error;
  return data.user ?? null;
}

// Admin-login (email + password)
export async function adminSignIn(email, password) {
  const e = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: e, password });
  if (error) throw error;
  return data.user ?? null;
}

// Log ud
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Hent nuværende bruger
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}
