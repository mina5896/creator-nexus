import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '../types'; // Your existing User type

// Define the shape of the context
interface AppContextType {
  user: User | null; // User can be null if not logged in or loading
  loading: boolean;
  refreshUserProfile: () => Promise<void>; // Function to allow components to trigger a profile refresh
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create the provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    console.log("Attempting to fetch user profile...");
    // Get the session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("AppContext: Error getting session:", sessionError);
      return null;
    }

    if (session?.user) {
      console.log("AppContext: Session found for user:", session.user.id);
      // If a session exists, fetch the corresponding profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          bio,
          avatar_url,
          skills,
          compensation_type,
          hourly_rate
        `)
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error("AppContext: Error fetching profile from database:", profileError);
        return null;
      }
      
      console.log("AppContext: Profile successfully fetched:", profile);
      
      // Map Supabase snake_case to our camelCase User type
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        skills: profile.skills,
        compensationType: profile.compensation_type,
        hourlyRate: profile.hourly_rate
      } as User;
    }
    console.log("AppContext: No active session found.");
    return null;
  }, []);

  const refreshUserProfile = useCallback(async () => {
    setLoading(true);
    const refreshedUser = await fetchUserProfile();
    setUser(refreshedUser);
    setLoading(false);
  }, [fetchUserProfile]);

  useEffect(() => {
    refreshUserProfile(); // Fetch initial profile

    // Set up a listener for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`AppContext: onAuthStateChange event: ${event}`);
      if (event === 'SIGNED_IN' && session?.user) {
        await refreshUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Clean up the subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUserProfile]);

  const value = {
    user,
    loading,
    refreshUserProfile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

