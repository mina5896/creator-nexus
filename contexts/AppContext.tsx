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
  session: Session | null; // Add session back to the type
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Add state for session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange is the single source of truth. It fires immediately
    // with the current session and then listens for all subsequent changes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session); // Set the session state
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
        // The loading is finished after the first event is handled.
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = { user, session, loading }; // Add session to the context value

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

