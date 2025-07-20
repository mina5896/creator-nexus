import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Invite, Project } from '../types';
import { Link } from 'react-router-dom';

const ChevronDownIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const InviteCard: React.FC<{ invite: Invite; project: Project | undefined; onAccept: () => void; onDecline: () => void; }> = ({ invite, project, onAccept, onDecline }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!project) {
        return (
            <Card className="!p-4 opacity-70">
                <p className="text-brand-text-muted">Could not load details for an invite to "{invite.projectName}". The project may have been deleted.</p>
                 <div className="flex justify-end mt-2">
                    <Button variant="ghost" onClick={onDecline}>Dismiss</Button>
                </div>
            </Card>
        );
    }
    
    return (
        <Card className="!p-4 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <div className="flex-grow">
                    <p className="text-brand-text-muted">
                        <Link to={`/profile/${invite.fromUserId}`} className="font-bold text-brand-text hover:underline">{invite.from}</Link> has invited you to be the <span className="font-bold text-brand-secondary">{invite.role}</span> on their project:
                    </p>
                    <h3 className="text-xl font-bold text-brand-text mt-1">{invite.projectName}</h3>
                </div>
                 <div className="flex space-x-2 shrink-0 self-end sm:self-center">
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onDecline(); }}>Decline</Button>
                    <Button onClick={(e) => { e.stopPropagation(); onAccept(); }}>Accept</Button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-md hover:bg-brand-subtle" aria-label={isExpanded ? "Hide details" : "Show details"}>
                         <ChevronDownIcon className={`w-6 h-6 text-brand-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
             {isExpanded && (
                <div className="mt-4 pt-4 border-t border-brand-subtle animate-fade-in space-y-4">
                    <div>
                        <h4 className="font-semibold text-brand-text mb-1">Project Overview</h4>
                        <p className="text-sm text-brand-text-muted">{project.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-brand-text mb-2">Current Team</h4>
                        <div className="flex flex-wrap gap-4">
                            {project.team.map((member, index) => (
                                 <Link to={`/profile/${member.userId}`} key={index} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                    <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold ring-2 ring-brand-surface" title={member.name}>
                                        <img src={`https://i.pravatar.cc/150?u=${member.userId}`} alt={member.name} className="w-full h-full object-cover rounded-full" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-brand-text">{member.name}</p>
                                        <p className="text-xs text-brand-text-muted">{member.role}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

const InvitesPage: React.FC = () => {
  const { invites, projects, acceptInvite, declineInvite } = useAppContext();
  const pendingInvites = invites.filter(inv => inv.status === 'pending');

  return (
    <div>
        <h1 className="text-3xl font-bold text-brand-text mb-2">Project Invites</h1>
        <p className="text-brand-text-muted mb-8">Here are the projects waiting for your creative touch.</p>

        {pendingInvites.length > 0 ? (
            <div className="space-y-4">
                {pendingInvites.map(invite => {
                    const project = projects.find(p => p.id === invite.projectId);
                    return (
                        <InviteCard 
                            key={invite.id} 
                            invite={invite} 
                            project={project}
                            onAccept={() => acceptInvite(invite.id)}
                            onDecline={() => declineInvite(invite.id)}
                        />
                    );
                })}
            </div>
        ) : (
            <div className="col-span-full text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
                <h3 className="text-xl font-semibold text-brand-text">Your inbox is empty</h3>
                <p className="mt-2 text-brand-text-muted">You have no pending invitations at the moment.</p>
            </div>
        )}
    </div>
  );
};

export default InvitesPage;