
import React from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="flex h-screen bg-brand-background">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
