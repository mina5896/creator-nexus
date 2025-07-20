import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Spinner from '../ui/Spinner';
import MainLayout from './MainLayout';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAppContext();

  if (loading) {
    // Show a full-screen spinner while the context is loading the session.
    // This prevents the redirect-to-dashboard issue.
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // If loading is finished and there's no user, redirect to login.
    return <Navigate to="/login" replace />;
  }
  
  const handleLogout = async () => {
      const { supabase } = await import('../../supabaseClient');
      await supabase.auth.signOut();
  };

  // If loading is finished and there IS a user, render the main layout and its content.
  return (
    <MainLayout onLogout={handleLogout}>
        <Outlet />
    </MainLayout>
  );
};

export default ProtectedRoute;
