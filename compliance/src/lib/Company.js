import supabase from './SupabaseClient.js';

// Brug denne statiske liste hvis du ikke har en standards-tabel endnu
export function getStaticStandards() {
  return [
    { id: '1', name: 'ISAE 3000 GDPR' },
  ];
}

// Hvis du har en 'standards' tabel, kan du bruge denne i stedet
export async function listStandards() {
  const { data, error } = await supabase
    .from('standards')
    .select('id,name')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function createCompany({ name, standardId }) {
  const payload = { name, ...(standardId ? { standard_id: standardId } : {}) };
  const { data, error } = await supabase
    .from('companies')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function attachCurrentUserAsOwner(companyId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) throw new Error('Ingen aktiv bruger');

  const { error } = await supabase
    .from('user_companies')
    .insert({ user_id: user.id, company_id: companyId, role: 'owner' });
  if (error) throw error;
  return true;
}
