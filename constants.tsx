import React from 'react';

export const ICONS = {
    dashboard: <LayoutGrid className="h-5 w-5" />,
    portfolio: <Briefcase className="h-5 w-5" />,
    find: <Users className="h-5 w-5" />,
    messages: <MessageSquare className="h-5 w-5" />,
    profile: <UserCircle className="h-5 w-5" />,
    logout: <LogOut className="h-5 w-5" />,
    trash: <TrashIcon className="h-4 w-4" />,
    compass: <Compass className="h-5 w-5" />,
    mail: <Mail className="h-5 w-5" />,
    clipboardCheck: <ClipboardCheckIcon className="h-5 w-5" />,
    sparkles: <SparklesIcon className="h-5 w-5" />,
};

export const CREATIVE_ROLES: Record<string, string[]> = {
  'Visual Arts': ['Concept Artist', 'Illustrator', '3D Modeler', 'Animator', 'VFX Artist', 'UI/UX Designer', 'Graphic Designer', 'Character Designer', 'Environment Art', 'Storyboarding'],
  'Audio': ['Sound Designer', 'Composer', 'Voice Actor', 'Audio Engineer'],
  'Writing': ['Scriptwriter', 'Narrative Designer', 'Copywriter', 'Technical Writer'],
  'Development': ['Game Developer', 'Frontend Developer', 'Backend Developer', 'Engine Programmer'],
  'Production': ['Project Manager', 'Producer', 'QA Tester'],
};

export const AVATARS = [
  'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  'https://i.pravatar.cc/150?u=a042581f4e29026704e',
  'https://i.pravatar.cc/150?u=a042581f4e29026704f',
  'https://i.pravatar.cc/150?u=a042581f4e29026704a',
  'https://i.pravatar.cc/150?u=a042581f4e29026704b',
  'https://i.pravatar.cc/150?u=a042581f4e29026704c',
];


// Icon components from lucide-react (or similar) as JSX
function LayoutGrid({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>
  );
}

function Briefcase({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
  );
}

function Users({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  );
}

function MessageSquare({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  );
}

function LogOut({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
  );
}

function UserCircle({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
    );
}

function TrashIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  );
}

function Compass({ className }: { className: string }) {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
  );
}

function Mail({ className }: { className: string }) {
  return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
  );
}

function ClipboardCheckIcon({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="m9 14 2 2 4-4"></path></svg>
  );
}

function SparklesIcon({ className }: { className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.93 2.25 12 7.5l2.07-5.25a.5.5 0 0 1 .9 0L17.25 7.5 21.75 9l-4.5 1.75L15 16.5l-2.07 5.25a.5.5 0 0 1-.9 0L9.75 16.5 5.25 15l4.5-1.75L12 7.5Z"></path></svg>
    );
}