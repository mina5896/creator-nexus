import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

const PublicRoute: React.FC = () => {
  const { user, loading } = useAppContext();

  // We wait until the initial loading is done to prevent a brief flash of the login page.
  if (loading) {
    return null; // Or a full-screen spinner if you prefer
  }

  // If loading is finished and there IS a user, redirect away from the public page.
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;
