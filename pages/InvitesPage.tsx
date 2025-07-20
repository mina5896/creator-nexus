import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Project } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';

// --- Helper Type for Fetched Data ---
interface FetchedInvite {
  id: string;
  projectId: string;
  role: string;
  from: {
    id: string;
    name: string;
  };
  project: {
    id: string;
    title: string;
    description: string;
    team: {
        profile: {
            id: string;
            name: string;
            avatar_url: string;
        }
        role: string;
    }[];
  } | null;
}

const ChevronDownIcon = ({ className }: { className: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const InviteCard: React.FC<{ invite: FetchedInvite; onAccept: () => void; onDecline: () => void; }> = ({ invite, onAccept, onDecline }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!invite.project) {
        return (
            <Card className="!p-4 opacity-70">
                <p className="text-brand-text-muted">Could not load details for an invite. The project may have been deleted.</p>
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
                        <Link to={`/profile/${invite.from.id}`} className="font-bold text-brand-text hover:underline">{invite.from.name}</Link> has invited you to be the <span className="font-bold text-brand-secondary">{invite.role}</span> on their project:
                    </p>
                    <h3 className="text-xl font-bold text-brand-text mt-1">{invite.project.title}</h3>
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
                        <p className="text-sm text-brand-text-muted">{invite.project.description}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-brand-text mb-2">Current Team</h4>
                        <div className="flex flex-wrap gap-4">
                            {invite.project.team.map((member, index) => (
                                 <Link to={`/profile/${member.profile.id}`} key={index} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                                    <img src={member.profile.avatar_url} alt={member.profile.name} className="w-8 h-8 object-cover rounded-full" />
                                    <div>
                                        <p className="text-sm font-semibold text-brand-text">{member.profile.name}</p>
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
  const { user } = useAppContext();
  const [invites, setInvites] = useState<FetchedInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const { data, error } = await supabase
        .from('invites')
        .select(`
            id,
            projectId: project_id,
            role,
            from: profiles!from_user_id(id, name),
            project: projects!project_id(
                id,
                title,
                description,
                team:project_team_members(role, profile:profiles!user_id(id, name, avatar_url))
            )
        `)
        .eq('to_user_id', user.id)
        .eq('status', 'pending');

    if (error) {
        console.error("Error fetching invites:", error);
    } else {
        setInvites(data as any);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleAcceptInvite = async (invite: FetchedInvite) => {
    if (!user) return;
    const { error } = await supabase.rpc('accept_invite', {
        p_invite_id: invite.id,
        p_project_id: invite.projectId,
        p_user_id: user.id,
        p_role_name: invite.role,
    });
    if (error) alert(`Error accepting invite: ${error.message}`);
    else {
        alert("You've joined the project!");
        fetchInvites(); // Refresh the list
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    const { error } = await supabase.from('invites').delete().eq('id', inviteId);
    if (error) alert(`Error declining invite: ${error.message}`);
    else fetchInvites(); // Refresh the list
  };

  if (loading) return <div className="flex justify-center py-8"><Spinner size="lg"/></div>;

  return (
    <div>
        <h1 className="text-3xl font-bold text-brand-text mb-2">Project Invites</h1>
        <p className="text-brand-text-muted mb-8">Here are the projects waiting for your creative touch.</p>

        {invites.length > 0 ? (
            <div className="space-y-4">
                {invites.map(invite => (
                    <InviteCard 
                        key={invite.id} 
                        invite={invite} 
                        onAccept={() => handleAcceptInvite(invite)}
                        onDecline={() => handleDeclineInvite(invite.id)}
                    />
                ))}
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
