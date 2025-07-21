import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ICONS } from '../../constants';
import { useAppContext } from '../../contexts/AppContext';
import { supabase } from '../../supabaseClient';

interface SidebarProps {
  onLogout: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  badgeCount?: number;
  badgeTitle?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, badgeCount, badgeTitle }) => {
    const activeClass = "bg-brand-primary text-white";
    const inactiveClass = "text-brand-text-muted hover:bg-brand-surface hover:text-brand-text";

    return (
        <NavLink
            to={to}
            title={badgeTitle}
            className={({ isActive }) => `${isActive ? activeClass : inactiveClass} flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200`}
        >
            <div className="flex items-center">
                {icon}
                <span className="ml-4 font-medium">{children}</span>
            </div>
            {badgeCount && badgeCount > 0 && (
                <span className="bg-brand-secondary text-brand-background text-xs font-bold px-2 py-0.5 rounded-full">{badgeCount}</span>
            )}
        </NavLink>
    );
};

const UserProfileLink: React.FC = () => {
    const { user, loading } = useAppContext();

    if (loading) {
        return (
             <div className="block p-3 mb-6 rounded-lg bg-brand-subtle/30 animate-pulse">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-subtle"></div>
                    <div>
                        <div className="h-4 w-28 bg-brand-subtle rounded"></div>
                        <div className="h-3 w-36 bg-brand-subtle rounded mt-1"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) return null;

    return (
        <Link to="/profile" className="block p-3 mb-6 rounded-lg bg-brand-subtle/30 hover:bg-brand-subtle transition-colors">
            <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="min-w-0">
                    <p className="font-semibold text-brand-text leading-tight truncate">{user.name}</p>
                    <p className="text-xs text-brand-text-muted leading-tight truncate">{user.email}</p>
                </div>
            </div>
        </Link>
    );
};

// Define the new Prism logo as a reusable component
const Logo: React.FC<{className?: string}> = ({ className }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8A5CF4" />
                <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
        </defs>
        <path d="M 50,10 L 90,80 L 10,80 Z" fill="url(#logoGradient)" />
    </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { user } = useAppContext();
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      // Fetch pending invites count
      const { count: invitesCount, error: invitesError } = await supabase
        .from('invites')
        .select('*', { count: 'exact', head: true })
        .eq('to_user_id', user.id)
        .eq('status', 'pending');
      
      if (invitesError) console.error("Error fetching invites count:", invitesError);
      else setPendingInvitesCount(invitesCount || 0);

      // Fetch pending applications count for user's projects
      const { data: ownedProjects, error: projectsError } = await supabase
        .from('projects')
        .select('id')
        .eq('owner_id', user.id);
      
      if (projectsError) {
        console.error("Error fetching owned projects:", projectsError);
        return;
      }
      
      if (ownedProjects && ownedProjects.length > 0) {
        const projectIds = ownedProjects.map(p => p.id);
        const { count: appsCount, error: appsError } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('project_id', projectIds)
          .eq('status', 'pending');
        
        if (appsError) console.error("Error fetching applications count:", appsError);
        else setPendingApplicationsCount(appsCount || 0);
      }
    };

    fetchCounts();
    
  }, [user?.id]);

  return (
    <aside className="w-64 bg-brand-surface p-6 flex flex-col justify-between border-r border-brand-subtle">
      <div>
        <div className="flex items-center mb-8">
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-bold ml-3 text-brand-text">Prism</h1>
        </div>
        <UserProfileLink />
        <nav className="space-y-2">
          <NavItem 
            to="/dashboard" 
            icon={ICONS.dashboard} 
            badgeCount={pendingApplicationsCount}
            badgeTitle={pendingApplicationsCount > 0 ? `${pendingApplicationsCount} pending application(s)` : 'Dashboard'}
          >
            Dashboard
          </NavItem>
          <NavItem to="/discover" icon={ICONS.compass}>Discover</NavItem>
          <NavItem to="/invites" icon={ICONS.mail} badgeCount={pendingInvitesCount}>Invites</NavItem>
          <NavItem to="/portfolio" icon={ICONS.portfolio}>My Portfolio</NavItem>
          <NavItem to="/find-talent" icon={ICONS.find}>Find Talent</NavItem>
          <NavItem to="/messages" icon={ICONS.messages}>Messages</NavItem>
        </nav>
      </div>
      <div>
        <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-brand-text-muted hover:bg-brand-surface hover:text-brand-text rounded-lg transition-colors duration-200"
        >
            {ICONS.logout}
            <span className="ml-4 font-medium">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;