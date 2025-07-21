import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../supabaseClient';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Project } from '../types'; // Using the original Project type for structure
import { ICONS } from '../constants';
import Spinner from '../components/ui/Spinner';
import ConfirmationModal from '../components/ui/ConfirmationModal'; // Import the new modal

// A type for the data we fetch from Supabase, which is slightly different from the component's Project type
type FetchedProjectType = {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  owner_id: string;
  team_members: {
    profiles: {
      id: string;
      name: string;
      avatar_url: string;
    } | null;
  }[];
  applications: {
    id: string;
    status: string;
  }[];
};


const ProjectCard: React.FC<{ project: FetchedProjectType; onDeleteRequest: (project: FetchedProjectType) => void; isOwner: boolean; }> = ({ project, onDeleteRequest, isOwner }) => {
  const navigate = useNavigate();
  
  const statusClasses = {
    planning: 'bg-yellow-500/20 text-yellow-300',
    'in-progress': 'bg-blue-500/20 text-blue-300',
    completed: 'bg-green-500/20 text-green-300',
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDeleteRequest(project);
  };
  
  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };
  
  const pendingApplicationsCount = project.applications.filter(app => app.status === 'pending').length;

  return (
    <Card 
      onClick={handleCardClick}
      className="group h-full flex flex-col cursor-pointer"
    >
      <div className="relative flex-grow">
        {isOwner && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-[-10px] right-[-10px] z-10 p-2 bg-brand-surface/80 rounded-full text-brand-text-muted hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            aria-label="Delete project"
          >
            {ICONS.trash}
          </button>
        )}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-brand-text pr-8">{project.title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[project.status]} shrink-0`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>
        <p 
          className="mt-2 text-brand-text-muted"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>
      </div>
      <div className="mt-auto pt-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-brand-text-muted">Team</h4>
          {isOwner && pendingApplicationsCount > 0 && (
              <div className="flex items-center gap-1.5 bg-brand-secondary/20 text-brand-secondary px-2 py-1 rounded-full text-xs font-semibold">
                {React.cloneElement(ICONS.clipboardCheck, { className: "h-4 w-4" })}
                <span>{pendingApplicationsCount}</span>
              </div>
          )}
        </div>
        <div className="flex -space-x-2">
          {project.team_members.slice(0, 5).map((member, index) => (
            member.profiles ? (
              <img 
                key={member.profiles.id}
                src={member.profiles.avatar_url}
                alt={member.profiles.name}
                title={member.profiles.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-surface"
              />
            ) : null
          ))}
          {project.team_members.length > 5 && (
             <div className="h-8 w-8 rounded-full bg-brand-subtle flex items-center justify-center text-white text-xs font-bold ring-2 ring-brand-surface">
                +{project.team_members.length - 5}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const { user } = useAppContext();
  const [projects, setProjects] = useState<FetchedProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<FetchedProjectType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: ownedProjects, error: ownedError } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);

    const { data: memberProjects, error: memberError } = await supabase
      .from('team_members')
      .select('project_id')
      .eq('user_id', user.id);

    if (ownedError || memberError) {
      console.error("Error fetching project associations:", ownedError || memberError);
      setLoading(false);
      return;
    }
    
    const ownedIds = ownedProjects?.map(p => p.id) || [];
    const memberIds = memberProjects?.map(p => p.project_id) || [];
    const projectIds = [...new Set([...ownedIds, ...memberIds])];

    if (projectIds.length === 0) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        title,
        description,
        status,
        owner_id,
        team_members (
          profiles (
            id,
            name,
            avatar_url
          )
        ),
        applications (
          id,
          status
        )
      `)
      .in('id', projectIds);

    if (error) {
      console.error("Error fetching projects:", error);
    } else if (data) {
      setProjects(data as unknown as FetchedProjectType[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleOpenDeleteModal = (project: FetchedProjectType) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setProjectToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    const { error } = await supabase.from('projects').delete().eq('id', projectToDelete.id);
    
    if (error) {
      alert("Error deleting project: " + error.message);
    } else {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
    }
    
    setIsDeleting(false);
    handleCloseDeleteModal();
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Spinner size="lg" />
        </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-text">My Projects</h1>
        <Link to="/create-project">
          <Button>+ New Project</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onDeleteRequest={handleOpenDeleteModal} 
              isOwner={project.owner_id === user?.id}
            />
          )
        )}
      </div>

      {!loading && projects.length === 0 && (
          <div className="col-span-full text-center py-16 border-2 border-dashed border-brand-subtle rounded-lg">
              <h3 className="text-xl font-semibold text-brand-text">No projects yet!</h3>
              <p className="mt-2 text-brand-text-muted">Click "+ New Project" to get started, or check the "Discover" page for opportunities.</p>
          </div>
      )}

      {projectToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteProject}
          title={`Delete Project: ${projectToDelete.title}`}
          message="Are you sure you want to delete this project? This action is permanent and cannot be undone."
          confirmButtonText="Delete"
          isConfirming={isDeleting}
        />
      )}
    </div>
  );
};

export default DashboardPage;