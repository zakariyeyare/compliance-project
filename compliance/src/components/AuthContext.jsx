import { useEffect, useState } from 'react';
import Supabase from '../SupabaseClient';
import { AuthContext } from './AuthContextBase';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await Supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = Supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await Supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await Supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await Supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email) => {
    const { data, error } = await Supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const createUserOrganization = async (orgName) => {
    try {
      const { data: userData } = await Supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      // Create organization
      const { data: orgData, error: orgError } = await Supabase
        .from('organizations')
        .insert({
          name: orgName || 'My Organization',
          created_by: userData.user.id
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as member
      const { error: memberError } = await Supabase
        .from('org_members')
        .insert({
          org_id: orgData.id,
          user_id: userData.user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      return { data: orgData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    createUserOrganization,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;