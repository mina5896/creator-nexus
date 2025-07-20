
import React, { useState } from 'react';
import { findCollaborators, TalentSearchResult } from '../services/geminiService';
import { Collaborator } from '../types';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useAppContext } from '../contexts/AppContext';
import { Link } from 'react-router-dom';

const PortfolioModal: React.FC<{ collaborator: Collaborator | null; isOpen: boolean; onClose: () => void }> = ({ collaborator, isOpen, onClose }) => {
    if (!collaborator) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${collaborator.name}'s Portfolio`}>
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold text-brand-text">{collaborator.name}</h3>
                    <p className="text-brand-secondary font-semibold">{collaborator.role}</p>
                    <p className="text-sm text-brand-text-muted mt-1 italic">Specialty: {collaborator.specialty}</p>
                </div>
                <p className="text-brand-text-muted">{collaborator.bio}</p>
                <div>
                    <h4 className="text-lg font-semibold text-brand-text mb-4">Work Examples</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-2">
                        {collaborator.portfolio.map((item, index) => (
                            <div key={index} className="bg-brand-subtle rounded-lg overflow-hidden">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <h5 className="font-bold text-brand-text">{item.title}</h5>
                                    <p className="text-sm text-brand-text-muted mt-1">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={onClose}>Close</Button>
                </div>
            </div>
        </Modal>
    );
};

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
  const { projects, user, sendInvite } = useAppContext();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TalentSearchResult[]>([]);
  const [isPortfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  
  const projectsWithRolesNeeded = projects.filter(p => p.ownerId === user.id && p.rolesNeeded.length > 0 && p.status !== 'completed');
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      setError("Please select a project.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setResults([]);

    try {
      const collaborators = await findCollaborators(selectedProject.description, selectedProject.rolesNeeded);
      setResults(collaborators);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInvite = (role: string) => {
    if (!selectedProjectId) return;
    sendInvite(selectedProjectId, role);
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
                  {projectsWithRolesNeeded.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
              </select>
              {projects.length > 0 && projectsWithRolesNeeded.length === 0 && <p className="text-sm text-brand-muted mt-2">All your projects are fully staffed! Create a new project to find more talent.</p>}
              {projects.length === 0 && <p className="text-sm text-brand-muted mt-2">You don't have any projects yet. <Link to="/create-project" className="text-brand-primary hover:underline">Create one first!</Link></p>}
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

      {error && <p className="text-center text-red-400">{error}</p>}
      
      {isLoading && <div className="flex justify-center py-8"><Spinner size="lg"/></div>}

      {results.length > 0 && (
        <div className="space-y-8">
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
