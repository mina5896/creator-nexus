import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient'; // Import the Supabase client
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import FindTalentPage from './pages/FindTalentPage';
import MessagesPage from './pages/MessagesPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import LoginPage from './pages/LoginPage';
import { AppProvider } from './contexts/AppContext';
import CreateProjectPage from './pages/CreateProjectPage';
import PortfolioItemDetailsPage from './pages/PortfolioItemDetailsPage';
import SignupPage from './pages/SignupPage';
import MyProfilePage from './pages/MyProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import InvitesPage from './pages/InvitesPage';
import ConceptBoardPage from './pages/ConceptBoardPage';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check for an active session when the component mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes in authentication state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Logout handler for MainLayout
  const handleLogout = () => {
    supabase.auth.signOut();
  };

  return (
    <AppProvider>
      {!session ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <MainLayout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-project" element={<CreateProjectPage />} />
            <Route path="/create/concept" element={<ConceptBoardPage />} />
            <Route path="/project/:id" element={<ProjectDetailsPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/:id" element={<PortfolioItemDetailsPage />} />
            <Route path="/find-talent" element={<FindTalentPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/invites" element={<InvitesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/profile/:userId" element={<PublicProfilePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      )}
    </AppProvider>
  );
};

export default App;