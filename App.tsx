
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AppProvider>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignupPage onSignup={handleLogin} />} />
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
