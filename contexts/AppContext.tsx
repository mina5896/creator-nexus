import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface AppUser extends SupabaseUser {
  name: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  compensationType: 'paid' | 'experience';
  hourlyRate?: number;
}

// Add the refetch function to the context's type definition
interface AppContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  refetchUser: () => void; // Expose a refetch function
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (session: Session | null) => {
    if (session?.user) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single(); // Use .single() to get one record or null

        if (error) {
          throw error;
        }

        if (profile) {
          setUser({
            ...(session.user),
            name: profile.name,
            bio: profile.bio,
            avatarUrl: profile.avatar_url,
            skills: profile.skills || [],
            compensationType: profile.compensation_type,
            hourlyRate: profile.hourly_rate,
          });
        } else {
           setUser(null);
        }
      } catch (error) {
        console.error('Exception fetching profile:', error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // This function will be called from the profile page
  const refetchUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetchProfile(session);
  }, [fetchProfile]);


  useEffect(() => {
    // This is the original auth state change handler
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => { // The timeout you wanted to keep
        setSession(session);
        fetchProfile(session);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Add refetchUser to the value provided by the context
  const value = { user, session, loading, refetchUser };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};