import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext, AppProvider } from './contexts/AppContext';
import MainLayout from './components/layout/MainLayout';
import Spinner from './components/ui/Spinner';
import { supabase } from './supabaseClient';

// Import all your pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import FindTalentPage from './pages/FindTalentPage';
import MessagesPage from './pages/MessagesPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import PortfolioItemDetailsPage from './pages/PortfolioItemDetailsPage';
import MyProfilePage from './pages/MyProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import InvitesPage from './pages/InvitesPage';
import ConceptBoardPage from './pages/ConceptBoardPage';

// This new component handles all the routing logic based on the auth state.
const AppRoutes: React.FC = () => {
  const { user, loading } = useAppContext();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Show a spinner while the session is being loaded.
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // If a user is logged in, show the protected routes inside the main layout.
  if (user) {
    return (
      <MainLayout onLogout={handleLogout}>
        <Routes>
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
    );
  }

  // If no user is logged in, show the public routes.
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// The main App component now simply wraps the AppRoutes in the provider.
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

export default App;