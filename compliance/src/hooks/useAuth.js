// holder styrer på login status 
import { useEffect, useState } from 'react';
import { supabase } from '../lib/SupabaseClient.js';

export function useAuth() {
    const  [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        // fetch current user 
    (async () => {
        try {
        const { data: { user } } = await supabase.auth.getUser();
        if (isMounted) {
            setUser(user) ?? null;
            setReady(true);
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        if (isMounted) setReady(true);
    }
    })();

        // auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (isMounted) {
                    setUser(session?.user ?? null);
                }
            });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    return { user, ready };
}


