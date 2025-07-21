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
    console.log('AppContext useEffect running'); // Added log
    // onAuthStateChange is the single source of truth. It fires immediately with
    // the current session and then listens for any future changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => { 
      setTimeout(async () => {
      console.log('Auth state changed:', _event, session); // Added log
      console.log('Session in onAuthStateChange:', session); // Added log
      setSession(session);
      console.log('Session state set'); // Added log

      if (session?.user) {
        console.log('session.user exists:', session.user); // Added log

        // Explicitly get session to ensure it is available
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Current session after getSession:', currentSession); // Added log

        if (currentSession?.user) {
          console.log('Current session user exists.'); // Added log
          console.log('Attempting to fetch profile...'); // Added log
          console.log('Fetching profile for user:', currentSession.user.id); // Added log
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id);

            if (error) {
              console.error('Error fetching profile:', error); // Added error log
            } else {
              console.log('Profile fetched:', profile); // Added success log
            }

            // Check if profile data exists and is not empty before setting user
            if (profile && profile.length > 0) {
              setUser({
                ...(currentSession.user),
                name: profile[0].name,
                bio: profile[0].bio,
                avatarUrl: profile[0].avatar_url,
                skills: profile[0].skills || [],
                compensationType: profile[0].compensation_type,
                hourlyRate: profile[0].hourly_rate,
              });
              console.log('User state set'); // Added log
            } else {
              setUser(null);
              console.log('No profile data found, setting user state to null'); // Added log
            }
          } catch (error) {
            console.error('Exception fetching profile:', error); // Catch and log any exceptions
          }
        } else {
          setUser(null);
          console.log('No current session user, setting user state to null'); // Added log
        }
      } else {
        setUser(null);
        console.log('No session user, setting user state to null'); // Added log
      }
      // Once the session is processed, the app is no longer loading.
      setLoading(false);
      console.log('Loading state set to false'); // Added log
    }, 0)}); // Use setTimeout to ensure this runs after the current call stack

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