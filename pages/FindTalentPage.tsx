import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAppContext } from '../contexts/AppContext';
import { Collaborator } from '../types';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import PortfolioModal from '../components/projects/PortfolioModal';

interface TalentSearchResult {
  role: string;
  candidates: Collaborator[];
}

// A more specific type for the data needed on this page
interface ProjectForTalentSearch {
    id: string;
    title: string;
    description: string;
    rolesNeeded: string[];
}

const CollaboratorCard: React.FC<{ collaborator: Collaborator, onInvite: () => void, onViewPortfolio: () => void }> = ({ collaborator, onInvite, onViewPortfolio }) => (
    <Card className="flex flex-col">
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                 <h3 className="text-xl font-bold text-brand-text">{collaborator.name}</h3>
                 {collaborator.compensationType === 'paid' ? (
                     <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded-full">${collaborator.hourlyRate}/hr</span>
                 ) : (
                     <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-1 rounded-full">Experience</span>
                 )}
            </div>
            <p className="text-brand-secondary font-semibold">{collaborator.role}</p>
            <p className="text-sm text-brand-text-muted mt-1 italic">Specialty: {collaborator.specialty}</p>
            <p className="mt-3 text-sm text-brand-text-muted line-clamp-3">{collaborator.bio}</p>
        </div>
        <div className="mt-6 flex space-x-2">
            <Button onClick={onViewPortfolio} variant="ghost" className="w-full">View Portfolio</Button>
            <Button onClick={onInvite} variant="primary" className="w-full">Invite</Button>
        </div>
    </Card>
);

const FindTalentPage: React.FC = () => {
  const { user } = useAppContext();
  const [projects, setProjects] = useState<ProjectForTalentSearch[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TalentSearchResult[]>([]);
  const [isPortfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);

  useEffect(() => {
      const fetchOwnerProjects = async () => {
          if (!user) return;
          const { data, error } = await supabase
              .from('projects')
              .select('id, title, description, roles_needed:project_roles_needed(role_name)')
              .eq('owner_id', user.id)
              .neq('status', 'completed');
          
          if (error) {
              console.error("Error fetching projects:", error);
          } else {
              const formattedProjects = data.map(p => ({
                  id: p.id,
                  title: p.title,
                  description: p.description,
                  rolesNeeded: p.roles_needed.map((r: any) => r.role_name)
              }));
              setProjects(formattedProjects.filter(p => p.rolesNeeded.length > 0));
          }
      };
      fetchOwnerProjects();
  },  [user?.id]);
  
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      setError("Please select a project with open roles.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setResults([]);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('find-collaborators', {
          body: {
              projectDescription: selectedProject.description,
              rolesNeeded: selectedProject.rolesNeeded
          }
      });
      if (functionError) throw functionError;
      setResults(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while finding collaborators.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInvite = async (role: string) => {
    if (!selectedProjectId) return;
    // Note: In a real app, you'd have a UI to select a specific user to invite.
    // This is a placeholder to show the concept.
    alert(`An invite for the ${role} role on "${selectedProject?.title}" would be sent here.`);
    // To make it interactive, we'll remove the role from the results.
    setResults(prevResults => prevResults.filter(r => r.role !== role));
  };

  const handleViewPortfolio = (collaborator: Collaborator) => {
      setSelectedCollaborator(collaborator);
      setPortfolioModalOpen(true);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-text mb-2">Find Talent</h1>
      <p className="text-brand-text-muted mb-8">Select one of your projects to find AI-suggested collaborators for the roles you need.</p>

      <Card className="mb-8">
        <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="project-select" className="block text-sm font-medium text-brand-text-muted mb-2">Select a Project to Staff</label>
              <select
                  id="project-select"
                  value={selectedProjectId}
                  onChange={e => {
                    setSelectedProjectId(e.target.value);
                    setResults([]);
                    setError(null);
                  }}
                  className="w-full bg-brand-surface border border-brand-subtle rounded-md px-3 py-2 text-brand-text placeholder-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
              >
                  <option value="" disabled>Choose a project...</option>
                  {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
              </select>
              {user && projects.length === 0 && <p className="text-sm text-brand-muted mt-2">All your projects are fully staffed! <Link to="/create-project" className="text-brand-primary hover:underline">Create a new project</Link> to find talent.</p>}
            </div>

            {selectedProject && (
                <div>
                  <label className="block text-sm font-medium text-brand-text-muted mb-2">Searching for the following roles:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.rolesNeeded.map(role => (
                        <span key={role} className="bg-brand-subtle text-brand-text-muted px-3 py-1.5 rounded-full text-sm font-medium">{role}</span>
                    ))}
                  </div>
                </div>
            )}

            <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isLoading || !selectedProjectId}>
                  {isLoading ? <Spinner size="sm" /> : 'Find Collaborators'}
                </Button>
            </div>
        </form>
      </Card>

      {error && <p className="text-center text-red-400 p-4 bg-red-500/10 rounded-md">{error}</p>}
      
      {isLoading && <div className="flex justify-center py-8"><Spinner size="lg"/></div>}

      {results.length > 0 && (
        <div className="space-y-8 animate-fade-in">
          {results.map(result => (
              <div key={result.role}>
                <h2 className="text-2xl font-bold text-brand-text mb-4 border-b-2 border-brand-primary pb-2">Suggestions for: <span className="text-brand-secondary">{result.role}</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.candidates.map((collab, index) => (
                        <CollaboratorCard 
                            key={index}
                            collaborator={collab} 
                            onInvite={() => handleInvite(collab.role)}
                            onViewPortfolio={() => handleViewPortfolio(collab)}
                        />
                    ))}
                </div>
              </div>
          ))}
        </div>
      )}

      <PortfolioModal collaborator={selectedCollaborator} isOpen={isPortfolioModalOpen} onClose={() => setPortfolioModalOpen(false)} />
    </div>
  );
};

export default FindTalentPage;

