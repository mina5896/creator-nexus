import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute'; // Import the new PublicRoute

const App: React.FC = () => {
  return (
    <AppProvider>
      <Routes>
        {/* --- Public Routes --- */}
        {/* Only accessible to logged-out users */}
        <Route path="/" element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* --- Protected Routes --- */}
        {/* Only accessible to logged-in users */}
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="create-project" element={<CreateProjectPage />} />
          <Route path="create/concept" element={<ConceptBoardPage />} />
          <Route path="project/:id" element={<ProjectDetailsPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="portfolio/:id" element={<PortfolioItemDetailsPage />} />
          <Route path="find-talent" element={<FindTalentPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="invites" element={<InvitesPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="profile" element={<MyProfilePage />} />
          <Route path="profile/:userId" element={<PublicProfilePage />} />
        </Route>
        
        {/* --- Fallback Route --- */}
        {/* If no other route matches, this will handle the initial redirect */}
        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>
    </AppProvider>
  );
};

export default App;
