// her lavet database far supabasen kald for at invitere bruger
import supabase from './SupabaseClient.js';

// INVITE USER (inviter bruger)
export async function inviteUser(email, role) {
  const e = email.trim().toLowerCase();

  console.log("Inviterer bruger med email:", e);

  // Tilføj bruger til 'invitations' tabel
  const { data, error } = await supabase
    .from('invitations')
    .insert([{ email: e, role }]);

  if (error) throw error;

  return data;
}
// CHECK INVITATION (tjek invitation)
