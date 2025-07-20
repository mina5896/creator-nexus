import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Session } from '@supabase/supabase-js';

export interface AppUser extends User {
  name: string;
  bio: string;
  avatarUrl: string;
  skills: string[];
  compensationType: 'paid' | 'experience';
  hourlyRate?: number;
}

interface AppContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange is the single source of truth. It fires immediately with
    // the current session and then listens for any future changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(profile ? {
          ...(session.user),
          name: profile.name,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
          skills: profile.skills || [],
          compensationType: profile.compensation_type,
          hourlyRate: profile.hourly_rate,
        } : null);
      } else {
        setUser(null);
      }
      // Once the session is processed, the app is no longer loading.
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  const value = { user, session, loading };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};